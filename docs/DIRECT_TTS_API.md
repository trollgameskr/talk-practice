# Direct Google Cloud TTS API Access

## Overview

This document explains how the application supports direct Google Cloud Text-to-Speech API access using user-provided API keys, enabling AI voice synthesis without requiring a proxy server or build-time API key injection.

## Architecture Changes

### Previous Architecture (Proxy-Based)
```
┌─────────────────┐
│  Web Browser    │
│   (Client)      │
└────────┬────────┘
         │ POST /api/synthesize
         │ { text, voice, audioConfig }
         ▼
┌─────────────────┐
│  Proxy Server   │
│  (localhost:4000)│
│  - Has API Key  │
└────────┬────────┘
         │ POST with API key
         │ Authorization: Bearer ...
         ▼
┌─────────────────┐
│  Google Cloud   │
│   TTS API       │
└─────────────────┘
```

### New Architecture (User-Provided API Keys)
```
┌─────────────────┐
│  Web Browser    │
│   (Client)      │
│  - API Key from │
│  User Settings  │
└────────┬────────┘
         │ POST with API key
         │ ?key=AIxxx...
         ▼
┌─────────────────┐
│  Google Cloud   │
│   TTS API       │
└─────────────────┘
```

## How It Works

1. **User Input**: Users enter their own Google Cloud TTS API key in the Settings screen.

2. **Secure Storage**: The API key is stored in the browser's local storage (AsyncStorage/localStorage).

3. **Runtime Usage**: The `AIVoiceService` loads the user-provided API key at initialization and uses it for direct API calls.

4. **Automatic Fallback**: 
   - If user API key is available → Use direct API calls
   - If proxy URL is provided (local development) → Use proxy server
   - If neither → TTS is disabled (text-only mode)

## User Setup

### Getting an API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) or [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new API key or use an existing one
3. Enable the "Cloud Text-to-Speech API" for your project
4. (Recommended) Set up API key restrictions (see [Security Considerations](#security-considerations))

### Configuring the App

1. Open the app and go to Settings
2. Scroll to the "TTS API Configuration" section
3. Enter your Google Cloud TTS API key
4. Click "Save TTS API Key"
5. Start practicing with AI voice synthesis!

**Note**: You can use the same API key for both Gemini and TTS features.

## Security Note

✅ **Improved Security**: This implementation stores API keys securely in the user's browser local storage. Each user provides their own API key, which is never embedded in the application code or build artifacts.

## Configuration

### For End Users

No special configuration is needed! Simply:
1. Get your own API key from Google AI Studio or Google Cloud Console
2. Enter it in the app's Settings screen
3. Start using AI voice synthesis

### For Developers (Local Development)

For local development, you can still use the proxy server:

```bash
# Set up .env file
cp .env.example .env
# Edit .env and add your GOOGLE_TTS_API_KEY

# Start proxy server in one terminal
npm run proxy

# Start web app in another terminal
npm run web
```

Or, enter your API key directly in the Settings screen after starting the app.

## Security Considerations

✅ **Enhanced Security Model**

This implementation provides better security compared to build-time API key injection:

1. **No API Key in Code**: API keys are never embedded in the application's source code or build artifacts
2. **User-Controlled**: Each user manages their own API key and quota
3. **Local Storage Only**: API keys are stored in the browser's local storage, not transmitted to any server (except Google's API)

### Best Practices for Users

1. **API Key Restrictions** (Highly Recommended)
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Edit your API key
   - Add restrictions:
     - **Application restrictions**: HTTP referrers (websites)
       - Add domains you trust (e.g., `https://trollgameskr.github.io/talk-practice/*`)
       - For local testing: `http://localhost:3000/*`
     - **API restrictions**: Restrict key to "Cloud Text-to-Speech API" only

2. **Quota Management**
   - Set up [quota limits](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas) in Google Cloud Console
   - Monitor usage regularly
   - Set up billing alerts

3. **Key Rotation**
   - Rotate your API key periodically for better security
   - If you suspect your key has been compromised, delete it and create a new one

### For Developers

No special security configuration needed for deployment! The app works entirely with user-provided keys.

## Testing

The implementation includes comprehensive tests for both direct API and proxy modes:

```bash
npm test -- src/__tests__/AIVoiceService.test.ts
```

Tests cover:
- Direct API calls with API key
- Proxy server calls
- Error handling
- Configuration management

## API Usage

### Direct API Call Example

When using direct API access, the service makes requests like:

```javascript
POST https://texttospeech.googleapis.com/v1/text:synthesize?key=AIxxxxx
Content-Type: application/json

{
  "input": {
    "text": "Hello, world!"
  },
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Neural2-A",
    "ssmlGender": "FEMALE"
  },
  "audioConfig": {
    "audioEncoding": "MP3",
    "speakingRate": 1.0,
    "pitch": 0.0,
    "volumeGainDb": 0.0
  }
}
```

### Response

```json
{
  "audioContent": "base64_encoded_audio_data..."
}
```

## Troubleshooting

### TTS Not Working

1. **Check API Key**: Verify you've entered a valid API key in Settings
2. **Check API Restrictions**: Ensure the API key allows requests from the domain you're using
3. **Check API Quota**: Verify you haven't exceeded your Google Cloud TTS quota
4. **Check Browser Console**: Look for error messages in the browser's developer console
5. **Verify API is Enabled**: Make sure the Cloud Text-to-Speech API is enabled in your Google Cloud project

### Common Issues

**"TTS API key or proxy not configured"**
- You haven't entered a TTS API key in Settings yet
- Go to Settings → TTS API Configuration and enter your key

**"API request failed: 403"**
- Your API key has restrictions that prevent it from working with the current domain
- Check your API key restrictions in Google Cloud Console
- Make sure the domain is allowed in the HTTP referrers list

**"API request failed: 429"**
- You've exceeded your quota
- Wait for the quota to reset or increase your quota in Google Cloud Console

### Build Errors

No special build configuration needed! The app works entirely with runtime user-provided keys.

### API Errors

Common error codes:
- `403 Forbidden`: API key restrictions or invalid key
- `429 Too Many Requests`: Quota exceeded
- `400 Bad Request`: Invalid request parameters

## Related Files

- `src/services/AIVoiceService.ts` - Main TTS service implementation
- `webpack.config.js` - Build configuration with API key injection
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow
- `server/proxy.js` - Proxy server (still available for local development)

## Further Reading

- [Google Cloud Text-to-Speech API Documentation](https://cloud.google.com/text-to-speech/docs)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Restricting API Keys](https://cloud.google.com/docs/authentication/api-keys#adding_restrictions)
