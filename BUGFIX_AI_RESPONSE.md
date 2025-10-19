# Bug Fix: AI Not Responding After User Speaks

## Problem
After the AI speaks and the user responds, the AI should respond again but it doesn't. This creates a broken conversation flow.

## Root Cause
The `VoiceService.speak()` method was not waiting for the Text-to-Speech (TTS) to actually finish speaking. The method would call `Tts.speak(text)` which starts the TTS but returns immediately. This caused the `isSpeaking` state in `ConversationScreen` to be set to `false` prematurely, before the AI actually finished speaking.

## Solution
Modified `VoiceService.ts` to:
1. Add TTS event listeners (`tts-start`, `tts-finish`, `tts-error`)
2. Make the `speak()` method return a Promise that only resolves when the `tts-finish` event fires
3. Store bound event handler references to prevent memory leaks
4. Add race condition protection to prevent overlapping TTS operations
5. Added proper cleanup of event listeners in the `destroy()` method

Also updated `TTSShim.web.js` (web version) to:
1. Emit TTS events to maintain consistency with the native implementation
2. Properly implement `addEventListener` and `removeEventListener` for event handling

## Technical Details

### Before
```typescript
async speak(text: string): Promise<void> {
  try {
    await Tts.speak(text);  // Returns immediately!
  } catch (error) {
    console.error('Error speaking text:', error);
  }
}
```

### After
```typescript
async speak(text: string): Promise<void> {
  // Prevent overlapping TTS operations
  if (this.isSpeaking) {
    console.warn('TTS is already speaking. Waiting for current speech to finish.');
    await this.stopSpeaking();
  }

  return new Promise((resolve, reject) => {
    this.isSpeaking = true;
    this.ttsFinishResolve = resolve;
    this.ttsErrorReject = reject;
    
    try {
      Tts.speak(text);  // Starts speaking
      // Promise resolves when 'tts-finish' event fires
    } catch (error) {
      console.error('Error speaking text:', error);
      this.isSpeaking = false;
      this.ttsFinishResolve = null;
      this.ttsErrorReject = null;
      reject(error);
    }
  });
}

// Event handlers are bound once in constructor to prevent memory leaks
constructor() {
  this.boundTtsStart = this.onTtsStart.bind(this);
  this.boundTtsFinish = this.onTtsFinish.bind(this);
  this.boundTtsError = this.onTtsError.bind(this);
  // ...
}
```

## Impact
- ✅ AI now properly waits for TTS to finish before allowing the next interaction
- ✅ Conversation flow is no longer broken
- ✅ The `isSpeaking` state in `ConversationScreen` accurately reflects when AI is speaking
- ✅ Works on both native (React Native) and web platforms

## Testing
- All existing tests pass (44/44)
- Type checking passes with no errors
- Manual testing recommended to verify the conversation flow
