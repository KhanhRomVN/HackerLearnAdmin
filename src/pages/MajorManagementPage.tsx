import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { _GET_PUBLIC, _POST_PUBLIC, _DELETE_PUBLIC, _PUT_PUBLIC } from "@/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { CreateMajorDialog } from "@/components/Dialog/CreateMajorDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Major {
  id: string;
  name: string;
  image7x4Url: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const MajorManagementPage = () => {
  const navigate = useNavigate();
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      const response = await _GET_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major/all`);
      setMajors(response);
    } catch (error) {
      console.error("Error fetching majors:", error);
      toast.error("Failed to load majors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMajor = async (name: string, imageUrl: string) => {
    try {
      await _POST_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major`, {
        name,
        image7x4Url: imageUrl
      });
      await fetchMajors();
      toast.success("Major created successfully");
    } catch (error) {
      console.error("Error creating major:", error);
      toast.error("Failed to create major");
      throw error;
    }
  };

  const handleEditMajor = async (id: string, name: string, imageUrl: string) => {
    try {
      await _PUT_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major/${id}`, {
        name,
        image7x4Url: imageUrl
      });
      await fetchMajors();
      toast.success("Major updated successfully");
      setIsEditDialogOpen(false);
      setSelectedMajor(null);
    } catch (error) {
      console.error("Error updating major:", error);
      toast.error("Failed to update major");
    }
  };

  const handleDeleteMajor = async () => {
    if (!selectedMajor) return;

    try {
      await _DELETE_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/major/${selectedMajor.id}`);
      await fetchMajors();
      toast.success("Major deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMajor(null);
    } catch (error) {
      console.error("Error deleting major:", error);
      toast.error("Failed to delete major");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading majors...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      {/* Header Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex gap-2">
          <h1 className="text-2xl font-bold">Major Management</h1>
        </div>
        
        <CreateMajorDialog onCreateMajor={handleAddMajor} />
      </motion.div>

      {/* Grid Layout */}
      <AnimatePresence>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {majors?.map((major) => (
            <motion.div
              key={major.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="h-full cursor-pointer"
              layout
              onClick={() => navigate(`/major/${major.id}`)}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader className="relative p-0">
                  <img
                    src={major.image7x4Url}
                    alt={major.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 rounded-t-lg"
                  >
                    <Button 
                      size="icon" 
                      variant="secondary"
                      className="hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMajor(major);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      className="hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMajor(major);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-xl line-clamp-2">
                    {major.name}
                  </CardTitle>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the major
              "{selectedMajor?.name}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMajor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {selectedMajor && (
        <CreateMajorDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onCreateMajor={(name, imageUrl) => handleEditMajor(selectedMajor.id, name, imageUrl)}
          initialData={selectedMajor}
          mode="edit"
        />
      )}
    </motion.div>
  );
};

export default MajorManagementPage;