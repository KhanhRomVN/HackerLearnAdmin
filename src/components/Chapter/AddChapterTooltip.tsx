// src/components/Chapter/AddChapterTooltip.tsx
import { useState, useEffect } from "react";
import { LoadBalancerService } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "react-hot-toast";
import { Plus, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Chapter {
  id: string;
  name: string;
  overview: string;
  sequence: number;
  course_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface AddChapterTooltipProps {
  courseId: string;
}

interface FormData {
  name: string;
  overview: string;
  sequence: number;
}

interface ValidationError {
  field: keyof FormData;
  message: string;
}

export function AddChapterTooltip({ courseId }: AddChapterTooltipProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    overview: "",
    sequence: 1,
  });
  const [nextSequence, setNextSequence] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fetch current max sequence when component mounts or popover opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrentSequence();
    }
  }, [isOpen, courseId]);

  const fetchCurrentSequence = async () => {
    setIsLoading(true);
    try {
      const api = new LoadBalancerService();
      const response = await api.getPublic({
        endpoint: `/chapter?courseId=${courseId}`,
      });

      if (response.data && Array.isArray(response.data)) {
        const chapters = response.data as Chapter[];
        const maxSequence = chapters.reduce((max, chapter) => 
          Math.max(max, chapter.sequence), 0);
        const nextSeq = maxSequence + 1;
        setNextSequence(nextSeq);
        setFormData(prev => ({ ...prev, sequence: nextSeq }));
      }
    } catch (error) {
      console.error("Error fetching chapters for sequence:", error);
      toast.error("Failed to determine next sequence number");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFormData = (data: FormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate name
    if (!data.name.trim()) {
      errors.push({ field: 'name', message: "Chapter name is required" });
    } else if (data.name.length < 3) {
      errors.push({ field: 'name', message: "Chapter name must be at least 3 characters" });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: "Chapter name must be less than 100 characters" });
    }

    // Validate overview
    if (!data.overview.trim()) {
      errors.push({ field: 'overview', message: "Chapter overview is required" });
    } else if (data.overview.length < 10) {
      errors.push({ field: 'overview', message: "Overview must be at least 10 characters" });
    } else if (data.overview.length > 500) {
      errors.push({ field: 'overview', message: "Overview must be less than 500 characters" });
    }

    // Validate sequence
    if (data.sequence !== nextSequence) {
      errors.push({ field: 'sequence', message: `Sequence must be ${nextSequence}` });
    }

    return errors;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      overview: "",
      sequence: nextSequence,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate form data
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error.message));
        return;
      }

      // Ensure sequence is correct before submission
      const dataToSubmit = {
        ...formData,
        sequence: nextSequence,
        course_id: courseId,
      };

      const api = new LoadBalancerService();
      const response = await api.postPublic({
        endpoint: "/chapter",
        reqBody: dataToSubmit,
      });

      if (response.status === 201) {
        toast.success("Chapter created successfully");
        resetForm();
        setNextSequence(prev => prev + 1);
        setIsOpen(false);
        window.location.reload(); // Consider using a callback instead
      } else {
        toast.error("Failed to create chapter");
      }
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error("Failed to create chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          className="flex items-center gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          Add Chapter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-background-primary">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Add New Chapter</h4>
            <p className="text-sm text-muted-foreground">
              Create a new chapter for this course
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Chapter Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter chapter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Must be between 3 and 100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">
                  Overview <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="overview"
                  placeholder="Enter chapter overview"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  disabled={isSubmitting}
                  className="min-h-[100px] focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Must be between 10 and 500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">Sequence Number</Label>
                <Input
                  id="sequence"
                  type="number"
                  value={nextSequence}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Sequence is automatically set to maintain chapter order
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isSubmitting || !formData.name || !formData.overview}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Chapter'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}