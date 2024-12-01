import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { _GET_PUBLIC, _PUT_PUBLIC } from "@/api";
import { motion } from "framer-motion";
import { Loader2, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Major {
  id: string;
  name: string;
  description: string;
  image7x4Url: string;
  image4x7Url: string | null;
}

const cleanDescription = (description: string): string => {
  return description.replace(/\[\/n\/\]/g, '\n'); // Chỉ chuyển đổi newline
};

const formatTextForSaving = (text: string): string => {
  return text.replace(/\n/g, '[/n/]'); // Chỉ chuyển đổi newline
};

export default function MajorPage() {
  const { majorId } = useParams();
  const [major, setMajor] = useState<Major | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableDescription, setEditableDescription] = useState("");

  useEffect(() => {
    const fetchMajor = async () => {
      try {
        setIsLoading(true);
        const response = await _GET_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major?id=${majorId}`);
        setMajor(response);
        setEditableDescription(cleanDescription(response.description));
      } catch (error) {
        console.error("Error fetching major:", error);
        toast.error("Failed to load major");
      } finally {
        setIsLoading(false);
      }
    };

    if (majorId) {
      fetchMajor();
    }
  }, [majorId]);

  const handleSaveDescription = async () => {
    if (!major) return;

    const formattedDescription = formatTextForSaving(editableDescription);

    try {
      await _PUT_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major/update/description`, {
        id: major.id,
        description: formattedDescription
      });
      
      setMajor({
        ...major,
        description: formattedDescription
      });
      
      setIsEditing(false);
      toast.success("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!major) {
    return <div>Major not found</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen p-6"
    >
      <div className="w-[65%] pr-6 overflow-y-auto">
        <div className="mb-6">
          <img 
            src={major.image7x4Url} 
            alt={major.name}
            className="w-full h-[300px] object-cover rounded-lg"
          />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{major.name}</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="default"
                onClick={handleSaveDescription}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            <textarea
              id="description-editor"
              value={editableDescription}
              onChange={(e) => setEditableDescription(e.target.value)}
              className="w-full h-[500px] p-4 border rounded-lg bg-sidebar-secondary text-text-secondary"
            />
          </div>
        ) : (
          <div className="space-y-2 whitespace-pre-wrap">
            {cleanDescription(major.description)}
          </div>
        )}
      </div>

      <div className="w-[35%] bg-gray-50 rounded-lg">
        {/* Future content */}
      </div>
    </motion.div>
  );
}