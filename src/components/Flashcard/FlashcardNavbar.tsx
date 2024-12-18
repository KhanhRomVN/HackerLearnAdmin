import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, FilePlus, ArrowUpDown, Trash } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';

interface FlashcardNavbarProps {
  totalSlides: number;
  currentSlide: number;
  swiper: SwiperType | null;
  flashcardPairs: any[][];
  flashcardContents: Map<string, any[]>;
  lessonId?: string;
}

const contentTypes = [
  'TEXT',
  'TABLE',
  'IMAGE',
  'VIDEO',
  'CODE',
  'TERMINAL',
  'MULTIPLE_CHOICE',
  'SHORT_ANSWER',
  'TRUE_FALSE',
];

export const FlashcardNavbar = ({ 
  totalSlides, 
  currentSlide, 
  swiper, 
  flashcardPairs,
  flashcardContents,
  lessonId
}: FlashcardNavbarProps) => {
  const [firstSwapSelection, setFirstSwapSelection] = useState<string | null>(null);
  const [secondSwapSelection, setSecondSwapSelection] = useState<string | null>(null);
  const [showSwapDropdown, setShowSwapDropdown] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

  const handlePrevSlide = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const handleNextSlide = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  const getNextSequence = (flashcardId: string): number => {
    const contents = flashcardContents.get(flashcardId) || [];
    return contents.length + 1;
  };

  const handleAddContent = async (flashcardId: string, type: string) => {
    try {
      const nextSequence = getNextSequence(flashcardId);
      
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/flashcard-sequence',
        reqBody: {
          flashcardId,
          sequence: nextSequence,
          type
        }
      });
      toast.success('Content added successfully');
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to add content');
    }
  };

  const handleCreateNewFlashcard = async () => {
    try {
      if (!lessonId) {
        toast.error('Lesson ID is required');
        return;
      }

      const totalFlashcards = flashcardPairs.flat().length;
      const nextSequence = totalFlashcards + 1;

      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/flashcard',
        reqBody: {
          lessonId,
          sequence: nextSequence
        }
      });
      
      toast.success('Flashcard created successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast.error('Failed to create flashcard');
    }
  };

  const handleSwapFlashcards = async () => {
    if (!firstSwapSelection || !secondSwapSelection) {
      toast.error('Please select two flashcards to swap');
      return;
    }

    try {
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/flashcard/switch',
        reqBody: {
          firstSequenceId: firstSwapSelection,
          secondSequenceId: secondSwapSelection
        }
      });
      toast.success('Flashcards swapped successfully');
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
    } catch (error) {
      console.error('Error swapping flashcards:', error);
      toast.error('Failed to swap flashcards');
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    try {
      const api = new LoadBalancerService();
      await api.deletePublic({
        endpoint: `/flashcard/delete?flashcardId=${flashcardId}`
      });
      toast.success('Flashcard deleted successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  const flashcards = flashcardPairs.flat();

  return (
    <div className="flex items-center justify-center p-4 bg-background border-t">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleCreateNewFlashcard}
          className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
          title="Create New Flashcard"
        >
          <FilePlus className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {flashcardPairs[currentSlide]?.map((flashcard, index) => (
              <DropdownMenuSub key={flashcard.id}>
                <DropdownMenuSubTrigger className="flex items-center">
                  Flashcard {index + 1}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {contentTypes.map((type) => (
                    <DropdownMenuItem 
                      key={type}
                      onClick={() => handleAddContent(flashcard.id, type)}
                      className="cursor-pointer"
                    >
                      {type.replace(/_/g, ' ')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Swap Flashcards Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSwapDropdown(!showSwapDropdown)}
          className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
          title="Swap Flashcards"
        >
          <ArrowUpDown className="h-5 w-5" />
        </Button>

        {showSwapDropdown && (
  <div className="absolute bg-white border p-2 rounded-lg shadow-lg bottom-full mb-2 transition-transform transform-gpu duration-300 ease-in-out">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full hover:bg-gray-100 transition-colors duration-200">Select First Flashcard</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-white">
        {flashcards.map((flashcard, index) => (
          <DropdownMenuItem
            key={flashcard.id}
            onClick={() => setFirstSwapSelection(flashcard.id)}
            className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            Flashcard {index + 1}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    {firstSwapSelection && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full mt-2 hover:bg-gray-100 transition-colors duration-200">Select Second Flashcard</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-white">
          {flashcards
            .filter((flashcard) => flashcard.id !== firstSwapSelection)
            .map((flashcard, index) => (
              <DropdownMenuItem
                key={flashcard.id}
                onClick={() => setSecondSwapSelection(flashcard.id)}
                className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                Flashcard {index + 1}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )}

    <Button onClick={handleSwapFlashcards} className="mt-2 hover:bg-gray-100 transition-colors duration-200">
      Confirm Swap
    </Button>
  </div>
)}

        {/* Delete Flashcard Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
              className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
              title="Delete Flashcard"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          {showDeleteDropdown && (
            <DropdownMenuContent align="start" className="w-48">
              {flashcards.map((flashcard, index) => (
                <DropdownMenuItem
                  key={flashcard.id}
                  onClick={() => handleDeleteFlashcard(flashcard.id)}
                  className="cursor-pointer"
                >
                  Flashcard {index + 1}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevSlide}
          disabled={currentSlide === 0}
          className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <span className="text-xl px-4">
          {currentSlide + 1} / {totalSlides}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="bg-color-primary text-white transition-colors duration-200 border-2 border-primary/20"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardNavbar;