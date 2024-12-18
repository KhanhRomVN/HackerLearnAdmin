import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Table as TableIcon, Save, Trash2 } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface TableContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const TableContentForm = ({ flashcardSequenceId, onSubmitSuccess }: TableContentFormProps) => {
  const [columns, setColumns] = useState(2);
  const [rows, setRows] = useState(2);
  const [headerRow, setHeaderRow] = useState<string[]>(Array(2).fill(''));
  const [bodyRows, setBodyRows] = useState<string[]>(Array(2 * 2).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headerRow];
    newHeaders[index] = value;
    setHeaderRow(newHeaders);
  };

  const handleBodyChange = (index: number, value: string) => {
    const newBody = [...bodyRows];
    newBody[index] = value;
    setBodyRows(newBody);
  };

  const handleAddColumn = () => {
    if (columns >= 6) {
      toast.error('Maximum 6 columns allowed');
      return;
    }
    setColumns(prev => prev + 1);
    setHeaderRow(prev => [...prev, '']);
    setBodyRows(prev => {
      const newRows = [...prev];
      for (let i = 0; i < rows; i++) {
        newRows.splice((i + 1) * (columns + 1) - 1, 0, '');
      }
      return newRows;
    });
  };

  const handleRemoveColumn = () => {
    if (columns <= 2) {
      toast.error('Minimum 2 columns required');
      return;
    }
    setColumns(prev => prev - 1);
    setHeaderRow(prev => prev.slice(0, -1));
    setBodyRows(prev => {
      const newRows = [...prev];
      for (let i = rows - 1; i >= 0; i--) {
        newRows.splice(i * columns + (columns - 1), 1);
      }
      return newRows;
    });
  };

  const handleAddRow = () => {
    if (rows >= 10) {
      toast.error('Maximum 10 rows allowed');
      return;
    }
    setRows(prev => prev + 1);
    setBodyRows(prev => [...prev, ...Array(columns).fill('')]);
  };

  const handleRemoveRow = () => {
    if (rows <= 2) {
      toast.error('Minimum 2 rows required');
      return;
    }
    setRows(prev => prev - 1);
    setBodyRows(prev => prev.slice(0, -columns));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all cells?')) {
      setHeaderRow(Array(columns).fill(''));
      setBodyRows(Array(rows * columns).fill(''));
    }
  };

  const handleSubmit = async () => {
    if (headerRow.some(header => !header.trim())) {
      toast.error('Please fill all header cells');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/table-content',
        reqBody: {
          flashcardSequenceId,
          totalRows: rows,
          totalColumns: columns,
          headerRow,
          bodyRows
        }
      });
      toast.success('Table content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding table content:', error);
      toast.error('Failed to add table content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <TableIcon className="w-5 h-5 text-purple-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Table Content Editor
        </h3>
      </motion.div>

      <div className="bg-purple-50 rounded-lg p-4 space-y-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
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
                  placeholder={`Header ${index + 1}`}
                  className="bg-white border-purple-200 focus:border-purple-500"
                />
              </motion.div>
            ))}
          </motion.div>

          {Array(rows).fill(0).map((_, rowIndex) => (
            <motion.div 
              key={`row-${rowIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (rowIndex + headerRow.length) * 0.1 }}
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array(columns).fill(0).map((_, colIndex) => (
                <Input
                  key={`cell-${rowIndex}-${colIndex}`}
                  value={bodyRows[rowIndex * columns + colIndex]}
                  onChange={(e) => handleBodyChange(rowIndex * columns + colIndex, e.target.value)}
                  placeholder={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                  className="bg-white border-purple-200 focus:border-purple-500"
                />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
      className="flex justify-between items-center pt-4 border-t"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Table Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white">
            <DropdownMenuItem 
              onClick={handleAddColumn}
              className="flex items-center cursor-pointer hover:bg-purple-50"
              disabled={columns >= 6}
            >
              <Plus className="h-4 w-4 mr-2 text-purple-500" />
              <span>Add Column</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRemoveColumn}
              className="flex items-center cursor-pointer hover:bg-purple-50"
              disabled={columns <= 2}
            >
              <Minus className="h-4 w-4 mr-2 text-purple-400" />
              <span>Remove Column</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleAddRow}
              className="flex items-center cursor-pointer hover:bg-pink-50"
              disabled={rows >= 10}
            >
              <Plus className="h-4 w-4 mr-2 text-pink-500" />
              <span>Add Row</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRemoveRow}
              className="flex items-center cursor-pointer hover:bg-pink-50"
              disabled={rows <= 2}
            >
              <Minus className="h-4 w-4 mr-2 text-pink-400" />
              <span>Remove Row</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={handleClearAll}
          className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="min-w-[120px] transition-all duration-200 hover:shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Saving...
          </div>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Table
          </>
        )}
      </Button>
    </motion.div>
  </Card>
)
};