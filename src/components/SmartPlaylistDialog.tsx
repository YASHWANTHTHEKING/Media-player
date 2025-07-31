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
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SmartPlaylistDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function SmartPlaylistDialog({ open, onOpenChange }: SmartPlaylistDialogProps) {
  const { createSmartPlaylist, state } = usePlayer();
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        toast({ title: "Please enter a name for the playlist.", variant: "destructive" });
        return;
    };
    setIsLoading(true);
    await createSmartPlaylist(name);
    setIsLoading(false);
    onOpenChange(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" /> Create Smart Playlist
          </DialogTitle>
          <DialogDescription>
            Let AI create a personalized playlist for you based on your listening habits. Give it a name to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
                placeholder="e.g. Focus Mix, Workout Jams"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || state.listeningHistory.length < 5}>
              {isLoading ? 'Generating...' : 'Generate Playlist'}
            </Button>
          </DialogFooter>
        </form>
          {state.listeningHistory.length < 5 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                  Listen to at least {5 - state.listeningHistory.length} more new songs to enable this feature.
              </p>
          )}
      </DialogContent>
    </Dialog>
  );
}
