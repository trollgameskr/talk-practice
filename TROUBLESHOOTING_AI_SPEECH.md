# Troubleshooting AI Speech Issues

This guide helps you diagnose and fix issues when the AI doesn't speak during conversation practice.

## Quick Diagnosis

When AI speech fails to play, you'll see an error alert with detailed information. The logs in your browser console contain detailed diagnostic information.

### Opening Browser Console

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (Mac)
- **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

## Understanding the Logs

All AI speech-related logs are prefixed with `[AIVoiceService]`, `[VoiceService]`, or `[DeviceTTSService]` for easy filtering.

- `[AIVoiceService]`: Logs related to Google Cloud TTS (AI voices)
- `[VoiceService]`: General voice service logs
- `[DeviceTTSService]`: Logs related to Device TTS (native system voices)

### Successful Speech Flow

When everything works correctly, you'll see logs like:

```
[AIVoiceService] Starting speech synthesis
[AIVoiceService] Using TTS proxy server (or Direct Google Cloud TTS API)
[AIVoiceService] Sending TTS API request
[AIVoiceService] TTS API response received { status: 200, ok: true }
[AIVoiceService] Audio content received
[AIVoiceService] Starting audio playback
[AIVoiceService] Audio element created
[AIVoiceService] Loading audio...
[AIVoiceService] Audio ready to play
[AIVoiceService] Audio playback completed
[AIVoiceService] Speech synthesis completed
```

### Common Issues and Solutions

#### 1. "TTS API key or proxy not configured"

**Log pattern:**
```
[AIVoiceService] Cannot generate voice: TTS API key or proxy not configured
{ hasApiKey: false, hasProxyUrl: false }
```

**Cause:** Neither a Google Cloud TTS API key nor a proxy server is configured.

**Solutions:**
- **For GitHub Pages/Production**: Set the `GOOGLE_TTS_API_KEY` environment variable
- **For Local Development**: Run the proxy server (`npm run proxy`) or configure API key
- **Alternative**: Enable "Text-only mode" in Settings to continue without voice

#### 2. "API request failed: 500"

**Log pattern:**
```
[AIVoiceService] TTS API request failed
{ status: 500, errorData: {...} }
```

**Cause:** The TTS API server returned an error.

**Solutions:**
- Check if the proxy server is running (`npm run proxy`)
- Verify API key is valid and not expired
- Check API quota/billing status in Google Cloud Console
- Retry after a few moments (temporary service issue)

#### 3. "Network error" or fetch failed

**Log pattern:**
```
[AIVoiceService] Error generating AI voice
{ error: "NetworkError", errorType: "TypeError" }
```

**Cause:** Network connectivity issue or CORS problem.

**Solutions:**
- Check your internet connection
- Verify proxy server is accessible (if using proxy)
- Check browser console for CORS errors
- Ensure proxy server is running on the correct port

#### 4. "Audio API not available"

**Log pattern:**
```
[AIVoiceService] Audio API not available in this environment
```

**Cause:** Browser doesn't support Web Audio API.

**Solutions:**
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Enable JavaScript in browser settings
- Check if browser extensions are blocking audio

#### 5. Audio playback blocked

**Log pattern:**
```
[AIVoiceService] Audio play failed
{ error: "NotAllowedError" }
```

**Cause:** Browser blocked audio autoplay.

**Solutions:**
- Allow audio autoplay for the site in browser settings
- User interaction (clicking the sample response) usually allows playback
- Check browser's media autoplay policy

## Detailed Logging Information

Each log entry includes:

- **Timestamps**: When the operation started
- **Duration**: How long operations took (in milliseconds)
- **Configuration State**: Whether API key or proxy is configured
- **Error Details**: Specific error messages and types
- **Request/Response Info**: API call details

### Example Detailed Error Log

```javascript
[AIVoiceService] Error generating AI voice {
  error: "API request failed: 401 - Invalid API key",
  errorType: "Error",
  totalTimeMs: 234,
  hasApiKey: true,
  hasProxyUrl: false,
  proxyUrl: ""
}
```

This tells us:
- The API rejected the request (401 status)
- We're using direct API access (not proxy)
- The API key is invalid
- The request took 234ms before failing

## Getting Help

If you can't resolve the issue:

1. Copy the relevant console logs (especially `[AIVoiceService]`, `[VoiceService]`, and `[DeviceTTSService]` entries)
2. Note what you were doing when the issue occurred
3. Check if the issue is consistent or intermittent
4. Report the issue with the logs on GitHub

## Workarounds

If you need to continue practicing while troubleshooting:

1. **Read the text**: Even when speech fails, you can still read the AI's responses
2. **Text-only mode**: Enable in Settings → Conversation Settings → Text Only Mode
3. **Continue conversation**: The error won't prevent you from continuing the conversation

## Performance Metrics

The logs include timing information to help diagnose performance issues:

- **Generation time**: How long it took to generate the audio
- **Fetch time**: Network request duration
- **Load time**: Audio loading time
- **Total time**: End-to-end duration

Typical successful speech synthesis takes 1-3 seconds depending on text length and network speed.
