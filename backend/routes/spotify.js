const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/spotify/profile
// @desc    Get user's Spotify profile
// @access  Private
const getCurrentUser = async (access_token) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log("response: ", response);
      return response.json()
    })
    .then((data) => {
      console.log('User Profile:', data);
      return data;
    })
    .catch((error) => {
      console.error('Error fetching user profile:', error);
    });
  return response;
};

// Get's current user's profile
router.post('/profile', async (req, res) => {
  const { access_token } = req.body;

  try {
    const userProfile = await getCurrentUser(access_token);
    console.log("userProfile: ", userProfile);

    if (!userProfile) {
      return res.status(400).send('Failed to get user profile');
    }
    return res.json(userProfile);

  } catch (error) {
    console.error('Error in user creation/update:', error);
    res.status(500).send('Internal server error');
  }
});

// @route   GET /api/spotify/search
// @desc    Search Spotify for tracks, artists, and albums
// @access  Private
router.post('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.body;
    const accessToken = req.headers['authorization'];

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search Spotify API
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Spotify API error',
        details: errorData 
      });
    }

    const data = await response.json();
    res.json(data.tracks.items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/currently-playing', async (req, res) => {
  const accessToken = req.headers['authorization'];
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/currently-playing`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  res.json(data);
});

router.post('/recent-tracks', async (req, res) => {
  const accessToken = req.headers['authorization'];
  const { limit } = req.body;
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  res.json(data);
});

module.exports = router; 