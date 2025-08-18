# Circuit Breaker Test Documentation

## How the Circuit Breaker Works

The yt-dlp service now includes a circuit breaker pattern that prevents repeated failed requests to an unavailable backend:

### States

1. **Closed** (Normal): Service attempts connections normally
2. **Open** (Failed): After 3 failures, stops attempting connections for 5 minutes
3. **Half-Open** (Retry): After 5 minutes, allows one test connection

### Behavior

- **First failure**: Logs warning, continues attempting
- **Second failure**: Logs error, continues attempting  
- **Third failure**: Opens circuit breaker, stops logging errors
- **Circuit open**: Shows "temporarily unavailable" message
- **After 5 minutes**: Allows one retry attempt

### User Experience

1. **Initial failures**: User sees "Backend API Unavailable" 
2. **Circuit breaker opens**: User sees "Service Temporarily Unavailable"
3. **No repeated errors**: Console spam is eliminated
4. **Automatic recovery**: Service automatically retries when backend comes back

### Configuration Options

```env
# Completely disable backend (no connection attempts)
VITE_DISABLE_BACKEND=true

# Use different API URL
VITE_YT_DLP_API_URL=https://your-backend.com
```

### Testing

To test the circuit breaker:

1. Start frontend without backend
2. Go to search page
3. Should see initial connection error
4. After 3 failures, should see "temporarily unavailable"
5. No more console errors should appear
6. Start backend server
7. After 5 minutes OR page refresh, should reconnect

## Error Suppression

The system now suppresses:
- Repeated "Failed to fetch" errors after initial detection
- Network errors when circuit breaker is open
- Excessive API failure logging

## Manual Reset

Users can manually reset the circuit breaker by:
- Refreshing the page
- Waiting for the automatic retry period (5 minutes)
- Starting the backend server (will reconnect on next natural check)
