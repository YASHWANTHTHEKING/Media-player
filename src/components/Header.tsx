'use client';

import React from 'react';
import { FolderUp, Music2 } from 'lucide-react';
import { Button } from './ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';

type HeaderProps = {
  children?: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  const { dispatch } = usePlayer();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newSongs: Song[] = Array.from(files)
      .filter(file => file.type === 'audio/mpeg')
      .map(file => {
        const url = URL.createObjectURL(file);
        return {
          id: `${file.name}-${file.lastModified}`,
          name: file.name.replace(/\.mp3$/, ''),
          url,
          duration: 0, // Will be updated on load
          file,
          albumArtUrl: `https://placehold.co/128x128.png?text=${encodeURIComponent(file.name.replace(/\.mp3$/, '')[0])}`,
        };
      });

    if (newSongs.length > 0) {
      dispatch({ type: 'LOAD_SONGS', payload: newSongs });
      toast({
        title: 'Songs Loaded',
        description: `${newSongs.length} new song(s) added to your library.`,
      });
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Use the relative path to guess the folder name.
    const playlistName = files[0].webkitRelativePath.split('/')[0] || 'New Playlist';

    const newSongs: Song[] = Array.from(files)
        .filter(file => file.type === 'audio/mpeg')
        .map(file => {
            const url = URL.createObjectURL(file);
            return {
                id: `${file.name}-${file.lastModified}`,
                name: file.name.replace(/\.mp3$/, ''),
                url,
                duration: 0,
                file,
                albumArtUrl: `https://placehold.co/128x128.png?text=${encodeURIComponent(file.name.replace(/\.mp3$/, '')[0])}`,
            };
        });

    if (newSongs.length > 0) {
        dispatch({ type: 'CREATE_PLAYLIST_FROM_FILES', payload: { name: playlistName, songs: newSongs } });
        toast({
            title: 'Playlist Created',
            description: `Playlist "${playlistName}" with ${newSongs.length} songs has been created.`,
        });
    }
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card/75 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {children}
        <Music2 className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Riff Master</h1>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".mp3"
          multiple
          className="hidden"
        />
        <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderChange}
            accept=".mp3"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Load Songs</Button>
        <Button onClick={() => folderInputRef.current?.click()}>
            <FolderUp className="mr-2 h-4 w-4"/>
            Load Playlist
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
