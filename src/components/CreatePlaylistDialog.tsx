'use client';

import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Playlist } from '@/lib/types';

type CreatePlaylistDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreatePlaylistDialog({ open, onOpenChange }: CreatePlaylistDialogProps) {
  const { dispatch } = usePlayer();
  const [name, setName] = React.useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: name.trim(),
      songs: [],
    };
    dispatch({ type: 'CREATE_PLAYLIST', payload: newPlaylist });
    toast({
        title: "Playlist Created",
        description: `"${name}" is ready for some tunes.`
    });
    onOpenChange(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create a new playlist</DialogTitle>
          <DialogDescription>
            Give your new playlist a name. You can add songs to it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Awesome Mix"
            />
          </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Playlist</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
