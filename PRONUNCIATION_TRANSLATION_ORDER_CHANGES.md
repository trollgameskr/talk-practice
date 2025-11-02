# Pronunciation and Translation Display Order Changes

## Summary

This document describes the changes made to the pronunciation and translation display order in the GeminiTalk application.

## Changes Implemented

### Feature 1: Display Order Change

**Previous Order:**
1. Original Text (원문)
2. Translation (번역)
3. Pronunciation (발음)

**New Order:**
1. Original Text (원문)
2. Pronunciation (발음)
3. Translation (번역)

This change applies to:
- Assistant message bubbles in the conversation screen
- Sample answer options
- Voice display modal (during audio playback)

### Feature 2: Japanese Line-by-Line Pronunciation Matching

For Japanese language specifically, when pronunciation is enabled:
- The pronunciation is now displayed directly below each line of the original Japanese text
- Each line of Japanese text is followed immediately by its pronunciation
- Multi-line Japanese text is properly handled with matching pronunciation for each line

**Example Display:**

```
こんにちは
kon'nichiwa

元気ですか？
genki desu ka?

💬 Hello. How are you?
```

Instead of the previous format:
```
こんにちは元気ですか？
💬 Hello. How are you?
🔊 kon'nichiwa genki desu ka?
```

## Technical Implementation

### Files Modified

1. **src/services/GeminiService.ts**
   - Modified `getPronunciation()` method to generate line-by-line pronunciation for Japanese
   - Added special prompt for Japanese that maintains exact line structure and character alignment

2. **src/screens/ConversationScreen.tsx**
   - Added `renderJapaneseTextWithPronunciation()` function for displaying Japanese text with inline pronunciation
   - Added `renderJapaneseSampleWithPronunciation()` function for sample answers
   - Updated message bubble rendering logic to use Japanese-specific rendering when:
     - Target language is Japanese (`targetLanguage === 'ja'`)
     - Pronunciation is enabled (`showPronunciation === true`)
     - Pronunciation data is available (`message.pronunciation` exists)
   - Added new styles: `japaneseLineContainer` and `japanesePronunciationLine`
   - Changed display order in all locations (message bubbles, samples, voice modal)

## Benefits

1. **Improved Learning Experience**: Pronunciation appears immediately after the original text, making it easier to associate sounds with written text
2. **Better Japanese Support**: Line-by-line matching helps learners understand pronunciation character-by-character
3. **Consistent Ordering**: The same order (Original → Pronunciation → Translation) is used across all UI elements

## Testing

To test these changes:

1. Set target language to Japanese in settings
2. Enable pronunciation display in settings
3. Start a conversation
4. Observe that:
   - Pronunciation appears before translation
   - For Japanese, pronunciation is displayed line-by-line below the original text
   - Multi-line Japanese text correctly shows pronunciation for each line

## Notes

- The changes only affect the display order and Japanese rendering
- All other languages continue to use the standard display format
- The pronunciation generation logic itself remains unchanged (except for Japanese)
- No breaking changes to existing functionality
