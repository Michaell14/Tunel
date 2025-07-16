# Spotify Integration Setup Guide

This guide will help you set up Spotify authentication for the Profile tab in your Tunel app.

## Prerequisites

1. A Spotify account
2. Access to the Spotify Developer Dashboard

## Step 1: Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Tunel (or your preferred name)
   - **App description**: Music discovery app
   - **Website**: Your website URL (optional)
   - **Redirect URIs**: `tunel://spotify-callback`
   - **API/SDKs**: Web API
5. Accept the terms and create the app

## Step 2: Get Your Client ID

1. After creating the app, you'll be taken to the app dashboard
2. Copy the **Client ID** (you'll need this for the next step)

## Step 3: Update the Profile Component

1. Open `app/(tabs)/profile.tsx`
2. Find this line:
   ```typescript
   const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // You'll need to replace this
   ```
3. Replace `'YOUR_SPOTIFY_CLIENT_ID'` with your actual Client ID from Step 2

## Step 4: Configure App Bundle Identifiers (Optional)

If you plan to publish your app, update the bundle identifiers in `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.tunel"
    },
    "android": {
      "package": "com.yourcompany.tunel"
    }
  }
}
```

Replace `com.yourcompany.tunel` with your actual bundle identifier.

## Step 5: Test the Integration

1. Run your app: `npm start`
2. Navigate to the Profile tab
3. Tap "Login with Spotify"
4. Complete the Spotify authentication flow
5. You should see your Spotify profile information, top tracks, and recently played tracks

## Features Included

The Profile tab includes the following Spotify features:

- **User Profile**: Display name, email, profile picture, followers count, and country
- **Top Tracks**: Your most played tracks (short-term)
- **Recently Played**: Your recently played tracks
- **Authentication**: Secure OAuth flow with Spotify
- **Logout**: Ability to disconnect from Spotify

## Troubleshooting

### Authentication Issues
- Make sure your Client ID is correct
- Verify the redirect URI matches exactly: `tunel://spotify-callback`
- Check that your Spotify app is properly configured in the developer dashboard

### API Errors
- Ensure you have the correct scopes enabled in your Spotify app
- Check that your Spotify account has the necessary permissions
- Verify your internet connection

### App Crashes
- Make sure all dependencies are installed
- Check the console for any error messages
- Verify that the app.json configuration is correct

## Security Notes

- Never commit your Client ID to version control
- Consider using environment variables for sensitive configuration
- The current implementation stores tokens in memory only - for production, implement secure token storage

## Next Steps

For production use, consider implementing:

1. Secure token storage using Expo SecureStore
2. Token refresh logic
3. Error handling and retry mechanisms
4. Offline support
5. Additional Spotify API endpoints (playlists, artists, etc.) 