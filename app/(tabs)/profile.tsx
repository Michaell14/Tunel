import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUserStore } from '@/zustand/userStore';
import { useAuthRequest } from 'expo-auth-session';
import React, { useEffect } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SharedSong {
  id: string;
  spotifyTrackId: string;
  message?: string;
  sharedAt: string;
  likes: number;
  comments: number;
}

export default function ProfileScreen() {
  const { userData, setAccessToken, setUserData, setIsAuthenticated, logout } = useUserStore();
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "e92b7750096242e6b5761d6da9cf4a86",
      scopes: ['user-read-email', 'playlist-modify-public', 'user-read-recently-played', 'user-read-currently-playing', 'playlist-modify-private', 'user-read-playback-state', 'user-modify-playback-state'],
      usePKCE: true,
      redirectUri: "exp://127.0.0.1:8081/",
    },
    {
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      tokenEndpoint: 'https://accounts.spotify.com/api/token',
    }
  );

  useEffect(() => {
    async function handleResponse() {
      if (response?.type === 'success') {

        const { code } = response.params;
        
        try {
          // First, exchange code for tokens
          const codeResponse = await fetch(`https://tops-cod-liked.ngrok-free.app/api/auth/exchangeCodeForToken`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              code_verifier: request?.codeVerifier,
              userId: userData?.id || 'temp-user-id' // We'll need to create a user first
            }),
          });
          
          if (!codeResponse.ok) {
            throw new Error('Failed to exchange code for tokens');
          }
          
          const codeData = await codeResponse.json();

          if (codeData.access_token) {
            // Get user profile from Spotify
            const userResponse = await fetch(`https://tops-cod-liked.ngrok-free.app/api/spotify/profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: codeData.access_token
              }),
            });
            
            if (!userResponse.ok) {
              throw new Error('Failed to get user profile');
            }
            
            const spotifyUserData = await userResponse.json();
            console.log("spotifyUserData: ", spotifyUserData);
            
            if (spotifyUserData) {
              // Create or update user in our database
              const createUserResponse = await fetch(`https://tops-cod-liked.ngrok-free.app/api/users/create-or-update`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  spotifyId: spotifyUserData.id,
                  displayName: spotifyUserData.display_name,
                  email: spotifyUserData.email,
                  avatar: spotifyUserData.images?.[0]?.url,
                }),
              });
              
              if (!createUserResponse.ok) {
                throw new Error('Failed to create/update user');
              }
              
              setAccessToken(codeData.access_token);
              setUserData(spotifyUserData);
              setIsAuthenticated(true);
            } else {
              console.log('Error', 'Failed to get user data');
            }
          }
        } catch (error) {
          console.error('Authentication error:', error);
          Alert.alert('Authentication Error', 'Failed to connect Spotify account. Please try again.');
        }
      }
    }
    handleResponse();
  }, [response, request]);

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


  const renderSharedSong = ({ item }: { item: SharedSong }) => (
    <ThemedView style={styles.songCard}>
      <View style={styles.songHeader}>
        <ThemedText style={styles.timeAgo}>{formatTimeAgo(item.sharedAt)}</ThemedText>
        <TouchableOpacity onPress={() => { }}>
          <ThemedText style={styles.deleteButton}>🗑️</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.songInfo}>
        <View style={styles.songDetails}>
          <ThemedText style={styles.songName}>Spotify Track ID: {item.spotifyTrackId}</ThemedText>
          <ThemedText style={styles.artistName}>Track details will be loaded from Spotify</ThemedText>
        </View>
        <View style={styles.spotifyIcon}>
          <ThemedText style={styles.spotifyIconText}>🎵</ThemedText>
        </View>
      </View>

      {item.message && (
        <View style={styles.messageContainer}>
          <ThemedText style={styles.message}>{item.message}</ThemedText>
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statIcon}>❤️</ThemedText>
          <ThemedText style={styles.statText}>{item.likes}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statIcon}>💬</ThemedText>
          <ThemedText style={styles.statText}>{item.comments}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.connectContainer}>
            <ThemedText style={styles.connectTitle}>Welcome to Tunel</ThemedText>
            <ThemedText style={styles.connectDescription}>
              Connect your Spotify account to start sharing your music with friends.
            </ThemedText>
            <TouchableOpacity
              style={[styles.spotifyButton, { backgroundColor: '#1DB954' }]}
              onPress={() => promptAsync()}
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: userData.images?.[0]?.url || 'https://via.placeholder.com/80'
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{userData.display_name}</ThemedText>
            <ThemedText style={styles.profileEmail}>{userData.email}</ThemedText>
            {userData.images && (
              <ThemedText style={styles.spotifyName}>
                {userData.display_name} on Spotify
              </ThemedText>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{userData.followers?.total || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{userData.followers?.total || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </View>
        </View>

        {/* Spotify Connection */}
        <View style={styles.spotifySection}>
          {userData.images ? (
            <TouchableOpacity
              style={[styles.spotifyButton, { backgroundColor: '#FF3B30' }]}
              onPress={logout}
            >
              <ThemedText style={styles.spotifyButtonText}>Disconnect Spotify</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.spotifyButton, { backgroundColor: '#1DB954' }]}
              onPress={() => { promptAsync() }}
            >
              <ThemedText style={styles.spotifyButtonText}>Connect Spotify</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Shared Songs Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Shared Songs</ThemedText>
        </View>

      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 2,
  },
  spotifyName: {
    fontSize: 14,
    opacity: 0.6,
    color: '#1DB954',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  spotifySection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  songsContainer: {
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
    marginBottom: 10,
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    fontSize: 16,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
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
}); 