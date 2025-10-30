# TTS Setup Guide - User-Provided API Keys

## Quick Start

GeminiTalk now supports AI voice synthesis using your own Google Cloud API key! No proxy server or complex configuration needed.

## Setup Steps

### 1. Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (it starts with `AIza...`)

### 2. Configure the App

1. Open GeminiTalk
2. Go to **Settings** (gear icon)
3. Scroll to **"TTS API Configuration (Optional)"** section
4. Paste your API key
5. Click **"Save TTS API Key"**
6. Done! AI voice synthesis is now active

## Can I Use the Same Key for Gemini and TTS?

Yes! You can use the same API key for both:
- **Gemini API Key** - For AI conversation
- **TTS API Key** - For voice synthesis

Just enter the same key in both sections.

## Security Tips (Recommended)

To protect your API key from misuse:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add these domains:
   - `https://trollgameskr.github.io/talk-practice/*` (for GitHub Pages)
   - `http://localhost:3000/*` (for local testing)
5. Under "API restrictions", select "Restrict key"
6. Choose:
   - Cloud Text-to-Speech API
   - Generative Language API

This ensures your key only works on approved websites.

## Quota Management

Google provides free tier with limits:
- Monitor your usage at [Google Cloud Console - Quotas](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas)
- Set up billing alerts to avoid unexpected charges
- Consider setting quota limits for safety

## Troubleshooting

### "TTS API key or proxy not configured"
- You haven't entered a TTS API key yet
- Go to Settings → TTS API Configuration and enter your key

### "API request failed: 403"
- Your API key has restrictions that block the current domain
- Update your API key restrictions in Google Cloud Console
- Make sure your domain is in the HTTP referrers list

### "API request failed: 429"
- You've exceeded your quota
- Wait for the quota to reset (usually daily)
- Or increase your quota in Google Cloud Console

### TTS Not Working
1. Check that you entered the correct API key
2. Verify the API key is active in Google Cloud Console
3. Make sure "Cloud Text-to-Speech API" is enabled in your project
4. Check the browser console for detailed error messages

## What If I Don't Want TTS?

That's fine! The app works perfectly without TTS:
- Just don't enter a TTS API key
- The app will work in text-only mode
- You can still have full conversations with the AI
- Only the voice synthesis won't work

## Privacy Note

- Your API key is stored locally in your browser
- It's never sent to any server except Google's API
- Clear your browser data to remove the stored key
- Each browser/device needs its own setup

## Need Help?

- Check the [main documentation](./docs/DIRECT_TTS_API.md)
- Visit the [troubleshooting guide](./TROUBLESHOOTING.md)
- Open an issue on [GitHub](https://github.com/trollgameskr/talk-practice/issues)
