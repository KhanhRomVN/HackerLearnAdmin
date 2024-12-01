import { useEffect, useState } from "react";
import { _GET_PUBLIC } from "@/api";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { BookOpen, Users, Calendar, DollarSign, Star, Bookmark, Search, Filter, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
interface Course {
  courseId: string;
  name: string;
  overview: string;
  level: string;
  price: number;
  startDate: string;
  endDate: string;
  enrolledStudents: number;
  image1x1Url: string;
}

interface CourseSidebarProps {
  onSelectCourse: (courseId: string) => void;
  selectedCourseId?: string;
}

interface FilterOptions {
  level: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const levelColors = {
  "Beginner": "text-green-500",
  "Intermediate": "text-yellow-500",
  "Advanced": "text-red-500",
  "Expert": "text-purple-500"
};

export function CourseSidebar({ onSelectCourse, selectedCourseId }: CourseSidebarProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    level: "all",
    sortBy: "default",
    sortOrder: 'asc'
  });


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await _GET_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/course/all`);
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return <Star className="h-4 w-4 text-green-500" />;
      case 'intermediate':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'advanced':
        return <Star className="h-4 w-4 text-red-500" />;
      default:
        return <Star className="h-4 w-4 text-purple-500" />;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterOptions.level === 'all' || filterOptions.level === '' 
      ? true 
      : course.level === filterOptions.level;
    return matchesSearch && matchesLevel;
  }).sort((a, b) => {
    if (!filterOptions.sortBy || filterOptions.sortBy === 'default') return 0;
    
    const order = filterOptions.sortOrder === 'asc' ? 1 : -1;
    
    switch (filterOptions.sortBy) {
      case 'enrolledStudents':
        return (a.enrolledStudents - b.enrolledStudents) * order;
      case 'price':
        return (a.price - b.price) * order;
      default:
        return 0;
    }
  });

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] rounded-lg border shadow-lg bg-background-primary">
    <div className="p-4 space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8 bg-search-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-sidebar-selected"
          onClick={() => navigate('/create-course')}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="bg-sidebar-selected">
              <Filter className="h-4 w-4" />
            </Button>
          </DialogTrigger>
            <DialogContent className="bg-dialog-background">
              <DialogHeader>
                <DialogTitle>Filter Courses</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Level</Label>
                  <Select
                    value={filterOptions.level}
                    onValueChange={(value) => 
                      setFilterOptions(prev => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Sort By</Label>
                  <Select
                    value={filterOptions.sortBy}
                    onValueChange={(value) => 
                      setFilterOptions(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="enrolledStudents">Enrolled Students</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filterOptions.sortBy && filterOptions.sortBy !== 'default' && (
                  <div className="grid gap-2">
                    <Label>Sort Order</Label>
                    <Select
                      value={filterOptions.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => 
                        setFilterOptions(prev => ({ ...prev, sortOrder: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Course List */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-4"
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.courseId}
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedCourseId === course.courseId 
                    ? "ring-2 ring-blue-500 shadow-blue-500/20" 
                    : "hover:ring-1 hover:ring-blue-500/50"
                }`}
                onClick={() => onSelectCourse(course.courseId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img 
                        src={course.image1x1Url} 
                        alt={course.name}
                        className="h-24 w-24 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Bookmark className="absolute top-2 right-2 h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg tracking-tight">{course.name}</h3>
                        <Badge variant="outline" className={levelColors[course.level as keyof typeof levelColors]}>
                          {getLevelIcon(course.level)}
                          <span className="ml-1">{course.level}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${course.price.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{course.enrolledStudents} students</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(course.startDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{new Date(course.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No courses found</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}