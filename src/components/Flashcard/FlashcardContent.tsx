import React from 'react';
import { Card } from '@/components/ui/card';
import { TextContentView } from '@/components/Flashcard/ContentViews/TextContentView';
import { TableContentView } from '@/components/Flashcard/ContentViews/TableContentView';
import { ImageContentView } from '@/components/Flashcard/ContentViews/ImageContentView';
import { VideoContentView } from '@/components/Flashcard/ContentViews/VideoContentView';
import { CodeContentView } from '@/components/Flashcard/ContentViews/CodeContentView';
import { MultipleChoiceContentView } from '@/components/Flashcard/ContentViews/MultipleChoiceContentView';
import { ShortAnswerContentView } from '@/components/Flashcard/ContentViews/ShortAnswerContentView';
import { TrueFalseContentView } from '@/components/Flashcard/ContentViews/TrueFalseContentView';
import { ContentForm } from '@/components/Flashcard/ContentForms';
import { TerminalContentView } from '@/components/Flashcard/ContentViews/TerminalContentView';
import { Button } from '@/components/ui/button';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { Trash } from 'lucide-react'; // Import icon for delete button

interface FlashcardContentProps {
  contents: any[];
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({ contents }) => {
  const handleDeleteContent = async (flashcardSequenceId: string) => {
    try {
      const api = new LoadBalancerService();
      await api.deletePublic({
        endpoint: `/flashcard-sequence/delete?flashcardSequenceId=${flashcardSequenceId}`,
      });
      toast.success('Content deleted successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const renderEmptyState = (content: any) => (
    <Card className="h-full flex flex-col p-8 border-2 border-dashed border-card-header">
      <div className="space-y-4">
        {content && (
          <ContentForm 
            type={content.type}
            flashcardSequenceId={content.flashcardSequenceId}
            onSubmitSuccess={() => {
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }}
          />
        )}
      </div>
    </Card>
  );

  const renderContent = (content: any) => {
    if (!content.isContent) {
      return renderEmptyState(content);
    }

    return (
      <Card className="overflow-hidden transition-all border border-card-header relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDeleteContent(content.flashcardSequenceId)}
          className="absolute bottom-2 left-2 bg-white hover:bg-red-100 transition-colors duration-200"
          title="Delete Content"
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
        <div>
          {(() => {
            switch (content.type) {
              case 'TEXT':
                return <TextContentView content={content} />;
              case 'TABLE':
                return <TableContentView content={content} />;
              case 'IMAGE':
                return <ImageContentView content={content} />;
              case 'VIDEO':
                return <VideoContentView content={content} />;
              case 'CODE':
                return <CodeContentView content={content} />;
              case 'TERMINAL':
                return <TerminalContentView content={content} />;
              case 'MULTIPLE_CHOICE':
                return <MultipleChoiceContentView content={content} />;
              case 'SHORT_ANSWER':
                return <ShortAnswerContentView content={content} />;
              case 'TRUE_FALSE':
                return <TrueFalseContentView content={content} />;
              default:
                return renderEmptyState(content);
            }
          })()}
        </div>
      </Card>
    );
  };

  if (!contents || contents.length === 0) {
    return renderEmptyState(null);
  }

  return (
    <div className="relative h-full">
      <div 
        className="absolute inset-0 overflow-y-auto pr-2" 
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9ca3af transparent'
        }}
      >
        <div className="space-y-4 p-4">
          {contents.map((content, index) => (
            <div 
              key={index} 
              className="mb-4 animate-fadeIn"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animation: 'fadeIn 0.5s ease forwards'
              }}
            >
              {renderContent(content)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardContent;