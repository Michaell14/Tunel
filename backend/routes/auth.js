const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const exchangeCodeForToken = async (code, code_verifier) => {
  try {
      const token_response = await fetch("https://accounts.spotify.com/api/token", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              client_id: "e92b7750096242e6b5761d6da9cf4a86",
              grant_type: 'authorization_code',
              code,
              redirect_uri: "exp://127.0.0.1:8081/",
              code_verifier: code_verifier || '' // PKCE code verifier
          }).toString()
      });

      const token_data = await token_response.json();
      return token_data; // Return full token response
  } catch (error) {
      console.error("Error exchanging code for token:", error);
      throw error;
  }
};

router.post('/exchangecodefortoken', async (req, res) => {
  const { code, code_verifier, userId } = req.body;

  if (!code) {
      return res.status(400).send('Code is required');
  } else if (!code_verifier) {
      return res.status(400).send("Code verifier is required");
  }
  if (!userId) {
      return res.status(400).send("User ID is required");
  }

  try {
    // Call the exchange function here
    const tokenData = await exchangeCodeForToken(code, code_verifier);
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    
    // Update user with Spotify tokens
    // await User.findByIdAndUpdate(userId, {
    //   spotifyAccessToken: tokenData.access_token,
    //   spotifyRefreshToken: tokenData.refresh_token,
    //   spotifyTokenExpiresAt: expiresAt,
    // });

    res.send({
        success: true,
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('Error storing Spotify tokens:', error);
    res.status(500).send('Internal server error');
  }
});

router.get("/health", (req, res) => {
  res.send({
    status: "OK",
  });
});

module.exports = router; 