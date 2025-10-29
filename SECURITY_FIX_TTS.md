# TTS API 403 Error - Security Fix

## Issue
The application was experiencing a 403 Forbidden error when attempting to use Google Cloud Text-to-Speech API. The root cause was that the API key was being exposed in client-side JavaScript code, which is a security vulnerability.

## Root Cause
1. **API Key Exposure**: The Google TTS API key was being passed directly to the client-side `AIVoiceService`
2. **Direct API Calls**: The client was making direct AJAX calls to `https://texttospeech.googleapis.com/v1/text:synthesize` with the API key in the URL query parameters
3. **CORS and Security**: Google Cloud APIs have restrictions on client-side usage, and exposed API keys can be exploited

## Solution
Implemented a proxy server architecture to securely handle TTS API requests:

### Changes Made

1. **Server-Side Proxy** (`server/proxy.js`)
   - Added new endpoint: `POST /api/synthesize`
   - Endpoint accepts TTS parameters (text, voice config, audio config)
   - Makes authenticated calls to Google Cloud TTS API server-side
   - Returns base64-encoded audio content to client
   - API key is kept secure on the server

2. **Client-Side Updates** (`src/services/AIVoiceService.ts`)
   - Changed constructor to accept `proxyUrl` instead of `apiKey`
   - Updated `generateAIVoice()` to call proxy endpoint
   - Removed all API key handling from client code
   - Default proxy URL: `http://localhost:4000`

3. **Configuration** (`.env.example`)
   - Added `GOOGLE_TTS_API_KEY` environment variable
   - Can reuse `GEMINI_API_KEY` if using the same Google Cloud project

4. **Tests** (`src/__tests__/AIVoiceService.test.ts`)
   - Created comprehensive test suite for AIVoiceService
   - Tests proxy endpoint calls
   - Validates request structure
   - Tests error handling

### How to Use

1. **Set up environment variables**:
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and set your API keys
   GEMINI_API_KEY=your-gemini-api-key
   # The TTS API key should be from the same Google Cloud project with Text-to-Speech API enabled
   GOOGLE_TTS_API_KEY=your-google-tts-api-key  # Can be same as GEMINI_API_KEY if from same project
   ```

2. **Start the proxy server**:
   ```bash
   npm run proxy
   ```

3. **Start the web application** (in another terminal):
   ```bash
   npm run web
   ```

4. **For production deployment**:
   - Deploy the proxy server to a cloud platform (e.g., Heroku, Cloud Run, AWS Lambda)
   - Update the client to use the production proxy URL
   - Set environment variables on your hosting platform

### Security Benefits

- ✅ **No API Key Exposure**: API keys never leave the server
- ✅ **Centralized Security**: Single point of control for API authentication
- ✅ **Rate Limiting**: Can implement rate limiting at the proxy level
- ✅ **Monitoring**: Easier to monitor and log API usage
- ✅ **CORS Handling**: Proxy handles CORS issues

### Architecture Diagram

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

### Testing

Run the test suite to verify the implementation:

```bash
npm test -- src/__tests__/AIVoiceService.test.ts
```

All tests should pass, confirming:
- Proxy endpoint is called correctly
- Request structure is valid
- Error handling works properly

## Migration Notes

If you have existing code that was using the old API key approach:

**Before**:
```typescript
const voiceService = new VoiceService(apiKey);
```

**After**:
```typescript
const voiceService = new VoiceService(); // Uses default proxy URL
// or
const voiceService = new VoiceService('http://custom-proxy:4000');
```

## Related Files

- `server/proxy.js` - Proxy server implementation
- `src/services/AIVoiceService.ts` - Client-side TTS service
- `src/services/VoiceService.ts` - Voice service wrapper
- `src/__tests__/AIVoiceService.test.ts` - Test suite
- `.env.example` - Environment configuration template
- `TTS_IMPLEMENTATION.md` - Detailed TTS documentation
