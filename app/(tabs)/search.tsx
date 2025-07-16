import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { useUserStore } from '../../zustand/userStore';

interface SearchResult {
  id: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  followers: number;
  isFollowing: boolean;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
  };
}

interface CombinedSearchResults {
  users: SearchResult[];
  songs: SpotifyTrack[];
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const { accessToken, isAuthenticated } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CombinedSearchResults>({
    users: [],
    songs: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults({ users: [], songs: [] });
    }
    console.log("searchResults: ", searchResults);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!isAuthenticated || !searchQuery.trim()) return;

    setLoading(true);
    try {
      // Perform all three searches in parallel
      const [usersResponse, tracksResponse] = await Promise.allSettled([
        apiService.searchUsers(searchQuery.trim()),
        apiService.searchSpotifySongs(searchQuery.trim(), 5)
      ]);

      // Handle users results
      if (usersResponse.status === 'fulfilled' && usersResponse.value.data) {
        const userData = usersResponse.value.data as any;
        setSearchResults(prev => ({
          ...prev,
          users: userData || []
        }));
      }
      
      if (tracksResponse.status === 'fulfilled' && tracksResponse.value.data) {
        const trackData = tracksResponse.value.data as any;
        setSearchResults(prev => ({
          ...prev,
          songs: trackData || []
        }));
      }

      // setSearchResults(newResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderUserResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.recentTrackItem}>
      <View style={styles.avatarContainer}>
        <ThemedText style={styles.avatarText}>
          {item.displayName?.charAt(0)?.toUpperCase() || '?'}
        </ThemedText>
      </View>
      <View style={styles.recentTrackInfo}>
        <ThemedText style={styles.recentTrackName} numberOfLines={1}>
          {item.displayName || 'Unknown User'}
        </ThemedText>
        {item.bio && (
          <ThemedText style={styles.recentTrackArtist} numberOfLines={1}>
            {item.bio}
          </ThemedText>
        )}
        <ThemedText style={styles.recentTrackAlbum} numberOfLines={1}>
          {item.followers || 0} followers
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => {}}
      >
        <ThemedText style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrackResult = ({ item }: { item: SpotifyTrack }) => (
    <TouchableOpacity style={styles.recentTrackItem}>
      <Image
        source={{ uri: item.album.images[0]?.url }}
        style={styles.recentTrackImage}
      />
      <View style={styles.recentTrackInfo}>
        <ThemedText style={styles.recentTrackName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.recentTrackArtist} numberOfLines={1}>
          {item.artists.map(artist => artist.name).join(', ')}
        </ThemedText>
        <ThemedText style={styles.recentTrackAlbum} numberOfLines={1}>
          {item.album.name}
        </ThemedText>
      </View>
      <View style={styles.recentTrackDuration}>
        <ThemedText style={styles.recentTrackDurationText}>
          {formatDuration(item.duration_ms)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: any[], renderItem: any, key: string) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => `${key}-${item.id}`}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.verticalList}
        />
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.connectContainer}>
            <ThemedText style={styles.connectTitle}>Welcome to Tunel</ThemedText>
            <ThemedText style={styles.connectDescription}>
              Connect your Spotify account to search for friends and music.
            </ThemedText>
            <TouchableOpacity
              style={[styles.spotifyButton, { backgroundColor: '#1DB954' }]}
              onPress={() => {
                // Navigate to profile tab for Spotify connection
                Alert.alert('Connect Spotify', 'Please go to the Profile tab to connect your Spotify account.');
              }}
            >
              <ThemedText style={styles.spotifyButtonText}>Go to Profile</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Search</ThemedText>
          <ThemedText style={styles.subtitle}>Find friends and discover music</ThemedText>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <ThemedView style={styles.searchInput}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={[styles.searchTextInput, { color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Search for users, songs, or artists..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>
        </View>

        {/* Search Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Searching...</ThemedText>
          </View>
        ) : searchQuery.trim().length > 0 ? (
          <FlatList
            data={[]} // Empty data since we're using sections
            renderItem={() => null}
            ListHeaderComponent={
              <View style={styles.resultsContainer}>
                {renderSection('Users', searchResults.users, renderUserResult, 'user')}
                {renderSection('Songs', searchResults.songs, renderTrackResult, 'track')}
                
                {/* Show empty state if no results in any category */}
                {searchResults.users.length === 0 && 
                 searchResults.songs.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>No results found</ThemedText>
                    <ThemedText style={styles.emptySubtext}>
                      Try adjusting your search terms
                    </ThemedText>
                  </View>
                )}
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.initialContainer}>
            <ThemedText style={styles.initialIcon}>🔍</ThemedText>
            <ThemedText style={styles.initialTitle}>Start Searching</ThemedText>
            <ThemedText style={styles.initialDescription}>
              Search for users, songs, or artists to discover new music and connect with friends.
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  connectDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  spotifyButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  spotifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: 16,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  verticalList: {
    paddingBottom: 20,
  },
  resultCard: {
    width: '100%', // Make cards full width
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  followers: {
    fontSize: 12,
    opacity: 0.6,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1DB954',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#1DB954',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  trackDetails: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  albumName: {
    fontSize: 13,
    opacity: 0.6,
  },
  duration: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 5,
  },
  artistType: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 5,
  },
  shareButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initialIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  initialDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Recent Tracks Styles (matching index.tsx)
  recentTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  recentTrackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  recentTrackInfo: {
    flex: 1,
    marginRight: 12,
  },
  recentTrackName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentTrackArtist: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  recentTrackAlbum: {
    fontSize: 12,
    opacity: 0.6,
  },
  recentTrackDuration: {
    alignItems: 'flex-end',
  },
  recentTrackDurationText: {
    fontSize: 12,
    opacity: 0.7,
  },
}); 