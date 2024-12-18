import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Copy, Check, Terminal } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadBalancerService } from "@/api";

interface TerminalContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  language: string;
  commands: string[];
}

interface TerminalContentViewProps {
  content: TerminalContent;
}

export function TerminalContentView({ content }: TerminalContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [commands, setCommands] = useState(content.commands);
  const [activeTab, setActiveTab] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState<boolean[]>(new Array(content.commands.length).fill(false));

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

  const handleCommandChange = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  const handleCopy = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      const newCopied = [...copied];
      newCopied[index] = true;
      setCopied(newCopied);
      toast.success('Command copied to clipboard');
      setTimeout(() => {
        const resetCopied = [...copied];
        resetCopied[index] = false;
        setCopied(resetCopied);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy command');
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/terminal-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          language: content.language,
          commands
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

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-emerald-500/50 hover:border-emerald-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-500">
              {content.language.replace(/_/g, ' ')}
            </span>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-emerald-100"
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
            {commands.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                Command {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {commands.map((command, index) => (
              <TabsContent key={index} value={index.toString()}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative"
                >
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(command, index)}
                      className="bg-black/50 hover:bg-black/70 text-white"
                    >
                      {copied[index] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => handleCommandChange(index, e.target.value)}
                      className="w-full p-4 bg-black text-white font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter command..."
                    />
                  ) : (
                    <pre className="bg-black text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <code>
                        {getTerminalPrompt(content.language)}{command}
                      </code>
                    </pre>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}