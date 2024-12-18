import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadBalancerService } from "@/api";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Eye, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { NavbarCourse } from "./NavbarCourse";
import { ImageUploadTooltip } from "./ImageUploadTooltip";
import { EditableCell } from "./EditableCell";
import { useNavigate } from "react-router-dom";
import { SearchCourseTable } from "./SearchCourseTable";

interface Course {
  id: string;
  name: string;
  overview: string;
  level: string;
  price: number;
  duration: number;
  enrolled_students: number;
  status: string;
  created_at: string;
  updated_at: string;
  image_url: string;
  requirements_course_id: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

const tableAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function CourseTable() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Course;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchResults, setSearchResults] = useState<Course[] | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "name", label: "Name", visible: true },
    { key: "overview", label: "Overview", visible: false },
    { key: "level", label: "Level", visible: true },
    { key: "price", label: "Price", visible: true },
    { key: "duration", label: "Duration", visible: true },
    { key: "enrolled_students", label: "Enrolled", visible: true },
    { key: "requirements_course_id", label: "Requirements", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "created_at", label: "Created", visible: true },
  ]);

  useEffect(() => {
    const fetchCourses = async () => {
      const api = new LoadBalancerService();
      try {
        // Fetch current page
        const response = await api.getPublic({
          endpoint: `/course/all?page=${currentPage}`,
        });
        
        // Fetch next page to check if it exists
        const nextPageResponse = await api.getPublic({
          endpoint: `/course/all?page=${currentPage + 1}`,
        });

        if (response.data) {
          if (Array.isArray(response.data)) {
            setCourses(response.data as Course[]);
            // Check if next page has courses
            setHasNextPage(
              Array.isArray(nextPageResponse.data) && 
              nextPageResponse.data.length > 0
            );
          } else if (typeof response.data === 'object' && 
                     ('message' in response.data || 'error' in response.data)) {
            setCourses([]);
            setHasNextPage(false);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }

    const api = new LoadBalancerService();
    try {
      const response = await api.getPublic({
        endpoint: `/course/search?name=${encodeURIComponent(searchTerm)}`,
      });
      
      if (response.data) {
        setSearchResults(response.data as Course[]);
      }
    } catch (error) {
      console.error("Error searching courses:", error);
      toast.error("Failed to search courses");
    }
  };

  const handleSort = (key: keyof Course) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = [...courses].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredCourses = sortedCourses;

  const toggleColumn = (columnKey: string) => {
    setColumns(columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    toast.success("Course deleted successfully");
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleUpdateCourse = (courseId: string, updates: Partial<Course>) => {
    if (searchResults) {
      setSearchResults(searchResults.map(course =>
        course.id === courseId ? { ...course, ...updates } : course
      ));
    } else {
      setCourses(courses.map(course =>
        course.id === courseId ? { ...course, ...updates } : course
      ));
    }
  };

  const renderCellContent = (course: Course, key: string) => {
    switch (key) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <img 
                src={course.image_url} 
                alt={course.name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              />
              <div className="hidden group-hover:block absolute left-0 mt-2">
                <ImageUploadTooltip
                  courseId={course.id}
                  currentImageUrl={course.image_url}
                  onUpdate={(newImageUrl) => {
                    handleUpdateCourse(course.id, { image_url: newImageUrl });
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <EditableCell
                value={course.name}
                courseId={course.id}
                fieldKey="name"
                onUpdate={(newValue) => {
                  handleUpdateCourse(course.id, { name: newValue });
                }}
              />
              <span className="text-sm text-muted-foreground line-clamp-1">
                <EditableCell
                  value={course.overview}
                  courseId={course.id}
                  fieldKey="overview"
                  onUpdate={(newValue) => {
                    handleUpdateCourse(course.id, { overview: newValue });
                  }}
                />
              </span>
            </div>
          </div>
        );

      case 'level':
        return (
          <EditableCell
            value={course.level}
            courseId={course.id}
            fieldKey="level"
            type="select"
            options={['Beginner', 'Intermediate', 'Advanced']}
            onUpdate={(newValue) => {
              handleUpdateCourse(course.id, { level: newValue });
            }}
          />
        );

      case 'price':
        return (
          <EditableCell
            value={course.price}
            courseId={course.id}
            fieldKey="price"
            type="number"
            onUpdate={(newValue) => {
              handleUpdateCourse(course.id, { price: Number(newValue) });
            }}
          />
        );

      case 'duration':
        return (
          <EditableCell
            value={course.duration}
            courseId={course.id}
            fieldKey="duration"
            type="number"
            onUpdate={(newValue) => {
              handleUpdateCourse(course.id, { duration: Number(newValue) });
            }}
          />
        );

      case 'enrolled_students':
        return (
          <Badge variant="outline">
            {course.enrolled_students} students
          </Badge>
        );

      case 'status':
        return (
          <EditableCell
            value={course.status}
            courseId={course.id}
            fieldKey="status"
            type="select"
            options={['active', 'inactive', 'draft']}
            onUpdate={(newValue) => {
              handleUpdateCourse(course.id, { status: newValue });
            }}
          />
        );

      case 'requirements_course_id':
        return (
          <span className="text-muted-foreground">
            {course.requirements_course_id}
          </span>
        );

      case 'created_at':
        return (
          <span className="text-muted-foreground">
            {formatDistance(new Date(course.created_at), new Date(), {
              addSuffix: true,
            })}
          </span>
        );

      default:
        return course[key as keyof Course];
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <NavbarCourse 
        columns={columns} 
        onToggleColumn={toggleColumn}
        onSearch={handleSearch}
      />
      
      {searchResults ? (
        <SearchCourseTable 
          searchResults={searchResults} 
          columns={columns}
          onUpdateCourse={handleUpdateCourse}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-md border shadow-sm bg-background-primary"
        >
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <TableRow className="bg-gray-100 dark:bg-gray-800 border-b">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourses(courses.map(c => c.id));
                        } else {
                          setSelectedCourses([]);
                        }
                      }}
                      checked={selectedCourses.length === courses.length}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  {columns
                    .filter(col => col.visible)
                    .map((column) => (
                      <TableHead 
                        key={column.key}
                        className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                        onClick={() => handleSort(column.key as keyof Course)}
                      >
                        {column.label}
                        {sortConfig?.key === column.key && (
                          <span className="ml-2">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </TableHead>
                    ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredCourses.map((course) => (
                    <motion.tr
                      key={course.id}
                      {...tableAnimations}
                      className={`
                        border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                        ${selectedCourses.includes(course.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                      `}
                    >
                      <TableCell className="border-r">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleSelectCourse(course.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      {columns
                        .filter(col => col.visible)
                        .map((column) => (
                          <TableCell key={column.key} className="border-r">
                            {renderCellContent(course, column.key)}
                          </TableCell>
                        ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => navigate(`/chapter/${encodeURIComponent(course.id)}`)}
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              View Chapter
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-600"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
              <tfoot className="bg-gray-50 dark:bg-gray-800/50 border-t">
                <tr>
                  <td colSpan={columns.filter(col => col.visible).length + 2}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm text-muted-foreground">
                        Showing {courses.length} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                          disabled={currentPage === 0}
                          className="hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Previous
                        </Button>
                        <span className="mx-2">Page {currentPage + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={!hasNextPage}
                          className="hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
}