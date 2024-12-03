import { useEffect, useState } from "react";
import { _GET_PUBLIC, _POST } from "@/api";
import { motion } from "framer-motion";
import { Book, Plus, ChevronRight, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
interface Lesson {
  id: string;
  chapterId: string;
  name: string;
  overview: string;
  sequenceOrder: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  id: string;
  courseId: string;
  sequenceOrder: number;
  name: string;
  overview: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ChapterWithLessons {
  chapter: Chapter;
  lessons: Lesson[];
}

const gradients = [
  "from-blue-500 to-purple-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
];

export const CourseChapterTab = ({ courseId }: { courseId?: string }) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleChapters, setVisibleChapters] = useState<{ [key: string]: boolean }>({});
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null); // stores chapterId when adding lesson
  const [newChapter, setNewChapter] = useState({
    name: "",
    overview: ""
  });
  const [newLesson, setNewLesson] = useState({
    name: "",
    overview: ""
  });

  const fetchChapters = async () => {
    if (!courseId) return;
    
    try {
      const data = await _GET_PUBLIC(
        `${import.meta.env.VITE_MAJOR_SERVICE}/chapter/get-all-chapter-and-all-lesson?courseId=${courseId}`
      );
      setChapters(data);
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const toggleChapterVisibility = (chapterId: string) => {
    setVisibleChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleCreateChapter = async () => {
    try {
      const sequence_order = chapters.length + 1;
      
      await _POST(`${import.meta.env.VITE_MAJOR_SERVICE}/chapter/create`, {
        courseId,
        sequence_order,
        name: newChapter.name,
        overview: newChapter.overview
      });

      setNewChapter({ name: "", overview: "" });
      setIsAddingChapter(false);
      toast.success("Chapter created successfully");
      fetchChapters();
      
    } catch (error) {
      console.error("Failed to create chapter:", error);
      toast.error("Failed to create chapter");
    }
  };

  const handleCreateLesson = async (chapterId: string) => {
    try {
      const chapter = chapters.find(c => c.chapter.id === chapterId);
      if (!chapter) return;

      const sequence_order = chapter.lessons.length + 1;
      
      await _POST(`${import.meta.env.VITE_MAJOR_SERVICE}/lesson/create`, {
        chapterId,
        sequence_order,
        name: newLesson.name,
        overview: newLesson.overview
      });

      setNewLesson({ name: "", overview: "" });
      setIsAddingLesson(null);
      toast.success("Lesson created successfully");
      fetchChapters();
      
    } catch (error) {
      console.error("Failed to create lesson:", error);
      toast.error("Failed to create lesson");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!courseId || chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Chapters Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start creating chapters and lessons for your course.
        </p>
        {isAddingChapter ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg p-4 bg-accent/50"
          >
            <div className="space-y-4">
              <Input
                placeholder="Chapter Name"
                value={newChapter.name}
                onChange={(e) => setNewChapter(prev => ({ ...prev, name: e.target.value }))}
                className="bg-input-background"
              />
              <Textarea
                placeholder="Chapter Overview"
                value={newChapter.overview}
                onChange={(e) => setNewChapter(prev => ({ ...prev, overview: e.target.value }))}
                className="bg-input-background"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingChapter(false);
                    setNewChapter({ name: "", overview: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChapter}
                  disabled={!newChapter.name || !newChapter.overview}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Create Chapter
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <Button 
            className="gap-2"
            onClick={() => setIsAddingChapter(true)}
          >
            <Plus className="h-4 w-4" />
            Add First Chapter
          </Button>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Course Content</h2>
          <Button 
            className="gap-2"
            onClick={() => setIsAddingChapter(true)}
          >
            <Plus className="h-4 w-4" />
            Add Chapter
          </Button>
        </div>

        <div className="space-y-4">
          {isAddingChapter && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 bg-accent/50"
            >
              <div className="space-y-4">
                <Input
                  placeholder="Chapter Name"
                  value={newChapter.name}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-input-background"
                />
                <Textarea
                  placeholder="Chapter Overview"
                  value={newChapter.overview}
                  onChange={(e) => setNewChapter(prev => ({ ...prev, overview: e.target.value }))}
                  className="bg-input-background"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingChapter(false);
                      setNewChapter({ name: "", overview: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChapter}
                    disabled={!newChapter.name || !newChapter.overview}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Chapter
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {chapters.map((chapterData, index) => (
            <motion.div
              key={chapterData.chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border-none">
                <div 
                  className="hover:no-underline cursor-pointer"
                  onClick={() => toggleChapterVisibility(chapterData.chapter.id)}
                >
                  <div className={`w-full p-4 rounded-lg bg-gradient-to-r ${gradients[index % gradients.length]} hover:opacity-90 transition-opacity`}>
                    <div className="flex justify-between items-center text-white">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Chapter {chapterData.chapter.sequenceOrder}: {chapterData.chapter.name}
                        </h3>
                        <p className="text-sm opacity-90">{chapterData.chapter.overview}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ChevronRight 
                            className={`h-4 w-4 text-white transition-transform ${
                              visibleChapters[chapterData.chapter.id] ? 'rotate-90' : ''
                            }`} 
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {visibleChapters[chapterData.chapter.id] && (
                  <div className="pt-4 pl-4">
                    <div className="space-y-3">
                      {chapterData.lessons.map((lesson, lessonIndex) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lessonIndex * 0.05 }}
                        >
                          <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors group border-b" onClick={() => navigate(`/lesson/${lesson.id}`)}>
                            <div className="flex-1">
                              <h4 className="font-medium">Lesson {lesson.sequenceOrder}: {lesson.name}</h4>
                              <p className="text-sm text-muted-foreground">{lesson.overview}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {isAddingLesson === chapterData.chapter.id ? (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 bg-accent/50"
                        >
                          <div className="space-y-4">
                            <Input
                              placeholder="Lesson Name"
                              value={newLesson.name}
                              onChange={(e) => setNewLesson(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-input-background"
                            />
                            <Textarea
                              placeholder="Lesson Overview"
                              value={newLesson.overview}
                              onChange={(e) => setNewLesson(prev => ({ ...prev, overview: e.target.value }))}
                              className="bg-input-background"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAddingLesson(null);
                                  setNewLesson({ name: "", overview: "" });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleCreateLesson(chapterData.chapter.id)}
                                disabled={!newLesson.name || !newLesson.overview}
                                className="gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Create Lesson
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          className="gap-2 w-full justify-start text-muted-foreground hover:text-primary"
                          onClick={() => setIsAddingLesson(chapterData.chapter.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Add New Lesson
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};