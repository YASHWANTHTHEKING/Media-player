'use client';

import React from 'react';
import Image from 'next/image';
import { Pause, Play, SkipBack, SkipForward, Volume2, MusicIcon, VolumeX, Volume1 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

type PlayerControlsProps = {
  duration: number;
  currentTime: number;
  handleSeek: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
};

export default function PlayerControls({ duration, currentTime, handleSeek, volume, setVolume }: PlayerControlsProps) {
  const { state, dispatch, currentSong } = usePlayer();
  const { isPlaying } = state;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5 text-muted-foreground" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5 text-muted-foreground" />;
    return <Volume2 className="h-5 w-5 text-muted-foreground" />;
  }

  return (
    <div className="flex h-24 items-center gap-6 px-6">
      <div className="flex w-64 items-center gap-4">
        {currentSong ? (
             <Image 
                src={currentSong.albumArtUrl || 'https://placehold.co/64x64.png'} 
                alt={currentSong.name}
                width={56}
                height={56}
                className="rounded-md"
                data-ai-hint="album art"
            />
        ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <MusicIcon size={32} />
            </div>
        )}
        <div>
          <p className="font-semibold truncate">{currentSong?.name || 'No song selected'}</p>
          <p className="text-sm text-muted-foreground">{currentSong?.artist || 'Unknown Artist'}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'PLAY_PREVIOUS' })}
            disabled={!currentSong}
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => dispatch({ type: 'TOGGLE_PLAY_PAUSE' })}
            disabled={!currentSong}
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'PLAY_NEXT' })}
            disabled={!currentSong}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => handleSeek(value[0])}
            disabled={!currentSong}
          />
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>
       <div className="flex w-64 items-center justify-end gap-2">
        {getVolumeIcon()}
        <Slider value={[volume]} max={1} step={0.05} onValueChange={(v) => setVolume(v[0])} className="w-24" />
      </div>
    </div>
  );
}
