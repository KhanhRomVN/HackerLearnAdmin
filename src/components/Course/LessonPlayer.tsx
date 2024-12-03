import { MediaPlayer } from '@/components/ui/media-player';

export function LessonPlayer({ lessonUrl }: { lessonUrl: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Lesson Player</h2>
      <MediaPlayer
        src={lessonUrl}
        format={['mp4']} // hoặc format phù hợp với video của bạn
        onEnd={() => {
          console.log('Video playback completed');
          // Xử lý logic khi video kết thúc
        }}
      />
    </div>
  );
}