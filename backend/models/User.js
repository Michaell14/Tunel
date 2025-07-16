const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  spotifyId: String,
  displayName: String,
  email: String,
  avatar: String,
  // Social features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // App preferences

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Spotify integration
  spotifyAccessToken: {
    type: String,
    select: false
  },
  spotifyRefreshToken: {
    type: String,
    select: false
  },
  spotifyTokenExpiresAt: {
    type: Date,
    select: false
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 