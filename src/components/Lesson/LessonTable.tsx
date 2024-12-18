// src/components/Lesson/LessonTable.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonNavbar } from "./LessonNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

interface Lesson {
  id: string;
  name: string;
  overview: string;
  chapter_id: string;
  sequence: number;
  version: number;
  created_at: string;
  updated_at: string;
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

const ITEMS_PER_PAGE = 10;

export function LessonTable() {
  const navigate = useNavigate();

  const { id: chapterId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lesson;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "sequence", label: "Sequence", visible: true },
    { key: "name", label: "Name", visible: true },
    { key: "overview", label: "Overview", visible: true },
    { key: "version", label: "Version", visible: true },
    { key: "created_at", label: "Created At", visible: true },
  ]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const api = new LoadBalancerService();
        const response = await api.getPublic({
          endpoint: `/lesson/chapter?chapterId=${chapterId}`,
        });

        if (response.data && Array.isArray(response.data)) {
          setLessons(response.data as Lesson[]);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast.error("Failed to fetch lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [chapterId]);

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const api = new LoadBalancerService();
      await api.delete({
        endpoint: `/lesson/${lessonId}`,
      });
      
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      toast.success("Lesson deleted successfully");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Failed to delete lesson");
    }
  };

  const handleToggleColumn = (columnKey: string) => {
    setColumns(columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSort = (key: keyof Lesson) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const sortedLessons = [...lessons].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredLessons = sortedLessons.filter(lesson =>
    lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.overview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentPageLessons = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return filteredLessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages - 1;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LessonNavbar
        columns={columns}
        onToggleColumn={handleToggleColumn}
        onSearch={setSearchTerm}
        chapterId={chapterId || ""}
      />
      
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
                        setSelectedLessons(lessons.map(l => l.id));
                      } else {
                        setSelectedLessons([]);
                      }
                    }}
                    checked={selectedLessons.length === lessons.length}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                {columns.filter(col => col.visible).map(column => (
                  <TableHead 
                    key={column.key}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                    onClick={() => handleSort(column.key as keyof Lesson)}
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
                {getCurrentPageLessons().map((lesson) => (
                  <motion.tr
                    key={lesson.id}
                    {...tableAnimations}
                    className={`
                      border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                      ${selectedLessons.includes(lesson.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                    `}
                  >
                    <TableCell className="border-r">
                      <input
                        type="checkbox"
                        checked={selectedLessons.includes(lesson.id)}
                        onChange={() => handleSelectLesson(lesson.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    {columns.filter(col => col.visible).map(column => (
                      <TableCell key={column.key} className="border-r">
                        {column.key === 'created_at' 
                          ? formatDistance(new Date(lesson[column.key]), new Date(), { addSuffix: true })
                          : column.key === 'name' 
                            ? <span className="font-medium">{lesson[column.key]}</span>
                            : column.key === 'version'
                            ? <Badge variant="outline">v{lesson[column.key]}</Badge>
                            : lesson[column.key as keyof Lesson]}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
  <DropdownMenuLabel>Actions</DropdownMenuLabel>
  <DropdownMenuSeparator />
  <DropdownMenuItem 
    className="cursor-pointer"
    onClick={() => navigate(`/flashcard/${lesson.id}`)}
  >
    <Eye className="mr-2 h-4 w-4" />
    View Flashcard
  </DropdownMenuItem>
  <DropdownMenuItem className="cursor-pointer">
    <Eye className="mr-2 h-4 w-4" />
    View Details
  </DropdownMenuItem>
  <DropdownMenuItem className="cursor-pointer">
    <Edit className="mr-2 h-4 w-4" />
    Edit Lesson
  </DropdownMenuItem>
  <DropdownMenuItem
    onClick={() => handleDeleteLesson(lesson.id)}
    className="cursor-pointer text-red-600"
  >
    <Trash className="mr-2 h-4 w-4" />
    Delete Lesson
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
                      Showing {getCurrentPageLessons().length} of {filteredLessons.length} entries
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
                      <span className="mx-2">
                        Page {currentPage + 1} of {totalPages}
                      </span>
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
    </div>
  );
}