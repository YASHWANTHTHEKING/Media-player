'use client';

import React from 'react';
import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Trash2, Volume2, MusicIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/lib/types';


export default function SongList() {
  const { state, dispatch, activePlaylist, currentSong } = usePlayer();
  const { toast } = useToast();

  const handlePlaySong = (index: number) => {
    if (activePlaylist) {
        dispatch({ type: 'PLAY_SONG', payload: { playlistId: activePlaylist.id, songIndex: index } });
    }
  };

  const handleAddToPlaylist = (playlistId: string, song: Song) => {
    dispatch({ type: 'ADD_TO_PLAYLIST', payload: { playlistId, song } });
    toast({
        title: "Song added",
        description: `"${song.name}" has been added to the playlist.`,
    });
  };

  const handleRemoveFromPlaylist = (songId: string) => {
    if (activePlaylist && activePlaylist.id !== 'library') {
      dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: { playlistId: activePlaylist.id, songId } });
      toast({
          title: "Song removed",
          description: `The song has been removed from the playlist.`,
      });
    }
  }


  if (!activePlaylist || activePlaylist.songs.length === 0) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <MusicIcon className="w-24 h-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold">Empty Playlist</h2>
            <p className="mt-2 text-muted-foreground">
                {activePlaylist?.id === 'library'
                    ? "Your library is empty. Load some songs to get started."
                    : "This playlist has no songs. Add some from your library."}
            </p>
        </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">{activePlaylist.name}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activePlaylist.songs.map((song, index) => (
              <TableRow
                key={song.id}
                className={cn(
                  'cursor-pointer',
                  currentSong?.id === song.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => handlePlaySong(index)}
              >
                <TableCell className="w-10 text-center">
                  {currentSong?.id === song.id && state.isPlaying ? (
                    <Volume2 className="h-5 w-5 animate-pulse text-primary mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                        <Image 
                            src={song.albumArtUrl || 'https://placehold.co/40x40.png'} 
                            alt={song.name}
                            width={40}
                            height={40}
                            className="rounded-md"
                            data-ai-hint="album art"
                        />
                        <div>
                            <div>{song.name}</div>
                            <div className="text-sm text-muted-foreground">{song.artist || 'Unknown Artist'}</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                    {activePlaylist.id !== 'library' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromPlaylist(song.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {state.playlists.filter(p => !p.isSmart).map(playlist => (
                                <DropdownMenuItem key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id, song)}>
                                    Add to {playlist.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}
