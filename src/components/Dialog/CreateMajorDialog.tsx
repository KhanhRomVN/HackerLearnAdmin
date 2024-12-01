import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface Major {
  id: string;
  name: string;
  image7x4Url: string;
}

interface CreateMajorDialogProps {
  onCreateMajor: (name: string, imageUrl: string) => Promise<void>;
  initialData?: Major;
  mode?: "create" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateMajorDialog({ 
  onCreateMajor, 
  initialData,
  mode = "create",
  open,
  onOpenChange
}: CreateMajorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setImageUrl(initialData.image7x4Url);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name || !imageUrl) return;
    
    setIsSubmitting(true);
    try {
      await onCreateMajor(name, imageUrl);
      if (mode === "create") {
        setName("");
        setImageUrl("");
      }
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogProps = {
    open: open !== undefined ? open : isOpen,
    onOpenChange: onOpenChange || setIsOpen,
  };

  return (
    <Dialog {...dialogProps} >
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2" variant="outline">
            <Plus className="h-4 w-4" /> Add New Major
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-dialog-background">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Major" : "Edit Major"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new major for your educational program."
              : "Edit the existing major information."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Major Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter major name"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              if (onOpenChange) {
                onOpenChange(false);
              } else {
                setIsOpen(false);
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !imageUrl}
          >
            {isSubmitting 
              ? mode === "create" ? "Creating..." : "Updating..." 
              : mode === "create" ? "Create Major" : "Update Major"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}