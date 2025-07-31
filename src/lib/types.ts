export interface Song {
  id: string;
  name: string;
  url: string;
  duration: number;
  artist?: string;
  albumArtUrl?: string;
  file: File;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  isSmart?: boolean;
}
