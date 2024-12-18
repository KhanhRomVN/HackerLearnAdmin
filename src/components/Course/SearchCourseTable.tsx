import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, BookOpen, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { EditableCell } from "./EditableCell";
import { ImageUploadTooltip } from "./ImageUploadTooltip";

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

interface SearchCourseTableProps {
  searchResults: Course[];
  columns: ColumnConfig[];
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
}

export function SearchCourseTable({ searchResults, columns, onUpdateCourse }: SearchCourseTableProps) {
  const navigate = useNavigate();

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
                    onUpdateCourse?.(course.id, { image_url: newImageUrl });
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
                  onUpdateCourse?.(course.id, { name: newValue });
                }}
              />
              <span className="text-sm text-muted-foreground line-clamp-1">
                <EditableCell
                  value={course.overview}
                  courseId={course.id}
                  fieldKey="overview"
                  onUpdate={(newValue) => {
                    onUpdateCourse?.(course.id, { overview: newValue });
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
              onUpdateCourse?.(course.id, { level: newValue });
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
              onUpdateCourse?.(course.id, { price: Number(newValue) });
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
              onUpdateCourse?.(course.id, { duration: Number(newValue) });
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
              onUpdateCourse?.(course.id, { status: newValue });
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-md border shadow-sm bg-background-primary"
    >
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter(col => col.visible)
                .map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchResults.map((course) => (
              <TableRow key={course.id}>
                {columns
                  .filter(col => col.visible)
                  .map((column) => (
                    <TableCell key={column.key}>
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
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}