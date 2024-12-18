import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Terminal, Save, Trash2, Play } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';

interface CodeContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

const LANGUAGES = [
  'javascript',
  'python',
  'java',
  'go',
  'rust',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift'
];

export const CodeContentForm = ({ flashcardSequenceId, onSubmitSuccess }: CodeContentFormProps) => {
  const [language, setLanguage] = useState('javascript');
  const [codes, setCodes] = useState<string[]>(['']);
  const [canRun, setCanRun] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'javascript':
      case 'js':
        return javascript();
      case 'python':
      case 'py':
        return python();
      case 'go':
      case 'golang':
        return go();
      case 'java':
        return java();
      case 'rust':
        return rust();
      default:
        return javascript();
    }
  };

  const handleAddCode = () => {
    setCodes([...codes, '']);
  };

  const handleRemoveCode = (index: number) => {
    const newCodes = codes.filter((_, i) => i !== index);
    setCodes(newCodes);
  };

  const handleCodeChange = (index: number, value: string) => {
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
  };

  const handleSubmit = async () => {
    if (codes.every(code => code.trim() === '')) {
      toast.error('Please enter at least one code snippet');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/code-content',
        reqBody: {
          flashcardSequenceId,
          language,
          codes: codes.filter(code => code.trim() !== ''),
          canRun
        }
      });
      toast.success('Code content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding code content:', error);
      toast.error('Failed to add code content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all code snippets?')) {
      setCodes(['']);
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <Terminal className="w-5 h-5 text-purple-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Code Content Editor
        </h3>
      </motion.div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
          <Switch
              id="can-run"
              checked={canRun}
              onCheckedChange={setCanRun}
              className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-200"
            />
            <Label htmlFor="can-run" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Executable Code
            </Label>
          </div>
        </div>

        <AnimatePresence>
          {codes.map((code, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-grow">
                  <div className="text-sm text-muted-foreground mb-2">
                    Code Snippet {index + 1}
                  </div>
                  <CodeMirror
                    value={code}
                    height="200px"
                    theme="dark"
                    extensions={[getLanguageExtension(language)]}
                    onChange={(value) => handleCodeChange(index, value)}
                    className="rounded-md overflow-hidden transition-all duration-300 focus:shadow-lg"
                  />
                </div>
                {codes.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveCode(index)}
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
            onClick={handleAddCode}
            className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Snippet
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