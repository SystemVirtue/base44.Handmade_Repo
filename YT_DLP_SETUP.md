# YouTube yt-dlp Integration Setup

This application has been updated to use **yt-dlp** instead of YouTube Data API v3, eliminating the need for API keys and quotas.

## Benefits of yt-dlp

✅ **No API Keys Required** - No more API key management or quota limits
✅ **Direct Video Access** - Extract video information and streaming URLs directly
✅ **Better Reliability** - Less prone to rate limiting and API changes
✅ **Rich Metadata** - Get comprehensive video information
✅ **No Costs** - Free to use without any usage limits

## Installation Requirements

### 1. Install yt-dlp

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install yt-dlp
```

#### On macOS:
```bash
brew install yt-dlp
```

#### On Windows:
Download from: https://github.com/yt-dlp/yt-dlp/releases

#### Using pip:
```bash
pip install yt-dlp
```

### 2. Verify Installation

```bash
yt-dlp --version
```

## How It Works

The application now uses the `youtube-dl-exec` npm package to interface with yt-dlp:

1. **Search**: Uses `ytsearch<N>:query` to search YouTube
2. **Metadata**: Extracts video title, duration, thumbnail, channel info
3. **Streaming**: Gets direct video URLs for playback
4. **No Limits**: No API quotas or rate limiting

## Features Replaced

| Old YouTube API v3 | New yt-dlp Implementation |
|-------------------|---------------------------|
| API key management | No keys needed |
| Quota tracking | No quotas |
| Search videos | yt-dlp search |
| Video details | Direct extraction |
| Playlist info | Direct playlist parsing |
| Rate limiting | No limits |

## Configuration

No configuration required! The service automatically:

- Detects if yt-dlp is available
- Falls back gracefully if not installed
- Provides clear error messages for setup

## Troubleshooting

### "yt-dlp not available" Error

1. **Check Installation**: Run `yt-dlp --version` in terminal
2. **Check PATH**: Ensure yt-dlp is in system PATH
3. **Permissions**: Make sure yt-dlp executable has proper permissions
4. **Version**: Use latest version of yt-dlp for best compatibility

### Search Not Working

1. **Internet Connection**: Ensure stable internet connection
2. **YouTube Access**: Check if YouTube is accessible
3. **yt-dlp Updates**: Update yt-dlp: `pip install -U yt-dlp`

### Performance Tips

1. **Format Selection**: Service defaults to 720p for balance of quality/speed
2. **Caching**: Results are cached for 5 minutes to improve performance
3. **Concurrent Requests**: Multiple searches are handled efficiently

## Migration Notes

- **API Keys Removed**: All YouTube API key configuration has been removed
- **Settings Updated**: API key settings tab no longer exists
- **Error Handling**: New error messages for yt-dlp specific issues
- **Service Status**: Updated service status components

## Development

To test the integration during development:

```bash
# Install yt-dlp for testing
pip install yt-dlp

# Start the application
npm run dev

# Test search functionality in the UI
```

The application will automatically detect yt-dlp availability and show appropriate status messages.
