# TTS Settings UI Mockup

## Visual Layout Description

The TTS Settings UI is integrated into the Settings screen as a new section with the following layout:

```
┌─────────────────────────────────────────────────────────────┐
│ 🎙️ TTS 음성 설정                                            │
├─────────────────────────────────────────────────────────────┤
│ Google Cloud Text-to-Speech 음성 설정을 커스터마이징하세요    │
│                                                             │
│ 언어 선택                                                    │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 영어 (English)                              ▼      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ 음성 선택                                                    │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ en-US-Neural2-A (여성)                       ▼      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ 말하기 속도                                                  │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 보통 (1.0x)                                  ▼      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │  📚 다양한 음성 타입 보기 (Google Cloud 문서)         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ 커스텀 음성 사용                                  [OFF/ON]  │
│ 직접 음성 이름을 입력하여 사용                               │
│                                                             │
│ ╔═══════════════════════════════════════════════════════╗  │
│ ║ ℹ️ 음성 설정은 Google Cloud Text-to-Speech API를       ║  │
│ ║ 사용합니다. 설정을 변경하면 다음 음성 재생부터 적용됩니다.║  │
│ ║                                                       ║  │
│ ║ 🌏 서버 리전: asia-northeast1 (한국과 가까운 아시아 리전)║  │
│ ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
```

## Custom Voice Mode (When Enabled)

```
┌─────────────────────────────────────────────────────────────┐
│ 커스텀 음성 사용                                  [ON]       │
│ 직접 음성 이름을 입력하여 사용                               │
│                                                             │
│ 커스텀 음성 이름                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 예: en-US-Neural2-F                              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ 커스텀 언어 코드                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 예: en-US                                         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ 커스텀 성별                                                  │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 여성 (FEMALE)                                 ▼      │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │           커스텀 설정 저장                            │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Dropdown Options

### 언어 선택 Dropdown:
```
┌────────────────────────────────┐
│ 영어 (English)              ✓ │
│ 한국어 (Korean)                │
│ 일본어 (Japanese)              │
│ 중국어 (Chinese, 만다린)        │
│ 스페인어 (Spanish)             │
│ 프랑스어 (French)              │
│ 독일어 (German)                │
└────────────────────────────────┘
```

### 음성 선택 Dropdown (예: 영어 선택 시):
```
┌────────────────────────────────┐
│ en-US-Neural2-A (여성)      ✓ │
│ en-US-Neural2-B (남성)         │
│ en-US-Wavenet-D (여성)         │
│ en-GB-Neural2-C (여성)         │
│ en-AU-Chirp3-HD-F (여성)       │
└────────────────────────────────┘
```

### 말하기 속도 Dropdown:
```
┌────────────────────────────────┐
│ 매우 느림 (0.5x)               │
│ 느림 (0.75x)                   │
│ 보통 (1.0x)                 ✓ │
│ 빠름 (1.25x)                   │
│ 매우 빠름 (1.5x)               │
└────────────────────────────────┘
```

### 커스텀 성별 Dropdown:
```
┌────────────────────────────────┐
│ 여성 (FEMALE)               ✓ │
│ 남성 (MALE)                    │
│ 중성 (NEUTRAL)                 │
└────────────────────────────────┘
```

## Color Scheme

The component uses the app's theme system for consistent styling:

- **Card Background**: `theme.colors.card`
- **Text Color**: `theme.colors.text`
- **Secondary Text**: `theme.colors.textSecondary`
- **Input Background**: `theme.colors.inputBackground`
- **Input Border**: `theme.colors.inputBorder`
- **Primary Color**: `theme.colors.primary` (for active states)
- **Button Primary**: `theme.colors.buttonPrimary`
- **Info Box**: `theme.colors.primaryLight` with `theme.colors.primary` border

## Interactive Elements

1. **Language Selection Dropdown**: Changes available voices when language changes
2. **Voice Selection Dropdown**: Updates voice name, language code, and gender
3. **Speaking Rate Dropdown**: Adjusts playback speed
4. **Documentation Link Button**: Opens Google Cloud TTS docs in browser
5. **Custom Voice Toggle**: Shows/hides custom input fields
6. **Custom Settings Save Button**: Saves custom configuration

## User Flow

1. User opens Settings screen
2. Scrolls to "🎙️ TTS 음성 설정" section
3. Selects desired language (e.g., "한국어 (Korean)")
4. Voice dropdown automatically updates with Korean voices
5. User selects preferred voice (e.g., "ko-KR-Neural2-B (남성)")
6. Optionally adjusts speaking rate
7. Settings automatically save when changed
8. For advanced users:
   - Toggle "커스텀 음성 사용" ON
   - Enter custom voice name
   - Enter custom language code
   - Select gender
   - Click "커스텀 설정 저장"

## Integration Points

- **Position**: After "🗣️ Conversation Settings" section in Settings screen
- **Storage**: Uses AsyncStorage with key `@tts_config`
- **Theme**: Inherits from ThemeContext
- **Service**: AIVoiceService reads config on initialization and uses it for TTS

## Accessibility

- All form fields have labels
- Dropdowns use CustomPicker component (existing pattern)
- Info boxes provide context and guidance
- Clear visual hierarchy with emojis and section titles
- Consistent styling with rest of app
