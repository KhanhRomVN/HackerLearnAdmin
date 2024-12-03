import { useRef, useState, useCallback } from 'react';
import { Howl } from 'howler';

interface UseAudioPlayerProps {
  src: string;
  format?: string[];
  onEnd?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const useAudioPlayer = ({
  src,
  format = ['mp3'],
  onEnd,
  onLoad,
  onError
}: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const soundRef = useRef<Howl | null>(null);

  const initializeHowl = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [src],
      format,
      html5: true,
      onload: () => {
        setDuration(soundRef.current?.duration() || 0);
        setIsLoading(false);
        onLoad?.();
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnd?.();
      },
      onloaderror: (id, error) => {
        setIsLoading(false);
        onError?.(error);
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    });

    // Update current time during playback
    const updateTime = () => {
      if (soundRef.current && isPlaying) {
        setCurrentTime(soundRef.current.seek());
        requestAnimationFrame(updateTime);
      }
    };

    soundRef.current.on('play', updateTime);
  }, [src, format, onEnd, onLoad, onError]);

  const controls = {
    play: () => soundRef.current?.play(),
    pause: () => soundRef.current?.pause(),
    stop: () => soundRef.current?.stop(),
    seek: (time: number) => {
      if (soundRef.current) {
        soundRef.current.seek(time);
        setCurrentTime(time);
      }
    },
    volume: (value: number) => soundRef.current?.volume(value),
    mute: () => soundRef.current?.mute(true),
    unmute: () => soundRef.current?.mute(false)
  };

  return {
    isPlaying,
    duration,
    currentTime,
    isLoading,
    controls,
    initializeHowl
  };
};