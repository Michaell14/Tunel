import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SpotifyUser {
    display_name: string;
    email: string;
    followers: {
        total: number;
    };
    id: string;
    images: Array<{
        url: string;
    }>;
}

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        images: Array<{ url: string }>;
        name: string;
        release_date: string;
    };
    duration_ms: number;
    popularity: number;
    preview_url: string;
}

interface UserState {
    accessToken: string;
    userData: SpotifyUser | null;
    isAuthenticated: boolean;
    searchQuery: string;
    searchResults: Track[];
    isSearching: boolean;
    selectedSong: Track | null;
    selectionTimer: number | null;
    setAccessToken: (newAccessToken: string) => void;
    setUserData: (newUserData: SpotifyUser | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: Track[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    setSelectedSong: (song: Track | null) => void;
    setSelectionTimer: (timer: number | null) => void;
    logout: () => void;
}

// Custom storage for expo-secure-store
const secureStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(name);
        } catch (error) {
            console.error('Error reading from secure storage:', error);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(name, value);
        } catch (error) {
            console.error('Error writing to secure storage:', error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(name);
        } catch (error) {
            console.error('Error removing from secure storage:', error);
        }
    },
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            accessToken: "",
            userData: null,
            isAuthenticated: false,
            searchQuery: "",
            searchResults: [],
            isSearching: false,
            selectedSong: null,
            selectionTimer: null,
            setAccessToken: (newAccessToken: string) => {
                set({ accessToken: newAccessToken });
            },
            setIsAuthenticated: (isAuthenticated: boolean) => {
                set({ isAuthenticated });
            },
            setSearchQuery: (query: string) => {
                set({ searchQuery: query });
            },
            setSearchResults: (results: Track[]) => {
                set({ searchResults: results });
            },
            setIsSearching: (isSearching: boolean) => {
                set({ isSearching });
            },
            setSelectedSong: (song: Track | null) => {
                set({ selectedSong: song });
            },
            setSelectionTimer: (timer: number | null) => {
                set({ selectionTimer: timer });
            },
            setUserData: (newUserData: SpotifyUser | null) => {
                set({ userData: newUserData });
            },
            logout: () => {
                set({
                    accessToken: "",
                    userData: null,
                    isAuthenticated: false,
                    searchQuery: "",
                    searchResults: [],
                    isSearching: false,
                    selectedSong: null,
                    selectionTimer: null,
                });
            },
        }),
        {
            name: 'tunel-user-storage',
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                userData: state.userData,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);