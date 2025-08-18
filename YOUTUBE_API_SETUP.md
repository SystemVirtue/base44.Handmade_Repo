# YouTube API Setup Instructions

## Overview

DJAMMS requires valid YouTube Data API v3 keys to load playlists and search for music. If you're seeing HTTP 403 errors, it means the API keys need to be properly configured.

## Quick Fix for Current Error

The HTTP 403 error you're experiencing indicates that the YouTube API keys in your `.env` file are either:
1. Invalid or expired
2. Don't have YouTube Data API v3 enabled
3. Have exceeded their daily quota

## How to Set Up YouTube API Keys

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### Step 3: Create API Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the key to YouTube Data API v3 for security

### Step 4: Configure Multiple Keys (Recommended)
For better reliability and higher quota limits, create multiple API keys:
1. Repeat Step 3 to create additional keys
2. You can create up to 9 keys for the application

### Step 5: Update Your .env File
Replace the API keys in your `.env` file with your new valid keys:

```env
# YouTube API Keys (Replace with your valid keys)
VITE_YOUTUBE_API_KEY_1=YOUR_FIRST_API_KEY_HERE
VITE_YOUTUBE_API_KEY_2=YOUR_SECOND_API_KEY_HERE
VITE_YOUTUBE_API_KEY_3=YOUR_THIRD_API_KEY_HERE
# ... add more keys as needed
```

### Step 6: Restart the Application
After updating the `.env` file:
1. Stop the development server (Ctrl+C)
2. Restart with `npm run dev`
3. The app will automatically validate your new keys

## Quota Information

Each YouTube API key has a daily quota of 10,000 units:
- Search requests cost 100 units each
- Playlist requests cost 1 unit each
- Video details requests cost 1 unit each

Multiple keys allow for higher total daily quota.

## Troubleshooting

### Error: "No valid YouTube API keys available"
- Check that your keys are properly formatted in the `.env` file
- Ensure YouTube Data API v3 is enabled for your project
- Verify the keys haven't expired or been disabled

### Error: "All API keys have exceeded their daily quota"
- Wait until the next day for quota reset (resets at midnight Pacific Time)
- Add more API keys to increase total quota
- Consider optimizing API usage in your application

### Error: "API key validation failed"
- The key might be invalid or restricted
- Check that the key has permission to access YouTube Data API v3
- Verify the key hasn't been deleted or disabled in Google Cloud Console

## Testing Your Setup

After configuring your API keys, the application will:
1. Automatically validate each key during startup
2. Show the status in the console logs
3. Display user-friendly notifications if there are issues
4. Load the default playlist if keys are working properly

## API Key Security

- Never commit API keys to version control
- Use environment variables (`.env` file) for local development
- For production, set environment variables on your hosting platform
- Consider restricting API keys to specific services in Google Cloud Console

## Getting Help

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify your Google Cloud project settings
3. Ensure billing is enabled for your Google Cloud project (required for API access)
4. Check the YouTube Data API quotas and usage in Google Cloud Console

## Example Working Configuration

Your `.env` file should look like this with valid keys:

```env
# DJAMMS Environment Configuration
VITE_APP_NAME=DJAMMS
VITE_APP_VERSION=3.29.0

# YouTube API Keys (Replace these with your actual keys)
VITE_YOUTUBE_API_KEY_1=AIzaSyABCDEF123456789_YourActualKeyHere
VITE_YOUTUBE_API_KEY_2=AIzaSyGHIJKL123456789_YourSecondKeyHere
VITE_YOUTUBE_API_KEY_3=AIzaSyMNOPQR123456789_YourThirdKeyHere

# Features
VITE_ENABLE_YOUTUBE=true
VITE_DEBUG_MODE=true
```

Once properly configured, the HTTP 403 errors should be resolved and the application will function normally.
