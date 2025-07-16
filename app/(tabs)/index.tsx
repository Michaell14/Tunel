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
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/api';
import { useUserStore } from '../../zustand/userStore';

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  progress_ms?: number;
  item?: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    external_urls: {
      spotify: string;
    };
  };
}

interface CurrentlyPlaying {
  isPlaying: boolean;
  track?: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    external_urls: {
      spotify: string;
    };
  };
  progress_ms?: number;
}

interface RecentTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  played_at: string;
}

interface SpotifyRecentTracksResponse {
  items: Array<{
    track: RecentTrack;
    played_at: string;
  }>;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { userData, isAuthenticated } = useUserStore();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentTracksLoading, setRecentTracksLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userData) {
      loadCurrentlyPlaying();
      loadRecentTracks();
    }
  }, [isAuthenticated, userData]);

  const loadCurrentlyPlaying = async () => {
    if (!isAuthenticated || !userData) return;
    setLoading(true);
    try {
      const response = await apiService.getCurrentlyPlaying();
      console.log(response);
      
      // Transform the response to match our expected structure
      const spotifyData = response.data as SpotifyCurrentlyPlayingResponse;
      if (spotifyData && spotifyData.item) {
        setCurrentlyPlaying({
          isPlaying: spotifyData.is_playing || false,
          track: {
            id: spotifyData.item.id,
            name: spotifyData.item.name,
            artists: spotifyData.item.artists,
            album: {
              name: spotifyData.item.album.name,
              images: spotifyData.item.album.images,
            },
            duration_ms: spotifyData.item.duration_ms,
            external_urls: spotifyData.item.external_urls,
          },
          progress_ms: spotifyData.progress_ms,
        });
      } else {
        setCurrentlyPlaying(null);
      }
      
    } catch (error) {
      console.error('Error loading currently playing:', error);
      setCurrentlyPlaying(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTracks = async () => {
    if (!isAuthenticated || !userData) return;
    setRecentTracksLoading(true);
    try {
      const response = await apiService.getRecentTracks(20);
      console.log('Recent tracks response:', response);
      
      const spotifyData = response.data as SpotifyRecentTracksResponse;
      if (spotifyData && spotifyData.items) {
        const tracks = spotifyData.items.map(item => item.track);
        setRecentTracks(tracks);
      } else {
        setRecentTracks([]);
      }
    } catch (error) {
      console.error('Error loading recent tracks:', error);
      setRecentTracks([]);
    } finally {
      setRecentTracksLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCurrentlyPlaying(), loadRecentTracks()]);
    setRefreshing(false);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatProgress = (progress: number, duration: number) => {
    return (progress / duration) * 100;
  };

  const handleConnectSpotify = async () => {
    // Navigate to profile tab for Spotify connection
    Alert.alert('Connect Spotify', 'Please go to the Profile tab to connect your Spotify account.');
  };

  const openSpotify = () => {
    if (currentlyPlaying?.track?.external_urls?.spotify) {
      // In a real app, you'd use Linking to open Spotify
      console.log('Opening Spotify URL:', currentlyPlaying.track.external_urls.spotify);
      Alert.alert('Spotify', 'This would open the song in Spotify app');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.connectContainer}>
            <ThemedText style={styles.connectTitle}>Welcome to Tunel</ThemedText>
            <ThemedText style={styles.connectDescription}>
              Connect your Spotify account to see what you're currently playing and share songs with friends.
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

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.connectContainer}>
            <ThemedText style={styles.connectTitle}>Connect Your Spotify</ThemedText>
            <ThemedText style={styles.connectDescription}>
              Connect your Spotify account to see what you're currently playing and share songs with friends.
            </ThemedText>
            <TouchableOpacity
              style={[styles.spotifyButton, { backgroundColor: '#1DB954' }]}
              onPress={handleConnectSpotify}
            >
              <ThemedText style={styles.spotifyButtonText}>Connect Spotify</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme ?? 'light'].tint}
            />
          }
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Now Playing</ThemedText>
            <ThemedText style={styles.subtitle}>What's on your Spotify?</ThemedText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.loadingText}>Loading current song...</ThemedText>
            </View>
          ) : currentlyPlaying?.track ? (
            <View style={styles.nowPlayingContainer}>
              <TouchableOpacity onPress={openSpotify} style={styles.albumArtContainer}>
                <Image
                  source={{ uri: currentlyPlaying.track.album.images[0]?.url }}
                  style={styles.albumArt}
                />
                <View style={styles.spotifyOverlay}>
                  <ThemedText style={styles.spotifyIcon}>🎵</ThemedText>
                </View>
              </TouchableOpacity>

              <View style={styles.trackInfo}>
                <ThemedText style={styles.trackName}>{currentlyPlaying.track.name}</ThemedText>
                <ThemedText style={styles.artistName}>
                  {currentlyPlaying.track.artists.map(artist => artist.name).join(', ')}
                </ThemedText>
                <ThemedText style={styles.albumName}>{currentlyPlaying.track.album.name}</ThemedText>
              </View>

              {currentlyPlaying.progress_ms && currentlyPlaying.track.duration_ms && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${formatProgress(
                            currentlyPlaying.progress_ms,
                            currentlyPlaying.track.duration_ms
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.timeInfo}>
                    <ThemedText style={styles.timeText}>
                      {formatDuration(currentlyPlaying.progress_ms)}
                    </ThemedText>
                    <ThemedText style={styles.timeText}>
                      {formatDuration(currentlyPlaying.track.duration_ms)}
                    </ThemedText>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: '#1DB954' }]}
                onPress={() => {}}
              >
                <ThemedText style={styles.shareButtonText}>Share This Song</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noSongContainer}>
              <ThemedText style={styles.noSongIcon}>🎵</ThemedText>
              <ThemedText style={styles.noSongTitle}>No Song Playing</ThemedText>
              <ThemedText style={styles.noSongDescription}>
                Start playing something on Spotify to see it here!
              </ThemedText>
              <TouchableOpacity
                style={[styles.spotifyButton, { backgroundColor: '#1DB954' }]}
                onPress={openSpotify}
              >
                <ThemedText style={styles.spotifyButtonText}>Open Spotify</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Recent Tracks Section */}
          <View style={styles.recentTracksSection}>
            <ThemedText style={styles.recentTracksTitle}>Recently Played</ThemedText>
            {recentTracksLoading ? (
              <View style={styles.recentTracksLoading}>
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.recentTracksLoadingText}>Loading recent tracks...</ThemedText>
              </View>
            ) : recentTracks.length > 0 ? (
              <FlatList
                data={recentTracks}
                keyExtractor={(item: RecentTrack) => item.id}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                renderItem={({ item }: { item: RecentTrack }) => (
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
                        {item.artists.map((artist: { name: string }) => artist.name).join(', ')}
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
                )}
              />
            ) : (
              <View style={styles.noRecentTracks}>
                <ThemedText style={styles.noRecentTracksText}>No recent tracks found</ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  authContainer: {
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
  authDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
    alignItems: 'center',
    marginBottom: 30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  nowPlayingContainer: {
    alignItems: 'center',
  },
  albumArtContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },
  spotifyOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotifyIcon: {
    fontSize: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 5,
  },
  albumName: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlIcon: {
    fontSize: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 30,
  },
  shareButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSongContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSongIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  noSongTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noSongDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  // Recent Tracks Styles
  recentTracksSection: {
    marginTop: 40,
  },
  recentTracksTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recentTracksLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recentTracksLoadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
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
  noRecentTracks: {
    alignItems: 'center',
    padding: 20,
  },
  noRecentTracksText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
