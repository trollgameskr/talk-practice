# Direct Google Cloud TTS API Access

## Overview

This document explains how the application now supports direct Google Cloud Text-to-Speech API access for GitHub Pages deployment, enabling AI voice synthesis without requiring a proxy server.

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

### New Architecture (Direct API Access)
```
┌─────────────────┐
│  Web Browser    │
│   (Client)      │
│  - Has API Key  │
│  (from build)   │
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

1. **Build Time Injection**: During the webpack build process, the `GOOGLE_TTS_API_KEY` environment variable is injected into the bundled JavaScript.

2. **Runtime Detection**: The `AIVoiceService` checks for the API key in `process.env.GOOGLE_TTS_API_KEY` at initialization.

3. **Automatic Fallback**: 
   - If API key is available → Use direct API calls
   - If proxy URL is provided → Use proxy server
   - If neither → TTS is disabled

## Configuration

### GitHub Actions Setup

Add the `GOOGLE_TTS_API_KEY` secret to your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `GOOGLE_TTS_API_KEY`
5. Value: Your Google Cloud API key (e.g., `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Local Development

For local development, you can either:

**Option 1: Use the Proxy Server (Recommended for Development)**
```bash
# Set up .env file
cp .env.example .env
# Edit .env and add your GOOGLE_TTS_API_KEY

# Start proxy server in one terminal
npm run proxy

# Start web app in another terminal
npm run web
```

**Option 2: Use Direct API Access**
```bash
# Set environment variable
export GOOGLE_TTS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Build and run
npm run build:web
# Serve the web-build directory
```

## Security Considerations

⚠️ **Important Security Notes**

### API Key Exposure
When using direct API access, the Google Cloud TTS API key is embedded in the client-side JavaScript bundle. This means:

1. **The API key is visible** to anyone who views the source code or network traffic
2. **The API key can be extracted** and potentially misused
3. **API quotas and billing** could be affected if the key is misused

### Mitigation Strategies

1. **API Key Restrictions** (Highly Recommended)
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Edit your API key
   - Add restrictions:
     - **Application restrictions**: HTTP referrers (websites)
       - Add your GitHub Pages domain: `https://yourusername.github.io/talk-practice/*`
       - For local testing: `http://localhost:3000/*`
     - **API restrictions**: Restrict key to "Cloud Text-to-Speech API" only

2. **Quota Management**
   - Set up [quota limits](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas) in Google Cloud Console
   - Monitor usage regularly
   - Set up billing alerts

3. **Usage Monitoring**
   - Enable [Cloud Logging](https://console.cloud.google.com/logs) to track API usage
   - Set up alerts for unusual activity
   - Review logs periodically

### Production Deployment Recommendations

For production deployments with sensitive use cases, consider:

1. **Use a Backend Server**: Deploy a proxy server to a cloud platform:
   - Google Cloud Run
   - AWS Lambda
   - Heroku
   - Vercel Serverless Functions

2. **Implement Rate Limiting**: Add rate limiting on your proxy server to prevent abuse

3. **User Authentication**: Require user authentication before allowing TTS access

## Development vs Production

### Development Mode (this implementation)
- ✅ Easy to set up and deploy
- ✅ No server infrastructure required
- ✅ Works on static hosting (GitHub Pages)
- ⚠️ API key is exposed in client code
- ⚠️ Relies on Google's API restrictions for security

### Production Mode (with proxy)
- ✅ API key remains secure on the server
- ✅ Full control over rate limiting and access
- ✅ Better security posture
- ❌ Requires server infrastructure
- ❌ More complex deployment

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

1. **Check API Key**: Verify the `GOOGLE_TTS_API_KEY` secret is set in GitHub repository settings
2. **Check API Restrictions**: Ensure the API key allows requests from your GitHub Pages domain
3. **Check API Quota**: Verify you haven't exceeded your Google Cloud TTS quota
4. **Check Browser Console**: Look for error messages in the browser's developer console

### Build Errors

1. **Verify Environment Variable**: Check that `GOOGLE_TTS_API_KEY` is available during build
2. **Check Webpack Config**: Ensure `webpack.config.js` includes `GOOGLE_TTS_API_KEY` in DefinePlugin

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
