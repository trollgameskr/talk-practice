# Testing the TTS Proxy Fix Locally

This guide helps you test the TTS proxy implementation locally to ensure the 403 error is fixed.

## Prerequisites

- Node.js v16 or later
- A Google Cloud API key with Text-to-Speech API enabled

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
# You can use the same API key for both if they're from the same Google Cloud project
```

Edit `.env`:
```bash
GEMINI_API_KEY=AIza...your-actual-api-key...
GOOGLE_TTS_API_KEY=AIza...your-actual-api-key...  # Can be the same as GEMINI_API_KEY

# Optional: Configure proxy server if needed
# HTTPS_PROXY=http://proxy.example.com:8080
# HTTP_PROXY=http://proxy.example.com:8080
# NO_PROXY=localhost,127.0.0.1
```

### 3. Start the Proxy Server

In one terminal window:
```bash
npm run proxy
```

You should see:
```
Proxy server listening on http://localhost:4000
```

### 4. Start the Web Application

In another terminal window:
```bash
npm run web
```

The web app will start at `http://localhost:8080`

### 5. Test TTS Functionality

1. Open your browser to `http://localhost:8080`
2. Enter your Gemini API key in the settings
3. Start a conversation
4. When the AI responds, it should speak using Google Cloud TTS
5. Check the browser console - you should NOT see any 403 errors
6. Check the proxy server terminal - you should see logs like:
   ```
   [proxy] POST /api/synthesize
   ```

## Verification Checklist

- [ ] Proxy server starts without errors
- [ ] Web app loads successfully
- [ ] No 403 errors in browser console when TTS speaks
- [ ] Audio plays correctly
- [ ] Proxy server logs show `/api/synthesize` requests
- [ ] No API keys visible in browser Network tab

## Troubleshooting

### Proxy Server Won't Start

**Error**: `Missing GOOGLE_TTS_API_KEY on server`

**Solution**: Make sure you've created `.env` file with the API keys

### 403 Error Still Appears

**Possible causes**:
1. API key doesn't have Text-to-Speech API enabled
   - Go to Google Cloud Console
   - Enable "Cloud Text-to-Speech API"
   
2. Proxy server not running
   - Check that `npm run proxy` is running in a separate terminal
   
3. Wrong proxy URL
   - The client defaults to `http://localhost:4000`
   - Make sure proxy is running on port 4000

### No Audio Plays

**Check**:
1. Browser console for errors
2. Proxy server logs for TTS API errors
3. API quota hasn't been exceeded

## Running Tests

```bash
# Run all tests
npm test

# Run only TTS-related tests
npm test -- src/__tests__/AIVoiceService.test.ts
```

All tests should pass:
```
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

## Security Verification

### Check No API Keys in Client Code

```bash
# This should return NO results (except validation code)
grep -r "AIza" src/ --include="*.ts" --include="*.tsx" | grep -v "test" | grep -v "example"
```

### Check No API Keys in Build

```bash
npm run build:web
grep -r "AIzaSy" web-build/
```

This should return no results.

### Run Security Scan

The CodeQL checker should show 0 vulnerabilities:
```bash
# This is done automatically in CI/CD
```

## Next Steps

After verifying locally:
1. Commit your changes
2. Push to GitHub
3. The CI/CD pipeline will run automatically
4. Deploy the proxy server to your production environment
5. Update the client proxy URL for production

## Production Deployment

For production, you'll need to:

1. Deploy the proxy server to a cloud platform (Heroku, Cloud Run, AWS Lambda, etc.)
2. Set environment variables on your hosting platform
3. Update the client to use the production proxy URL:

```typescript
// In production, use your deployed proxy URL
const voiceService = new VoiceService('https://your-proxy-server.com');
```

Or configure it via environment variable during build.
