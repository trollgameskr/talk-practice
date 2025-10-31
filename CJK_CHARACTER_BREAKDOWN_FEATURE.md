# CJK Character Breakdown Feature

## Overview

This feature provides character-by-character breakdown for Chinese and Japanese text in the conversation screen. When learning Chinese or Japanese, users can tap a button to see detailed information about each character in a sentence.

## Features

### For Chinese (中文)
- **Character**: Individual Chinese characters (汉字/漢字)
- **Meaning**: Translation/meaning in the user's native language
- **Pronunciation**: Pinyin pronunciation with tone marks

### For Japanese (日本語)
- **Character**: Individual Japanese characters (Kanji, Hiragana, Katakana)
- **Meaning**: Translation/meaning in the user's native language  
- **Pronunciation**: Romaji (romanized Japanese)
- **Reading**: Hiragana reading for Kanji characters

## How to Use

1. Start a conversation with Chinese (`zh`) or Japanese (`ja`) as your target language
2. When the AI responds, you'll see a new button: **📖 汉字解析** (Chinese) or **📖 漢字解析** (Japanese)
3. Tap this button to see the character breakdown
4. A modal will appear showing:
   - The original sentence at the top
   - Each character/word with its details below

## Technical Implementation

### New Types
```typescript
interface CJKCharacterBreakdown {
  character: string;      // The character or word
  meaning: string;        // Meaning in native language
  pronunciation: string;  // Pinyin or Romaji
  reading?: string;       // Hiragana for Japanese
}
```

### API Method
```typescript
async getCJKCharacterBreakdown(text: string): Promise<CJKCharacterBreakdown[]>
```

This method uses the Gemini AI API to analyze CJK text and provide detailed character-by-character breakdown.

### UI Components
- **CJK Breakdown Button**: Appears on AI messages when target language is Chinese or Japanese
- **CJK Breakdown Modal**: Shows the detailed character analysis in a scrollable view

## Example

### Chinese Example
**Original**: 你好，今天天气怎么样？

**Breakdown**:
- 你 (nǐ) - you
- 好 (hǎo) - good/well
- 今天 (jīntiān) - today
- 天气 (tiānqì) - weather
- 怎么样 (zěnmeyàng) - how/how about

### Japanese Example  
**Original**: こんにちは、元気ですか？

**Breakdown**:
- こんにちは (konnichiwa) - hello/good afternoon
- 元 (げん, gen) - origin/source
- 気 (き, ki) - spirit/energy
- です (desu) - to be (polite)
- か (ka) - question particle

## Benefits

1. **Enhanced Learning**: Understand the composition and meaning of each character
2. **Pronunciation Help**: Learn correct pronunciation (Pinyin/Romaji)
3. **Character Recognition**: Build vocabulary by seeing characters in context
4. **Native Language Support**: Explanations in your preferred language

## Code Changes

### Files Modified
- `src/types/index.ts` - Added CJK breakdown types
- `src/services/GeminiService.ts` - Added `getCJKCharacterBreakdown` method
- `src/screens/ConversationScreen.tsx` - Added UI components and handlers

### Tests Added
- Comprehensive tests in `src/__tests__/GeminiService.test.ts`
- Tests for Chinese, Japanese, and non-CJK languages
- Edge case testing (empty text, etc.)

## Future Enhancements

Potential improvements for this feature:
- Add audio pronunciation for each character
- Save frequently misunderstood characters to vocabulary list
- Add handwriting practice for characters
- Include stroke order information
- Support for Traditional vs Simplified Chinese selection
