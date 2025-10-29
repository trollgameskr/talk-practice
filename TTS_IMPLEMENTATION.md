# TTS Settings Implementation Summary

## Overview
This implementation adds comprehensive Google Cloud Text-to-Speech (TTS) configuration UI that allows users to customize voice settings including language_code, voice name, SSML gender, speaking rate, and other SSML parameters.

## Implementation Details

### Files Created/Modified

1. **src/config/tts.config.ts** (NEW)
   - Defines TTS configuration interfaces and types
   - Contains default voice options for 7 languages:
     - 영어 (English) - en-US, en-GB, en-AU variants
     - 한국어 (Korean) - ko-KR variants
     - 일본어 (Japanese) - ja-JP variants
     - 중국어 (Chinese, Mandarin) - cmn-CN variants
     - 스페인어 (Spanish) - es-ES variants
     - 프랑스어 (French) - fr-FR variants
     - 독일어 (German) - de-DE variants
   - Each language includes 5 voice options (Neural2-A/B, Wavenet-C/D, Standard-A)
   - Defines speaking rate presets (0.5x to 1.5x)
   - Sets region to `asia-northeast1` (closest to Korea for low latency)
   - Includes documentation URL link

2. **src/components/TTSSettings.tsx** (NEW)
   - React component providing detailed TTS configuration UI
   - Features:
     - Language group selection dropdown
     - Voice selection from predefined list
     - Speaking rate adjustment (5 speed options)
     - Link to Google Cloud TTS documentation
     - Custom voice toggle for advanced users
     - Custom voice name input
     - Custom language code input
     - Custom gender selection (MALE/FEMALE/NEUTRAL)
     - Display of current server region (asia-northeast1)

3. **src/services/AIVoiceService.ts** (MODIFIED)
   - Added TTS configuration management
   - Loads configuration from AsyncStorage
   - Uses configured voice settings instead of hardcoded values
   - Supports both preset and custom voice configurations
   - Dynamically selects voice based on user preferences

4. **src/screens/SettingsScreen.tsx** (MODIFIED)
   - Integrated TTSSettings component
   - Positioned after "Conversation Settings" section
   - Inherits theme from existing UI

5. **src/config/gemini.config.ts** (MODIFIED)
   - Added `TTS_CONFIG` storage key for persisting TTS settings

## Features Implemented

### ✅ Language and Voice Selection
- 7 language groups with 5 voices each (35 total preset voices)
- Voice names include Korean gender indicators (여성/남성)
- Organized by language for easy navigation
- Default voices match the requirements specification exactly

### ✅ Speaking Rate Control
- 5 preset speed options:
  - 매우 느림 (0.5x)
  - 느림 (0.75x)
  - 보통 (1.0x)
  - 빠름 (1.25x)
  - 매우 빠름 (1.5x)

### ✅ Documentation Link
- Direct link to Google Cloud TTS documentation
- Opens: https://cloud.google.com/text-to-speech/docs/list-voices-and-types
- Users can explore all available voices and types

### ✅ Custom Voice Input
- Toggle to enable custom voice configuration
- Custom voice name input field
- Custom language code input field
- Custom gender selection dropdown
- Allows advanced users to use any Google Cloud TTS voice

### ✅ Region Configuration
- Region set to `asia-northeast1` (Tokyo/Seoul)
- Provides lowest latency for users in Korea
- Displayed in UI for transparency

### ✅ SSML Gender Support
- All voices include gender metadata
- Configurable through both preset and custom options
- Values: MALE, FEMALE, NEUTRAL

### ✅ Persistent Storage
- All settings saved to AsyncStorage
- Automatically loaded on app start
- Settings persist across sessions

## UI Layout

```
Settings Screen
  └── 🎨 Appearance (Dark Mode)
  └── 🌍 Language (Native/Target Language)
  └── 👤 Guest Mode / Account
  └── 🔑 API Configuration
  └── 🗣️ Conversation Settings
  └── 🎙️ TTS 음성 설정 (NEW)
      ├── 언어 선택 (Language Selection Dropdown)
      ├── 음성 선택 (Voice Selection Dropdown)
      ├── 말하기 속도 (Speaking Rate Slider/Dropdown)
      ├── 📚 다양한 음성 타입 보기 (Documentation Link Button)
      ├── 커스텀 음성 사용 (Custom Voice Toggle)
      └── [When custom enabled]
          ├── 커스텀 음성 이름 (Custom Voice Name Input)
          ├── 커스텀 언어 코드 (Custom Language Code Input)
          ├── 커스텀 성별 (Custom Gender Dropdown)
          └── 커스텀 설정 저장 (Save Custom Settings Button)
      └── ℹ️ Info Box
          ├── TTS API usage information
          └── Server region display (asia-northeast1)
```

## Default Configuration

```typescript
{
  voiceName: 'en-US-Neural2-A',
  languageCode: 'en-US',
  ssmlGender: 'FEMALE',
  speakingRate: 0.95,
  pitch: 0.0,
  volumeGainDb: 0.0,
  useCustomVoice: false,
  region: 'asia-northeast1',
  endpoint: 'https://texttospeech.googleapis.com'
}
```

## Security and Proxy Setup

### Overview
To protect API keys from being exposed in client-side code, the TTS functionality uses a proxy server to make API calls to Google Cloud Text-to-Speech.

### Architecture
```
Client (Browser)
    ↓ POST /api/synthesize
Proxy Server (server/proxy.js)
    ↓ Authenticated API call
Google Cloud Text-to-Speech API
```

### Configuration

1. **Environment Variables**
   - Set `GOOGLE_TTS_API_KEY` in your `.env` file
   - Can use the same API key as `GEMINI_API_KEY` if using the same Google Cloud project
   - The proxy server will use `GOOGLE_TTS_API_KEY` first, falling back to `GEMINI_API_KEY`

2. **Proxy Server**
   - Endpoint: `POST /api/synthesize`
   - Default URL: `http://localhost:4000`
   - Accepts: `{ text, voice, audioConfig }`
   - Returns: `{ audioContent }` (base64 MP3)

3. **Client Configuration**
   - AIVoiceService accepts a proxy URL in the constructor
   - Default: `http://localhost:4000`
   - No API key is required or stored in client code

### Running the Proxy

```bash
# Start the proxy server
npm run proxy

# Or with custom port
PROXY_PORT=5000 npm run proxy
```

### Benefits
- ✅ API keys never exposed in client-side code
- ✅ Centralized API key management
- ✅ Better security and control
- ✅ CORS handling done server-side
- ✅ Easier to monitor and rate-limit API usage

## Language Coverage (As Specified)

### 영어 (English)
- en-US-Neural2-A (여성)
- en-US-Neural2-B (남성)
- en-US-Wavenet-D (여성)
- en-GB-Neural2-C (여성)
- en-AU-Chirp3-HD-F (여성)

### 한국어 (Korean)
- ko-KR-Neural2-A (여성)
- ko-KR-Neural2-B (남성)
- ko-KR-Standard-A (여성)
- ko-KR-Wavenet-C (여성)
- ko-KR-Wavenet-D (남성)

### 일본어 (Japanese)
- ja-JP-Neural2-A (여성)
- ja-JP-Neural2-B (남성)
- ja-JP-Wavenet-C (여성)
- ja-JP-Wavenet-D (남성)
- ja-JP-Standard-A (여성)

### 중국어 (Chinese, 만다린)
- cmn-CN-Neural2-A (여성)
- cmn-CN-Neural2-B (남성)
- cmn-CN-Wavenet-C (여성)
- cmn-CN-Wavenet-D (남성)
- cmn-CN-Standard-A (여성)

### 스페인어 (Spanish)
- es-ES-Neural2-A (여성)
- es-ES-Neural2-B (남성)
- es-ES-Wavenet-C (여성)
- es-ES-Wavenet-D (남성)
- es-ES-Standard-A (여성)

### 프랑스어 (French)
- fr-FR-Neural2-A (여성)
- fr-FR-Neural2-B (남성)
- fr-FR-Wavenet-C (여성)
- fr-FR-Wavenet-D (남성)
- fr-FR-Standard-A (여성)

### 독일어 (German)
- de-DE-Neural2-A (여성)
- de-DE-Neural2-B (남성)
- de-DE-Wavenet-C (여성)
- de-DE-Wavenet-D (남성)
- de-DE-Standard-A (여성)

## Testing

Due to pre-existing build issues in the repository (missing VoiceShim.web.js file), the web build cannot be completed. However:

1. ✅ TypeScript type checking passes without errors
2. ✅ ESLint linting passes (1 minor warning about inline styles, which is acceptable)
3. ✅ Code follows existing patterns and conventions
4. ✅ All required features are implemented
5. ✅ Storage integration is complete
6. ✅ Theme integration is complete

## Usage

1. Users navigate to Settings screen
2. Scroll to "🎙️ TTS 음성 설정" section
3. Select desired language from dropdown
4. Select preferred voice from the language's voice list
5. Adjust speaking rate if needed
6. For advanced users: Enable custom voice and enter specific voice details
7. Click documentation link to explore more voice options
8. Settings are automatically saved and applied to next TTS playback

## Technical Notes

- All configuration is type-safe using TypeScript interfaces
- Settings persist across app restarts using AsyncStorage
- Component uses existing theme system for consistent styling
- Follows React Native best practices and existing code patterns
- Region configuration optimized for Korean users (asia-northeast1)
