# AI Voice Generation

## Overview

The application now uses AI-generated voices instead of basic Text-to-Speech (TTS) for a more natural and human-like speech experience.

## Implementation

### AIVoiceService

The `AIVoiceService` is a new service that replaces the previous `react-native-tts` implementation with a more advanced AI voice generation system.

#### Features

1. **Google Cloud Text-to-Speech Integration**
   - Uses Google Cloud's Neural2 voices when API key is configured
   - Provides the highest quality AI-generated speech
   - Requires a valid Google Cloud API key

2. **Enhanced Web Speech API Fallback**
   - Automatically selects the best available AI voice from the system
   - Prioritizes:
     - Google voices (premium quality)
     - Microsoft Neural voices
     - Apple Premium/Enhanced voices
     - High-quality US English voices
   - No API key required

3. **Automatic Fallback**
   - If Google Cloud TTS fails or is not configured, automatically falls back to Web Speech API
   - Seamless user experience with no interruption

## How It Works

### Voice Selection Priority

When speaking text, the service follows this priority:

1. **Google Cloud Text-to-Speech (if API key configured)**
   - Neural2 voices (en-US-Neural2-F)
   - Generated audio streamed to browser
   - Best quality, most natural

2. **Web Speech API with AI Voice Selection**
   - Scans available system voices
   - Selects the best AI/Neural voice automatically
   - Uses browser's native speech synthesis

### Voice Quality Comparison

| Method | Quality | Requires API Key | Network Required |
|--------|---------|------------------|------------------|
| Google Cloud TTS Neural2 | Excellent | Yes | Yes |
| Google Chrome Voices | Very Good | No | No |
| Microsoft Neural Voices | Very Good | No | No |
| Apple Premium Voices | Good | No | No |
| Standard System Voices | Fair | No | No |

## Configuration

### Using Google Cloud Text-to-Speech (Optional)

If you want to use the highest quality AI voices, configure a Google Cloud API key:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Text-to-Speech API
3. Pass the API key when initializing VoiceService:

```typescript
const voiceService = new VoiceService('YOUR_API_KEY');
```

Or set it later:

```typescript
voiceService.setApiKey('YOUR_API_KEY');
```

### Using Web Speech API (Default)

No configuration needed! The service automatically selects the best available AI voice from your system.

## Browser Compatibility

- **Chrome/Edge**: Excellent support with Google and Microsoft voices
- **Safari**: Good support with Apple voices
- **Firefox**: Basic support with system voices

## Benefits Over Previous Implementation

1. **More Natural Speech**: AI-generated voices sound more human-like
2. **Better Voice Quality**: Uses premium voices when available
3. **Flexible Configuration**: Works with or without API key
4. **Automatic Optimization**: Selects best available voice automatically
5. **No Dependencies**: Works without react-native-tts library

## Usage Example

```typescript
import { VoiceService } from './services/VoiceService';

// Initialize with optional API key
const voiceService = new VoiceService('YOUR_GOOGLE_CLOUD_API_KEY');

// Speak text with AI voice
await voiceService.speak("Hello! How are you today?");

// Stop speaking
await voiceService.stopSpeaking();

// Cleanup
await voiceService.destroy();
```

## Technical Details

### AIVoiceService Class

```typescript
class AIVoiceService {
  // Speak text using AI voice
  async speak(text: string): Promise<void>
  
  // Stop current speech
  async stopSpeaking(): Promise<void>
  
  // Set Google Cloud API key
  setApiKey(apiKey: string): void
  
  // Check if currently speaking
  getIsSpeaking(): boolean
  
  // Cleanup resources
  async destroy(): Promise<void>
}
```

## Migration from TTS

The migration from `react-native-tts` to `AIVoiceService` is transparent:

- Same API interface maintained in `VoiceService`
- No changes needed in existing code
- Automatic fallback ensures compatibility
- Better voice quality out of the box

## Future Enhancements

Possible future improvements:

1. Support for multiple languages
2. Voice customization (speed, pitch, volume)
3. Multiple voice personalities
4. Caching for frequently used phrases
5. Offline AI voice support
