# Fix: Japanese Text TTS Initialization Timeout

## Problem Description

When using Device TTS (Web Speech API) on PC to synthesize Japanese text, the application would timeout after 20 seconds during initialization. The logs showed:

```
[ConversationScreen] Starter message to speak: 今日のあなたの普通の一日について教えてください。朝はいつも何をしますか。
[VoiceService] Speech request received {textLength: 36, textPreview: '今日のあなたの普通の一日について教えてください。朝はいつも何をしますか。', voiceType: 'ai', provider: 'device', timestamp: '2025-10-31T11:38:37.367Z'}
[DeviceTTSService] Starting speech synthesis {textLength: 36, textPreview: '今日のあなたの普通の一日について教えてください。朝はいつも何をしますか。', voiceType: 'ai', timestamp: '2025-10-31T11:38:37.368Z'}
Selected AI voice: Google US English
[ConversationScreen] Initialization timeout after 20 seconds
```

## Root Cause

The `selectBestVoice()` function in `src/services/web/TTSShim.web.js` was hardcoded to only select English voices, regardless of the target language. This caused the following issues:

1. When Japanese text needed to be synthesized, the system selected "Google US English" voice
2. The Web Speech API attempted to synthesize Japanese text using an English voice
3. The browser's TTS engine either hung or failed silently, causing the 20-second timeout

## Solution

The fix implements language-aware voice selection:

### 1. Updated `TTSShim.web.js`

Modified `selectBestVoice()` to:
- Accept a `language` parameter (e.g., 'ja-JP', 'en-US', 'ko-KR')
- Extract base language code (e.g., 'ja' from 'ja-JP')
- Select voices using a priority system:
  1. Google voice for exact language match (e.g., Google 日本語 for ja-JP)
  2. Google voice for base language match (e.g., Google 日本語 for ja)
  3. Microsoft Neural voice for exact/base language
  4. Premium/Enhanced voice for exact/base language
  5. Any voice matching exact language code
  6. Any voice matching base language code
  7. Fallback to first available voice

Modified `speak()` to:
- Pass the language parameter to `selectBestVoice()`
- Use the selected voice for synthesis

### 2. Updated `DeviceTTSService.ts`

Modified `speak()` method to:
- Pass the current language to TTS shim via options: `{language: deviceLanguageCode}`
- Log the language being used for debugging

### 3. Added Tests

Created `src/__tests__/TTSShim.test.js` with comprehensive tests for:
- Language code parsing (base and full language codes)
- Voice priority logic
- Fallback behavior
- Voice selection scenarios

## Technical Details

### Language Code Handling

```javascript
// Extract base language code (e.g., 'ja' from 'ja-JP')
const baseLang = language && language.split('-')[0] ? language.split('-')[0] : 'en';
const fullLang = language || 'en-US';
```

This ensures proper handling of:
- Full language codes: 'ja-JP', 'en-US', 'ko-KR'
- Null/undefined values (defaults to 'en-US')
- Empty strings (defaults to 'en-US')

### Voice Selection Priority

The priority system ensures the best available voice is selected:

```javascript
const voicePriorities = [
  v => v.name.includes('Google') && v.lang === fullLang,
  v => v.name.includes('Google') && v.lang.startsWith(baseLang),
  v => v.name.includes('Microsoft') && v.name.includes('Neural') && v.lang === fullLang,
  // ... more priorities
];

for (const priorityCheck of voicePriorities) {
  const voice = voices.find(priorityCheck);
  if (voice) {
    return voice;
  }
}
```

## Verification

1. ✅ Code builds successfully
2. ✅ All tests pass (5/5 tests in TTSShim.test.js)
3. ✅ No linting errors
4. ✅ No security vulnerabilities (CodeQL scan: 0 alerts)
5. ✅ Code review completed and feedback addressed

## Expected Behavior After Fix

When Japanese text is synthesized:
1. The system will select a Japanese voice (e.g., "Google 日本語" or "Microsoft Ayumi")
2. The Web Speech API will successfully synthesize the text
3. No timeout will occur
4. Users will hear the correct Japanese pronunciation

The same applies for other languages (Korean, Chinese, Spanish, French, German, etc.).

## Impact

- **Minimal changes**: Only modified 2 source files
- **Backward compatible**: English text continues to work as before
- **Supports all languages**: Works for any language with available voices
- **Robust fallback**: Falls back gracefully if preferred voice isn't available
- **Well tested**: Comprehensive test coverage for voice selection logic
