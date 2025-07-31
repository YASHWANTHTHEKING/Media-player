'use client';

import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from './ui/button';
import { ListMusic, Plus, Sparkles, Trash2, Library, Music, Mic2 } from 'lucide-react';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';
import { SmartPlaylistDialog } from './SmartPlaylistDialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

type PlaylistManagerProps = {
  onSelectPlaylist?: () => void;
};

export default function PlaylistManager({ onSelectPlaylist }: PlaylistManagerProps) {
  const { state, dispatch } = usePlayer();
  const [isCreateOpen, setCreateOpen] = React.useState(false);
  const [isSmartOpen, setSmartOpen] = React.useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Playlists</h2>
        <div className="space-y-2">
          <CreatePlaylistDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
          <SmartPlaylistDialog open={isSmartOpen} onOpenChange={setSmartOpen} />
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Playlist
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setSmartOpen(true)}>
            <Sparkles className="h-4 w-4" /> Create Smart Playlist
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="px-2">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Library</h3>
          <Button
            variant={state.activePlaylistId === 'library' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_PLAYLIST', payload: 'library' });
              onSelectPlaylist?.();
            }}
          >
            <Library className="h-4 w-4" />
            All Songs
          </Button>
        </div>
        <div className="mt-4 px-2">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">My Playlists</h3>
          {state.playlists.map(playlist => (
            <div key={playlist.id} className="group relative flex items-center">
              <Button
                variant={state.activePlaylistId === playlist.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2 truncate"
                onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_PLAYLIST', payload: playlist.id });
                    onSelectPlaylist?.();
                }}
              >
                {playlist.isSmart ? <Sparkles className="h-4 w-4" /> : <ListMusic className="h-4 w-4" />}
                <span className="truncate">{playlist.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={() => dispatch({ type: 'DELETE_PLAYLIST', payload: playlist.id })}
                >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
