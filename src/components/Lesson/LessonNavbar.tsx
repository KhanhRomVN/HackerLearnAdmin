// src/components/Lesson/LessonNavbar.tsx
import { Search, Download, Upload, Trash2, Columns } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddLessonTooltip } from "@/components/Lesson/AddLessonTooltip";

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface LessonNavbarProps {
  columns: ColumnConfig[];
  onToggleColumn: (columnKey: string) => void;
  onSearch: (searchTerm: string) => void;
  chapterId: string;
}

export function LessonNavbar({ columns, onToggleColumn, onSearch, chapterId }: LessonNavbarProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Title */}
        <h1 className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          Lesson Management
        </h1>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              placeholder="Search lessons..."
              className="pl-8 w-full bg-muted hover:bg-muted/80 focus:ring-2 focus:ring-primary/20 transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.key}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onToggleColumn(column.key)}
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                  readOnly
                />
                {column.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
              >
                <Download className="h-4 w-4" />
                Import/Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                Import Lessons
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer">
                <Download className="h-4 w-4" />
                Export Lessons
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
              >
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Lesson Button */}
          <AddLessonTooltip chapterId={chapterId} />
        </div>
      </div>
    </div>
  );
}