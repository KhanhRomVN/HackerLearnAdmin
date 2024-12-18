import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Copy, Check, Play, Terminal } from "lucide-react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  language: string;
  codes: string[];
  canRun: boolean;
}

interface CodeContentViewProps {
  content: CodeContent;
}

export function CodeContentView({ content }: CodeContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [codes, setCodes] = useState(content.codes);
  const [activeTab, setActiveTab] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<boolean[]>(new Array(content.codes.length).fill(false));

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

  const handleCodeChange = (index: number, value: string) => {
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
  };

  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      const newCopied = [...copied];
      newCopied[index] = true;
      setCopied(newCopied);
      toast.success('Code copied to clipboard');
      setTimeout(() => {
        const resetCopied = [...copied];
        resetCopied[index] = false;
        setCopied(resetCopied);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/code-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          language: content.language,
          codes,
          canRun: content.canRun
        }
      });
      toast.success('Content updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunCode = (code: string) => {
    console.log(code);
    toast.success('Code execution not implemented yet');
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-purple-500/50 hover:border-purple-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-500">
              {content.language.toUpperCase()} Code
            </span>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-purple-100"
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
                className="hover:bg-green-100"
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {codes.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                Example {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {codes.map((code, index) => (
              <TabsContent key={index} value={index.toString()}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative"
                >
                  <div className="absolute right-2 top-2 flex gap-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(code, index)}
                      className="bg-black/50 hover:bg-black/70 text-white"
                    >
                      {copied[index] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {content.canRun && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRunCode(code)}
                        className="bg-black/50 hover:bg-black/70 text-white"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <CodeMirror
                    value={isEditing ? code : code}
                    height="200px"
                    theme="dark"
                    extensions={[getLanguageExtension(content.language)]}
                    onChange={(value) => isEditing && handleCodeChange(index, value)}
                    editable={isEditing}
                    className="rounded-md overflow-hidden"
                  />
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}