import { useState, useEffect } from "react";
import { Search, Plus, Download, Upload, Trash2, Columns } from "lucide-react";
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
import { AddCourseTooltip } from "./AddCourseTooltip";
interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface NavbarCourseProps {
  columns: ColumnConfig[];
  onToggleColumn: (columnKey: string) => void;
  onSearch: (searchTerm: string) => void;
}

export function NavbarCourse({ columns, onToggleColumn, onSearch }: NavbarCourseProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        onSearch(searchTerm);
      } else {
        onSearch(''); // Clear search results when search term is empty
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Title */}
        <h1 className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          Course Management
        </h1>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              placeholder="Search courses..."
              className="pl-8 w-full bg-muted hover:bg-muted/80 focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Columns Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
            >
              <Columns className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuItem 
                key={column.key} 
                className="flex items-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleColumn(column.key);
                }}
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => {}}
                  className="rounded border-gray-300"
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
                Import Courses
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-primary/10 transition-colors cursor-pointer">
                <Download className="h-4 w-4" />
                Export Courses
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

          <AddCourseTooltip />
        </div>
      </div>
    </div>
  );
}