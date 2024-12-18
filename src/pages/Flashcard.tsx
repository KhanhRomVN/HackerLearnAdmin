import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import { LoadBalancerService } from '@/api';
import { FlashcardContent } from '@/components/Flashcard/FlashcardContent';
import { FlashcardNavbar } from '@/components/Flashcard/FlashcardNavbar';
import { Skeleton } from '@/components/ui/skeleton';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Flashcard {
  id: string;
  sequence: number;
  lessonId: string;
}

interface FlashcardContent {
  id: string;
  type: string;
  sequence: number;
  flashcardSequenceId: string;
  isContent: boolean;
  [key: string]: any;
}

const Flashcard = () => {
  const { id: lessonId } = useParams();
  const [flashcardContents, setFlashcardContents] = useState<Map<string, FlashcardContent[]>>(new Map());
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch all flashcards for the lesson
  const { data: flashcards, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['flashcards', lessonId],
    queryFn: async () => {
      const api = new LoadBalancerService();
      const response = await api.getPublic<Flashcard[]>({
        endpoint: `/flashcard/all?lessonId=${lessonId}`,
      });
      // Sort flashcards by sequence
      return (response.data || []).sort((a, b) => a.sequence - b.sequence);
    },
  });

  // Fetch content for each flashcard
  useEffect(() => {
    const fetchFlashcardContents = async () => {
      if (!flashcards) return;

      const contentMap = new Map<string, FlashcardContent[]>();
      
      for (const flashcard of flashcards) {
        const api = new LoadBalancerService();
        const response = await api.getPublic<FlashcardContent[]>({
          endpoint: `/flashcard/flashcard?flashcardId=${flashcard.id}`,
        });
        
        if (response.data) {
          contentMap.set(flashcard.id, response.data);
        }
      }

      setFlashcardContents(contentMap);
    };

    fetchFlashcardContents();
  }, [flashcards]);

  if (isLoadingFlashcards) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[400px] rounded-lg pulse bg-card-background" />
          <Skeleton className="h-[400px] rounded-lg pulse bg-card-background" />
        </div>
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full bg-card-background" />
          <Skeleton className="h-10 w-20 bg-card-background" />
          <Skeleton className="h-10 w-10 rounded-full bg-card-background" />
        </div>
      </div>
    );
  }

  // Group flashcards into pairs
  const flashcardPairs = flashcards?.reduce((result: Flashcard[][], item, index) => {
    if (index % 2 === 0) {
      result.push([item]);
    } else {
      result[result.length - 1].push(item);
    }
    return result;
  }, []) || [];

  return (
    <div className="container mx-auto p-4 pb-24 h-screen relative"> 
      <Swiper
        modules={[Navigation, Pagination, EffectFade]}
        navigation={false}
        pagination={false}
        spaceBetween={30}
        className="h-[calc(100vh-160px)]"
        style={{ height: 'calc(100vh - 160px)' }}
        onSwiper={setSwiper}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={500}
      >
        {flashcardPairs.map((pair, index) => (
          <SwiperSlide key={index} className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {pair.map((flashcard) => (
                <div 
                  key={flashcard.id} 
                  className="h-full"
                > 
                  <FlashcardContent 
                    contents={flashcardContents.get(flashcard.id) || []} 
                  />
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="fixed bottom-0 left-0 right-0 border-t z-50 flex justify-end items-center">
      <FlashcardNavbar 
  totalSlides={flashcardPairs.length}
  currentSlide={currentSlide}
  swiper={swiper}
  flashcardPairs={flashcardPairs}
  flashcardContents={flashcardContents}
  lessonId={lessonId} // Add this prop
/>
      </div>
    </div>
  );
};

export default Flashcard;