import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Terminal, Save, Trash2 } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface TerminalContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

const TERMINAL_TYPES = [
  'LINUX_TERMINAL',
  'WINDOWS_CMD',
  'POWERSHELL',
  'GIT_BASH',
  'MACOS_TERMINAL'
];

export const TerminalContentForm = ({ flashcardSequenceId, onSubmitSuccess }: TerminalContentFormProps) => {
  const [language, setLanguage] = useState('LINUX_TERMINAL');
  const [commands, setCommands] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCommand = () => {
    setCommands([...commands, '']);
  };

  const handleRemoveCommand = (index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
  };

  const handleCommandChange = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all commands?')) {
      setCommands(['']);
    }
  };

  const handleSubmit = async () => {
    if (commands.every(cmd => cmd.trim() === '')) {
      toast.error('Please enter at least one command');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/terminal-content',
        reqBody: {
          flashcardSequenceId,
          language,
          commands: commands.filter(cmd => cmd.trim() !== '')
        }
      });
      toast.success('Terminal content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding terminal content:', error);
      toast.error('Failed to add terminal content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTerminalPrompt = (language: string) => {
    switch (language.toUpperCase()) {
      case 'LINUX_TERMINAL': return '$ ';
      case 'WINDOWS_CMD': return 'C:\\> ';
      case 'POWERSHELL': return 'PS C:\\> ';
      case 'GIT_BASH': return 'user@git-bash $ ';
      case 'MACOS_TERMINAL': return '% ';
      default: return '$ ';
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <Terminal className="w-5 h-5 text-emerald-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Terminal Command Editor
        </h3>
      </motion.div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="terminal-type">Terminal Type</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select terminal type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {TERMINAL_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {commands.map((command, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">
                    Command {index + 1}
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-black text-white rounded-md">
                    <span className="font-mono">{getTerminalPrompt(language)}</span>
                    <Input
                      value={command}
                      onChange={(e) => handleCommandChange(index, e.target.value)}
                      placeholder="Enter command"
                      className="border-0 bg-transparent focus-visible:ring-0 font-mono text-white"
                    />
                  </div>
                </div>
                {commands.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveCommand(index)}
                    className="p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
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
          <Button
            variant="outline"
            onClick={handleAddCommand}
            className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Command
          </Button>
          
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
              Save Content
            </>
          )}
        </Button>
      </motion.div>
    </Card>
  );
};