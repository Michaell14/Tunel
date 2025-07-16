# Tunel Backend

A Node.js/Express backend for the Tunel music sharing app with Spotify integration.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Spotify Integration**: OAuth flow for connecting Spotify accounts
- **Social Features**: Follow/unfollow users, share songs, like and comment
- **Real-time Data**: Currently playing tracks, recent tracks, top tracks
- **Search**: Search for users, songs, and artists
- **Security**: Rate limiting, input validation, CORS protection

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Spotify Developer Account

## Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Spotify API Configuration
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Database Configuration (MongoDB)
   MONGODB_URI=mongodb://localhost:27017/tunel

   # CORS Configuration
   CORS_ORIGIN=http://localhost:8081

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add redirect URI: `http://127.0.0.1:3000/api/auth/spotify/callback`
   - Copy Client ID and Client Secret to your `.env` file

5. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Spotify Integration
- `GET /api/spotify/auth` - Get Spotify authorization URL
- `GET /api/spotify/callback` - Handle Spotify OAuth callback
- `POST /api/spotify/refresh-token` - Refresh Spotify access token
- `GET /api/spotify/profile` - Get user's Spotify profile
- `GET /api/spotify/currently-playing` - Get currently playing track
- `GET /api/spotify/recent-tracks` - Get recently played tracks
- `GET /api/spotify/top-tracks` - Get top tracks
- `POST /api/spotify/disconnect` - Disconnect Spotify account

### Users
- `GET /api/users/profile` - Get current user's profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/follow/:id` - Follow a user
- `POST /api/users/unfollow/:id` - Unfollow a user
- `GET /api/users/search` - Search users
- `GET /api/users/following` - Get following list
- `GET /api/users/followers` - Get followers list

### Songs
- `POST /api/songs/share` - Share a song
- `GET /api/songs/feed` - Get friends' song feed
- `GET /api/songs/user/:userId` - Get user's shared songs
- `POST /api/songs/:songId/like` - Like a song
- `POST /api/songs/:songId/unlike` - Unlike a song
- `POST /api/songs/:songId/comment` - Comment on a song
- `DELETE /api/songs/:songId` - Delete a shared song
- `GET /api/songs/trending` - Get trending songs

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  spotifyTokenExpiresAt: Date,
  spotifyProfile: {
    id: String,
    displayName: String,
    email: String,
    images: Array,
    followers: Number,
    country: String
  },
  followers: [ObjectId],
  following: [ObjectId],
  preferences: {
    theme: String,
    notifications: Object
  },
  isActive: Boolean,
  lastSeen: Date
}
```

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: All inputs are validated using express-validator
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: Secure authentication with expiration

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SPOTIFY_CLIENT_ID` - Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify app client secret
- `CORS_ORIGIN` - Allowed CORS origin

## Error Handling

The API returns consistent error responses:

```javascript
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Testing

```bash
npm test
```

## Deployment

1. Set `NODE_ENV=production`
2. Update environment variables for production
3. Use a process manager like PM2
4. Set up MongoDB Atlas or production MongoDB
5. Configure reverse proxy (nginx)
6. Set up SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 