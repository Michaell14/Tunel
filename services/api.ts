const API_BASE_URL = 'https://tops-cod-liked.ngrok-free.app/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

interface AuthResponse {
  user: any;
  message: string;
}

class ApiService {

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authentication header if needed
    if (includeAuth) {
      // Get user ID from store - this is a simplified approach
      // In a real app, you might use a more sophisticated auth system
      const userStore = require('../zustand/userStore').useUserStore.getState();
      const accessToken = userStore.accessToken;

      if (accessToken) {
        headers['Authorization'] = accessToken;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(includeAuth),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: 'Network error',
        details: error,
      };
    }
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    // await this.removeToken();
  }

  async getHealth() {
    return this.request('/auth/health')
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Spotify methods
  async getSpotifyAuthUrl() {
    return this.request<{ authUrl: string }>('/spotify/auth');
  }

  async getSpotifyProfile() {
    return this.request('/spotify/profile', {}, true);
  }

  async getCurrentlyPlaying() {
    return this.request('/spotify/currently-playing', {
      method: 'POST'
    }, true);
  }

  async getRecentTracks(limit: number = 20) {
    return this.request(`/spotify/recent-tracks`, {
      method: 'POST',
      body: JSON.stringify({
        limit: limit
      })
    }, true);
  }

  async searchSpotifySongs(query: string, limit: number = 15) {
    return this.request(`/spotify/search`, {
      method: 'POST',
      body: JSON.stringify({
        q: encodeURIComponent(query),
        limit: limit
      })
    }, true);
  }

  async disconnectSpotify() {
    return this.request('/spotify/disconnect', { method: 'POST' }, true);
  }

  // User methods
  async updateProfile(updates: { username?: string; bio?: string; avatar?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, true);
  }

  async searchUsers(query: string, limit: number = 10) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }
}

export const apiService = new ApiService();
export default apiService; 