import { TextContentForm } from '@/components/Flashcard/ContentForms/TextContentForm';
import { TableContentForm } from '@/components/Flashcard/ContentForms/TableContentForm';
import { ImageContentForm } from '@/components/Flashcard/ContentForms/ImageContentForm';
import { VideoContentForm } from '@/components/Flashcard/ContentForms/VideoContentForm';
import { CodeContentForm } from '@/components/Flashcard/ContentForms/CodeContentForm';
import { TerminalContentForm } from '@/components/Flashcard/ContentForms/TerminalContentForm';
import { ShortAnswerContentForm } from '@/components/Flashcard/ContentForms/ShortAnswerContentForm';
import { MultipleChoiceContentForm } from '@/components/Flashcard/ContentForms/MultipleChoiceContentForm';
import { TrueFalseContentForm } from '@/components/Flashcard/ContentForms/TrueFalseContentForm';

interface ContentFormProps {
  type: string;
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const ContentForm = ({ type, flashcardSequenceId, onSubmitSuccess }: ContentFormProps) => {
  const renderForm = () => {
    switch (type) {
      case 'TEXT':
        return <TextContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'TABLE':
        return <TableContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'IMAGE':
        return <ImageContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'VIDEO':
        return <VideoContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'CODE':
        return <CodeContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'TERMINAL':
        return <TerminalContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'SHORT_ANSWER':
        return <ShortAnswerContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      case 'TRUE_FALSE':
        return <TrueFalseContentForm flashcardSequenceId={flashcardSequenceId} onSubmitSuccess={onSubmitSuccess} />;
      default:
        return null;
    }
  };

  return renderForm();
};