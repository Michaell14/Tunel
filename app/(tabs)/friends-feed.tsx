import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../zustand/userStore';

interface FeedSong {
  id: string;
  spotifyTrackId: string;
  message?: string;
  sharedAt: string;
  likes: number;
  comments: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  isLiked: boolean;
}

export default function FriendsFeedScreen() {
  const colorScheme = useColorScheme();
  const { userData, isAuthenticated } = useUserStore();
  const [feedSongs, setFeedSongs] = useState<FeedSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     loadFeed();
  //   }
  // }, [isAuthenticated]);

  // const loadFeed = async (pageNum: number = 1) => {
  //   if (!isAuthenticated) return;
    
  //   setLoading(true);
  //   try {
  //     const response = await apiService.getFriendsFeed(pageNum);
  //     if (response.data) {
  //       const newSongs = (response.data as any).songs || [];
  //       if (pageNum === 1) {
  //         setFeedSongs(newSongs);
  //       } else {
  //         setFeedSongs(prev => [...prev, ...newSongs]);
  //       }
  //       setHasMore(newSongs.length > 0);
  //     }
  //   } catch (error) {
  //     console.error('Error loading feed:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onRefresh = async () => {
  //   setRefreshing(true);
  //   setPage(1);
  //   await loadFeed(1);
  //   setRefreshing(false);
  // };

  // const loadMore = async () => {
  //   if (!hasMore || loading) return;
    
  //   const nextPage = page + 1;
  //   setPage(nextPage);
  //   await loadFeed(nextPage);
  // };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // const handleLike = async (songId: string) => {
  //   try {
  //     const song = feedSongs.find(s => s.id === songId);
  //     if (!song) return;

  //     const response = song.isLiked 
  //       ? await apiService.unlikeSong(songId)
  //       : await apiService.likeSong(songId);

  //     if (response.error) {
  //       Alert.alert('Error', response.error);
  //     } else {
  //       setFeedSongs(prev => prev.map(s => 
  //         s.id === songId 
  //           ? { ...s, isLiked: !s.isLiked, likes: s.isLiked ? s.likes - 1 : s.likes + 1 }
  //           : s
  //       ));
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to update like');
  //   }
  // };

  const openSpotify = (spotifyTrackId: string) => {
    // In a real app, you'd use Linking to open Spotify
    console.log('Opening Spotify track:', spotifyTrackId);
    Alert.alert('Spotify', 'This would open the song in Spotify app');
  };

  const renderFeedSong = ({ item }: { item: FeedSong }) => (
    <ThemedView style={styles.songCard}>
      <View style={styles.songHeader}>
        <View style={styles.userInfo}>
          <Image 
            source={{ 
              uri: item.user.avatar || 'https://via.placeholder.com/40'
            }} 
            style={styles.userAvatar} 
          />
          <View style={styles.userDetails}>
            <ThemedText style={styles.username}>{item.user.username}</ThemedText>
            <ThemedText style={styles.timeAgo}>{formatTimeAgo(item.sharedAt)}</ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.songInfo}
        onPress={() => openSpotify(item.spotifyTrackId)}
      >
        <View style={styles.songDetails}>
          <ThemedText style={styles.songName}>Spotify Track ID: {item.spotifyTrackId}</ThemedText>
          <ThemedText style={styles.artistName}>Track details will be loaded from Spotify</ThemedText>
        </View>
        <View style={styles.spotifyIcon}>
          <ThemedText style={styles.spotifyIconText}>🎵</ThemedText>
        </View>
      </TouchableOpacity>

      {item.message && (
        <View style={styles.messageContainer}>
          <ThemedText style={styles.message}>{item.message}</ThemedText>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {}}
        >
          <ThemedText style={[
            styles.actionIcon, 
            item.isLiked && styles.likedIcon
          ]}>
            {item.isLiked ? '❤️' : '🤍'}
          </ThemedText>
          <ThemedText style={styles.actionText}>{item.likes}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionIcon}>💬</ThemedText>
          <ThemedText style={styles.actionText}>{item.comments}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionIcon}>📤</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.connectContainer}>
            <ThemedText style={styles.connectTitle}>Welcome to Tunel</ThemedText>
            <ThemedText style={styles.connectDescription}>
              Connect your Spotify account to see your friends' shared music.
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
          <ThemedText style={styles.title}>Friends' Feed</ThemedText>
          <ThemedText style={styles.subtitle}>See what your friends are listening to</ThemedText>
        </View>

        {loading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Loading feed...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={feedSongs}
            renderItem={renderFeedSong}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {}}
                tintColor={Colors[colorScheme ?? 'light'].tint}
              />
            }
            onEndReached={() => {}}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No songs in your feed</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Follow some friends to see their shared music here!
                </ThemedText>
              </View>
            }
            ListFooterComponent={
              hasMore && page > 1 ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={styles.loadingMoreText}>Loading more...</ThemedText>
                </View>
              ) : null
            }
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  feedContainer: {
    padding: 20,
  },
  songCard: {
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.6,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  songDetails: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  spotifyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotifyIconText: {
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  likedIcon: {
    color: '#FF3B30',
  },
  actionText: {
    fontSize: 14,
    opacity: 0.8,
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
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.8,
  },
}); 