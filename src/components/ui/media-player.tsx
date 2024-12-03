import { useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPlayerProps {
  src: string;
  format?: string[];
  className?: string;
  onEnd?: () => void;
}

export function MediaPlayer({ src, format, className, onEnd }: MediaPlayerProps) {
  const {
    isPlaying,
    duration,
    currentTime,
    isLoading,
    controls,
    initializeHowl
  } = useAudioPlayer({
    src,
    format,
    onEnd
  });

  useEffect(() => {
    initializeHowl();
  }, [initializeHowl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex flex-col gap-4 p-4 rounded-lg bg-card', className)}>
      {/* Playback Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={() => (isPlaying ? controls.pause() : controls.play())}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Progress Slider */}
        <Slider
          className="flex-1"
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={([value]) => controls.seek(value)}
        />

        {/* Volume Control */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => controls.volume(0)}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        <Slider
          className="w-24"
          defaultValue={[1]}
          max={1}
          step={0.1}
          onValueChange={([value]) => controls.volume(value)}
        />
      </div>
    </div>
  );
}