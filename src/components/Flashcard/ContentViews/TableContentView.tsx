import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Table as TableIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  totalRows: number;
  totalColumns: number;
  headerRow: string[];
  bodyRows: string[];
}

interface TableContentViewProps {
  content: TableContent;
}

export function TableContentView({ content }: TableContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [headerRow, setHeaderRow] = useState(content.headerRow);
  const [bodyRows, setBodyRows] = useState(content.bodyRows);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = {
    primary: "emerald",
    secondary: "teal",
    accent: "green"
  };

  const chunks = (arr: string[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const bodyRowChunks = chunks(bodyRows, content.totalColumns);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headerRow];
    newHeaders[index] = value;
    setHeaderRow(newHeaders);
  };

  const handleBodyChange = (rowIndex: number, colIndex: number, value: string) => {
    const newBody = [...bodyRows];
    newBody[rowIndex * content.totalColumns + colIndex] = value;
    setBodyRows(newBody);
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/table-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          totalRows: content.totalRows,
          totalColumns: content.totalColumns,
          headerRow,
          bodyRows
        }
      });
      toast.success('Table updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Failed to update table');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn(
      "shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed",
      `border-${theme.primary}-500/50 hover:border-${theme.primary}-500`
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <TableIcon className={`h-5 w-5 text-${theme.primary}-500`} />
            <span className="text-sm font-medium text-gray-500">
              Table Content
            </span>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={`hover:bg-${theme.primary}-100`}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className={`hover:bg-${theme.primary}-100`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`space-y-4 bg-${theme.primary}-50 p-4 rounded-lg`}
            >
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${content.totalColumns}, 1fr)` }}>
                {headerRow.map((header, index) => (
                  <motion.div
                    key={`header-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(index, e.target.value)}
                      className={cn(
                        "bg-white transition-all duration-200",
                        `border-${theme.primary}-200 focus:border-${theme.primary}-500`,
                        "focus:ring-2 focus:ring-offset-2",
                        `focus:ring-${theme.primary}-500/50`
                      )}
                      placeholder={`Header ${index + 1}`}
                    />
                  </motion.div>
                ))}
              </div>

              {bodyRowChunks.map((row, rowIndex) => (
                <motion.div
                  key={`row-${rowIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (rowIndex + headerRow.length) * 0.1 }}
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${content.totalColumns}, 1fr)` }}
                >
                  {row.map((cell, colIndex) => (
                    <Input
                      key={`cell-${rowIndex}-${colIndex}`}
                      value={cell}
                      onChange={(e) => handleBodyChange(rowIndex, colIndex, e.target.value)}
                      className={cn(
                        "bg-white transition-all duration-200",
                        `border-${theme.primary}-200 focus:border-${theme.primary}-500`,
                        "focus:ring-2 focus:ring-offset-2",
                        `focus:ring-${theme.primary}-500/50`
                      )}
                      placeholder={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                    />
                  ))}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-lg overflow-hidden",
                `border border-${theme.primary}-200`
              )}
            >
              <Table>
                <TableHeader>
                  <TableRow className={cn(
                    `bg-${theme.primary}-50`,
                    `hover:bg-${theme.primary}-100`
                  )}>
                    {headerRow.map((header, index) => (
                      <TableHead 
                        key={index} 
                        className={`font-semibold text-${theme.primary}-700`}
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bodyRowChunks.map((row, rowIndex) => (
                    <TableRow 
                      key={rowIndex}
                      className={cn(
                        "transition-colors",
                        `hover:bg-${theme.primary}-50`
                      )}
                    >
                      {row.map((cell, cellIndex) => (
                        <TableCell 
                          key={cellIndex}
                          className={`border-${theme.primary}-100`}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}