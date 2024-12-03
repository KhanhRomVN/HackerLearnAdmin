import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  FileEdit, 
  BookOpen, 
  Save,
  X,
  Trash2,
  Info,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  CircleDot,
  Book
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CourseOverviewTab } from "./CourseOverviewTab";
import { CourseDetailsTab } from "./CourseDetailsTab";
import { CourseChapterTab } from "@/components/Course/CourseChapterTab";
import { CourseStudentTab } from "@/components/Course/CourseStudentTab";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface CourseDetail {
  id: string;
  name: string;
  overview: string;
  objectives: string[];
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  language: string[];
  status: string;
  level: string;
  image7x4Url: string;
  image1x1Url: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseDetailsProps {
  selectedCourse: CourseDetail | null;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export const CourseDetails = ({ selectedCourse, onUpdate }: CourseDetailsProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCourse, setEditedCourse] = useState<Partial<CourseDetail>>({});
  
    const handleSaveAll = async () => {
      try {
        const updatePromises = Object.entries(editedCourse).map(([field, value]) => 
          onUpdate(field, value)
        );
        await Promise.all(updatePromises);
        setIsEditing(false);
        setEditedCourse({});
      } catch (error) {
        console.error("Failed to save all changes:", error);
        toast.error("Failed to save changes");
      }
    };
  
    const handleFieldChange = (field: string, value: any) => {
      setEditedCourse(prev => ({ ...prev, [field]: value }));
    };
  
    return (
      <div className="w-[100%] h-full bg-background-primary">
        <ScrollArea className="h-full">
          {selectedCourse ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      {isEditing ? (
                        <Input
                          className="max-w-[300px] text-2xl font-bold bg-input-background backdrop-blur"
                          defaultValue={selectedCourse.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                        />
                      ) : (
                        <h1 className="text-2xl font-bold">{selectedCourse.name}</h1>
                      )}
                      <Badge variant="outline" className={cn(
                        "text-sm flex items-center gap-1.5",
                        selectedCourse.status === "PUBLISHED" && "bg-green-500/10 text-green-500 border-green-500/20",
                        selectedCourse.status === "DRAFT" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        selectedCourse.status === "PENDING" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        selectedCourse.status === "ARCHIVED" && "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      )}>
                        {selectedCourse.status === "PUBLISHED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {selectedCourse.status === "DRAFT" && <Clock className="w-3.5 h-3.5" />}
                        {selectedCourse.status === "PENDING" && <CircleDot className="w-3.5 h-3.5" />}
                        {selectedCourse.status === "ARCHIVED" && <CircleDot className="w-3.5 h-3.5" />}
                        {selectedCourse.status}
                      </Badge>
                    </motion.div>
                    
                    <div className="flex gap-2">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveAll}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false);
                              setEditedCourse({});
                            }}
                            className="gap-2 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500 transition-colors"
                          >
                            <FileEdit className="h-4 w-4" />
                            Edit Course
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2 hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
  
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 gap-4 p-1 bg-background/95 backdrop-blur rounded-xl">
                      <TabsTrigger 
                        value="overview" 
                        className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-primary/5"
                      >
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="details" 
                        className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-primary/5"
                      >
                        <Settings className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                        <span className="font-medium">Details</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="lessons" 
                        className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-primary/5"
                      >
                        <Book className="h-4 w-4" />
                        <span className="font-medium">Chapters</span>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="students" 
                        className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-primary/5"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Students</span>
                      </TabsTrigger>
                    </TabsList>
  
                    <TabsContent value="overview" className="space-y-6">
                      <CourseOverviewTab
                        selectedCourse={selectedCourse}
                        isEditing={isEditing}
                        onFieldChange={handleFieldChange}
                      />
                    </TabsContent>
  
                    <TabsContent value="details" className="space-y-6">
                      <CourseDetailsTab
                        selectedCourse={selectedCourse}
                        isEditing={isEditing}
                        onFieldChange={handleFieldChange}
                      />
                    </TabsContent>

                    <TabsContent value="lessons" className="space-y-6"> 
                      <CourseChapterTab courseId={selectedCourse.id}/>
                    </TabsContent>
  
                    <TabsContent value="students" className="space-y-6">
                      <CourseStudentTab />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">Select a course to view details</p>
              </div>
            </motion.div>
          )}
        </ScrollArea>
      </div>
    );
  };