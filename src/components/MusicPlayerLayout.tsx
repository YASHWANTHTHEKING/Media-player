'use client';

import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import PlaylistManager from './PlaylistManager';
import SongList from './SongList';
import PlayerControls from './PlayerControls';
import Header from './Header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MusicPlayerLayout() {
  const { state, dispatch } = usePlayer();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.7);
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);


  const activePlaylist =
    state.activePlaylistId === 'library'
      ? { id: 'library', name: 'Library', songs: state.songs }
      : state.playlists.find(p => p.id === state.activePlaylistId);
      
  const currentSong =
    state.currentSongIndex !== null && activePlaylist
      ? activePlaylist.songs[state.currentSongIndex]
      : null;

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (currentSong) {
        if (audio.src !== currentSong.url) {
          audio.src = currentSong.url;
        }
        if (state.isPlaying) {
          audio.play().catch(e => console.error('Error playing audio:', e));
          dispatch({ type: 'ADD_TO_HISTORY', payload: currentSong.name });
        } else {
          audio.pause();
        }
      } else {
        audio.pause();
      }
    }
  }, [currentSong, state.isPlaying, dispatch]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    dispatch({ type: 'PLAY_NEXT' });
  };
  
  const handleSeek = (value: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = value;
    }
  }

  if (isMobile) {
    return (
      <div className="flex h-[100dvh] flex-col bg-card/50">
        <Header>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <PlaylistManager onSelectPlaylist={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </Header>
        <main className="flex-1 overflow-hidden">
          <SongList />
        </main>
        <footer className="border-t border-border">
          <PlayerControls
            duration={duration}
            currentTime={currentTime}
            handleSeek={handleSeek}
            volume={volume}
            setVolume={setVolume}
          />
        </footer>
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-72 flex-shrink-0 border-r border-border bg-card/50">
        <PlaylistManager />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <SongList />
        </main>
        <footer className="border-t border-border bg-background">
          <PlayerControls
            duration={duration}
            currentTime={currentTime}
            handleSeek={handleSeek}
            volume={volume}
            setVolume={setVolume}
          />
        </footer>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />
    </div>
  );
}
