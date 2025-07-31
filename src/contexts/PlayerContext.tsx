'use client';

import type { ReactNode } from 'react';
import React, from 'react';
import { generateSmartPlaylist } from '@/ai/flows/smart-playlist-generator';
import type { Playlist, Song } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type PlayerState = {
  playlists: Playlist[];
  songs: Song[];
  currentSongIndex: number | null;
  isPlaying: boolean;
  activePlaylistId: string | null;
  listeningHistory: string[];
};

type PlayerAction =
  | { type: 'LOAD_SONGS'; payload: Song[] }
  | { type: 'PLAY_SONG'; payload: { playlistId: string; songIndex: number } }
  | { type: 'TOGGLE_PLAY_PAUSE' }
  | { type: 'PLAY_NEXT' }
  | { type: 'PLAY_PREVIOUS' }
  | { type: 'CREATE_PLAYLIST'; payload: Playlist }
  | { type: 'CREATE_PLAYLIST_FROM_FILES', payload: { name: string, songs: Song[] } }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'ADD_TO_PLAYLIST'; payload: { playlistId: string; song: Song } }
  | { type: 'REMOVE_FROM_PLAYLIST'; payload: { playlistId: string; songId: string } }
  | { type: 'SET_ACTIVE_PLAYLIST'; payload: string | null }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'HYDRATE_STATE'; payload: PlayerState };


const getInitialState = (): PlayerState => {
    try {
        if (typeof window === 'undefined') {
            return {
                playlists: [],
                songs: [],
                currentSongIndex: null,
                isPlaying: false,
                activePlaylistId: 'library',
                listeningHistory: [],
            };
        }
        const savedState = localStorage.getItem('playerState');
        if (!savedState) {
            return {
                playlists: [],
                songs: [],
                currentSongIndex: null,
                isPlaying: false,
                activePlaylistId: 'library',
                listeningHistory: [],
            };
        }
        const parsed = JSON.parse(savedState);
        // We can't store File objects in localStorage, so we need to recreate URLs
        // When state is restored, song.file is just metadata, not a File object.
        // We also can't recreate the blob URL, so we set it to an empty string.
        // Playback will rely on the original File object which is kept in component state.
        const songsWithUrls = parsed.songs.map((song: Song) => ({
            ...song,
            url: '', 
        }));

        const playlistsWithSongUrls = parsed.playlists.map((playlist: Playlist) => ({
            ...playlist,
            songs: playlist.songs.map((song: Song) => ({
                ...song,
                url: '',
            })),
        }));

        return { ...parsed, songs: songsWithUrls, playlists: playlistsWithSongUrls, isPlaying: false, currentSongIndex: null };
    } catch (error) {
        console.error("Could not load player state from localStorage", error);
        return {
            playlists: [],
            songs: [],
            currentSongIndex: null,
            isPlaying: false,
            activePlaylistId: 'library',
            listeningHistory: [],
        };
    }
};


function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'HYDRATE_STATE':
        return action.payload;
    case 'LOAD_SONGS':
      return { ...state, songs: [...state.songs, ...action.payload] };
    case 'PLAY_SONG': {
      const { playlistId, songIndex } = action.payload;
      return {
        ...state,
        activePlaylistId: playlistId,
        currentSongIndex: songIndex,
        isPlaying: true,
      };
    }
    case 'TOGGLE_PLAY_PAUSE':
      if (state.currentSongIndex === null) return state;
      return { ...state, isPlaying: !state.isPlaying };
    case 'PLAY_NEXT': {
      if (state.currentSongIndex === null) return state;
      const activePlaylist = state.activePlaylistId === 'library'
        ? { id: 'library', name: 'Library', songs: state.songs }
        : state.playlists.find(p => p.id === state.activePlaylistId);
      if (!activePlaylist || activePlaylist.songs.length === 0) return state;
      const nextIndex = (state.currentSongIndex + 1) % activePlaylist.songs.length;
      return { ...state, currentSongIndex: nextIndex, isPlaying: true };
    }
    case 'PLAY_PREVIOUS': {
      if (state.currentSongIndex === null) return state;
      const activePlaylist = state.activePlaylistId === 'library'
        ? { id: 'library', name: 'Library', songs: state.songs }
        : state.playlists.find(p => p.id === state.activePlaylistId);
      if (!activePlaylist || activePlaylist.songs.length === 0) return state;
      const prevIndex = (state.currentSongIndex - 1 + activePlaylist.songs.length) % activePlaylist.songs.length;
      return { ...state, currentSongIndex: prevIndex, isPlaying: true };
    }
    case 'CREATE_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    case 'CREATE_PLAYLIST_FROM_FILES': {
      const { name, songs } = action.payload;
      const newPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        name: name,
        songs: songs,
      };
      const newSongs = songs.filter(song => !state.songs.some(s => s.id === song.id));
      return { 
        ...state,
        songs: [...state.songs, ...newSongs], 
        playlists: [...state.playlists, newPlaylist],
        activePlaylistId: newPlaylist.id
      };
    }
    case 'DELETE_PLAYLIST':
        return { ...state, playlists: state.playlists.filter(p => p.id !== action.payload), activePlaylistId: 'library' };
    case 'ADD_TO_PLAYLIST': {
      const { playlistId, song } = action.payload;
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist && playlist.songs.some(s => s.id === song.id)) {
        return state; // Song already in playlist
      }
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === playlistId
            ? { ...p, songs: [...p.songs, song] }
            : p
        ),
      };
    }
    case 'REMOVE_FROM_PLAYLIST': {
        return {
          ...state,
          playlists: state.playlists.map(p =>
            p.id === action.payload.playlistId
              ? { ...p, songs: p.songs.filter(s => s.id !== action.payload.songId) }
              : p
          ),
        };
      }
    case 'SET_ACTIVE_PLAYLIST':
      return { ...state, activePlaylistId: action.payload };
    case 'ADD_TO_HISTORY':
        if (state.listeningHistory.at(-1) === action.payload) return state;
        return { ...state, listeningHistory: [...state.listeningHistory, action.payload] };
    default:
      return state;
  }
}

const PlayerContext = React.createContext<{
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  createSmartPlaylist: (name: string) => Promise<void>;
  currentSong: Song | null;
  activePlaylist: Playlist | { id: string; name: string; songs: Song[] } | null;
} | null>(null);

// Custom hook to sync state with localStorage
function usePersistentPlayerState() {
    const [state, dispatch] = React.useReducer(playerReducer, getInitialState());

    React.useEffect(() => {
        const savedState = getInitialIState();
        // The URLs cannot be recreated from localStorage, so we don't try.
        // The `url` property on songs loaded from localStorage will be empty.
        // The currently playing song's URL is managed in MusicPlayerLayout.
        dispatch({ type: 'HYDRATE_STATE', payload: savedState });
    }, []);

    React.useEffect(() => {
        // We need a custom replacer to handle File objects
        const replacer = (key: string, value: any) => {
            if (key === 'file' && value instanceof File) {
                // Store file metadata, but not the content itself
                return {
                    name: value.name,
                    size: value.size,
                    type: value.type,
                    lastModified: value.lastModified,
                    // We can't serialize the file content, so we indicate it's from a local file
                    _isLocal: true,
                };
            }
            // The `url` for local files is a temporary blob URL and shouldn't be saved.
            if (key === 'url' && typeof value === 'string' && value.startsWith('blob:')) {
                return undefined;
            }
            return value;
        };

        try {
            localStorage.setItem('playerState', JSON.stringify(state, replacer));
        } catch (error) {
            console.error("Could not save player state to localStorage", error);
        }
    }, [state]);

    return [state, dispatch] as const;
}

// A version of getInitialState that doesn't try to create object URLs.
const getInitialIState = (): PlayerState => {
    try {
        if (typeof window === 'undefined') {
            return {
                playlists: [],
                songs: [],
                currentSongIndex: null,
                isPlaying: false,
                activePlaylistId: 'library',
                listeningHistory: [],
            };
        }
        const savedState = localStorage.getItem('playerState');
        if (!savedState) {
            return {
                playlists: [],
                songs: [],
                currentSongIndex: null,
                isPlaying: false,
                activePlaylistId: 'library',
                listeningHistory: [],
            };
        }
        const parsed = JSON.parse(savedState);
        
        // When state is restored, song.file is just metadata, not a File object.
        // We also can't recreate the blob URL, so we set it to an empty string.
        const restoreUrls = (songs: Song[]) => songs.map(song => ({ ...song, url: song.url || '' }));

        return { 
            ...parsed, 
            songs: restoreUrls(parsed.songs || []), 
            playlists: (parsed.playlists || []).map((p: Playlist) => ({...p, songs: restoreUrls(p.songs)})),
            isPlaying: false, 
            currentSongIndex: null 
        };
    } catch (error) {
        console.error("Could not load player state from localStorage", error);
        return {
            playlists: [],
            songs: [],
            currentSongIndex: null,
            isPlaying: false,
            activePlaylistId: 'library',
            listeningHistory: [],
        };
    }
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistentPlayerState();
  const { toast } = useToast();

  const createSmartPlaylist = async (name: string) => {
    if (state.listeningHistory.length < 5) {
      toast({
        title: 'Not enough history',
        description: 'Listen to a few more songs to generate a smart playlist.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await generateSmartPlaylist({
        listeningHistory: state.listeningHistory,
        playlistName: name,
        numberOfSongs: 20,
      });

      const smartSongs = state.songs.filter(song =>
        result.playlist.some(pSong => song.name.toLowerCase().includes(pSong.toLowerCase()))
      );

      const newPlaylist: Playlist = {
        id: `smart-${Date.now()}`,
        name,
        songs: smartSongs,
        isSmart: true,
      };

      dispatch({ type: 'CREATE_PLAYLIST', payload: newPlaylist });
      toast({
        title: 'Smart Playlist Created!',
        description: `"${name}" has been added to your playlists.`,
      });
    } catch (error) {
      console.error('Failed to generate smart playlist:', error);
      toast({
        title: 'Error',
        description: 'Could not generate a smart playlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const activePlaylist = state.activePlaylistId === 'library'
    ? { id: 'library', name: 'Library', songs: state.songs }
    : state.playlists.find(p => p.id === state.activePlaylistId) || null;
    
  const currentSong = state.currentSongIndex !== null && activePlaylist
    ? activePlaylist.songs[state.currentSongIndex]
    : null;

  return (
    <PlayerContext.Provider value={{ state, dispatch, createSmartPlaylist, currentSong, activePlaylist }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = React.useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
