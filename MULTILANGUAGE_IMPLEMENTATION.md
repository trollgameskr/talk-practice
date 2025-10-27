# Multi-Language Support Implementation

## Overview
This implementation adds comprehensive multi-language support to GeminiTalk, allowing users to select both their native language (for the UI) and their target language (the language they want to practice/learn).

## Features

### 1. Supported Languages
The application now supports **7 languages**:

**Native Languages (UI):**
- 한국어 (Korean)
- English
- 日本語 (Japanese)
- 中文 (Chinese Simplified)
- Español (Spanish)
- Français (French)
- Deutsch (German)

**Target Languages (Languages to Practice):**
- English
- Korean
- Japanese
- Chinese
- Spanish
- French
- German

### 2. Automatic Language Detection
The app automatically detects the user's system language on first launch and sets it as the default UI language if it's one of the supported languages. Otherwise, it defaults to English.

### 3. Independent Language Selection
Users can now independently select:
- **Native Language**: Determines the language of the app's user interface
- **Target Language**: Determines which language they want to practice/learn

This allows, for example, a Spanish speaker to use the app in Spanish (UI) while practicing Japanese.

## Settings Screen

### Native Language Section
Located in Settings > Language > Native Language (UI Language)
- Displays all available UI languages with their native names
- Selected language is marked with a checkmark
- Changing this immediately updates the entire app interface
- Selection is persisted across app restarts

### Target Language Section
Located in Settings > Language > Target Language
- Displays all available languages to learn
- Language names are shown in the current UI language for clarity
- Selected language is marked with a checkmark
- This can be used by conversation features to tailor practice content
- Selection is persisted across app restarts

## Technical Implementation

### Files Added/Modified

**New Translation Files:**
- `src/locales/ja.json` - Japanese translations
- `src/locales/zh.json` - Chinese Simplified translations
- `src/locales/es.json` - Spanish translations
- `src/locales/fr.json` - French translations
- `src/locales/de.json` - German translations

**Modified Files:**
- `src/locales/en.json` - Updated with new translation keys
- `src/locales/ko.json` - Updated with new translation keys
- `src/config/i18n.config.ts` - Enhanced with new languages and target language support
- `src/screens/SettingsScreen.tsx` - Added UI for language selection

**New Test File:**
- `src/__tests__/i18n.test.ts` - Comprehensive tests for i18n functionality

### Storage Keys
- `@language` - Stores the selected native/UI language
- `@target_language` - Stores the selected target/learning language

### Key Functions

**i18n.config.ts exports:**
- `getAvailableLanguages()` - Returns list of available UI languages
- `getAvailableTargetLanguages()` - Returns list of available target languages
- `saveLanguage(code)` - Saves and applies UI language
- `saveTargetLanguage(code)` - Saves target language preference
- `getTargetLanguage()` - Retrieves saved target language
- `getCurrentLanguage()` - Gets current UI language
- `initI18n()` - Initializes i18n with saved/detected language

## Usage Example

```typescript
import {
  saveLanguage,
  saveTargetLanguage,
  getAvailableLanguages,
  getAvailableTargetLanguages,
} from '../config/i18n.config';

// Get available languages
const uiLanguages = getAvailableLanguages();
const targetLanguages = getAvailableTargetLanguages();

// Set UI language to Japanese
await saveLanguage('ja');

// Set target language to English (user wants to practice English)
await saveTargetLanguage('en');
```

## Translation Structure

All translation files follow the same structure with these main sections:
- `app` - Application-level strings
- `navigation` - Navigation labels
- `home` - Home screen content
- `topicSelection` - Topic selection screen
- `conversation` - Conversation/practice screen
- `progress` - Progress tracking screen
- `settings` - Settings screen (including language settings)
- `login` - Login/authentication screen
- `cost` - API cost display
- `common` - Common buttons and messages

### Special Translation Keys for Language Settings

```json
{
  "settings": {
    "sections": {
      "language": {
        "title": "🌐 Language",
        "nativeLanguage": "Native Language (UI Language)",
        "targetLanguage": "Target Language",
        "languages": {
          "en": "English",
          "ko": "한국어",
          // ... etc
        },
        "targetLanguages": {
          "en": "English",
          "ko": "Korean",
          // ... etc (in the UI language)
        }
      }
    }
  }
}
```

## Testing

Run the i18n tests:
```bash
npm test src/__tests__/i18n.test.ts
```

All tests verify:
- Correct number of supported languages
- Proper structure of language objects
- AsyncStorage integration
- Default language fallbacks

## Future Enhancements

Potential improvements for future versions:
1. Add more languages based on user demand
2. Use target language in conversation prompts
3. Allow region-specific variants (e.g., zh-CN vs zh-TW)
4. Add language-specific cultural content
5. Implement language learning progress tracking per target language
