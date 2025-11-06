# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Favicon support**: 멀티 레이어 favicon.ico 파일 추가
  - Windows 브라우저, PWA 및 다양한 환경에서 앱 아이콘이 올바르게 표시됩니다
  - 16x16, 32x32, 72x72 크기를 포함하는 멀티 레이어 ICO 파일
  - `npm run generate:favicon` 명령어로 favicon.ico를 재생성할 수 있습니다
  - ImageMagick을 사용한 자동 favicon 생성 스크립트 추가
- Session end confirmation modal with clear user feedback
  - After ending a session, users now see a "연습이 종료되었습니다" (Practice Session Ended) confirmation modal
  - Modal includes a "처음으로 이동" (Go to Home) button that navigates directly to the home screen
  - Improves UX by making session termination more explicit and preventing confusion

### Fixed
- AI's first message now correctly uses the target language instead of English
  - When learning Japanese, the first message will be in Japanese (e.g., "友達と何をするのが好きですか？")
  - Previously, it was in English with instructions to "Respond in Japanese"
  - Applies to all supported target languages: English, Korean, Japanese, Chinese, Spanish, French, German

### Changed
- `startConversation()` method in GeminiService now uses AI to generate the first message in the target language
- Added fallback mechanism to English prompts if AI translation fails

### Note
- Multi-language support for UI and target languages was implemented in a previous update but not documented in CHANGELOG
  - See MULTILANGUAGE_IMPLEMENTATION.md for details
  - Supports 7 languages: English, Korean, Japanese, Chinese, Spanish, French, German

### Planned Features
- Offline mode with cached responses
- Custom conversation scenarios
- Speech rate adjustment
- Background mode support
- Social features (share progress)
- Advanced analytics dashboard
- Export to PDF/CSV
- Widget support (iOS/Android)

### Known Issues
- Voice recognition requires internet connection
- API key must be configured manually
- Limited offline functionality

## [1.0.0] - 2024-10-19

### Added
- Initial release of GeminiTalk
- Real-time voice conversation using Gemini Live API
- Five conversation topics:
  - Daily conversation
  - Travel English
  - Business English
  - Casual chat
  - Professional communication
- Intelligent feedback system:
  - Pronunciation analysis
  - Grammar correction
  - Fluency scoring
  - Vocabulary suggestions
- Learning progress tracking:
  - Session history
  - Performance metrics
  - Achievement system
  - Retention analytics
- User interface:
  - Home screen with statistics
  - Topic selection screen
  - Conversation screen with voice controls
  - Progress screen with detailed analytics
  - Settings screen with API configuration
- Voice features:
  - Real-time speech-to-text
  - Text-to-speech responses
  - Continuous listening mode
- Data management:
  - Local storage with AsyncStorage
  - Session auto-save
  - Data export functionality
  - Progress calculation
- Development tools:
  - TypeScript configuration
  - ESLint setup
  - Prettier formatting
  - Jest testing framework
- Documentation:
  - Comprehensive README
  - API documentation
  - Deployment guide
  - Usage examples
  - Contributing guidelines
- CI/CD:
  - GitHub Actions workflow
  - Automated testing
  - Build automation
  - Documentation deployment

### Technical Details
- React Native 0.72.6
- TypeScript 4.8.4
- Google Gemini Live API integration
- AsyncStorage for data persistence
- React Navigation for routing

### Performance Metrics
- Session duration tracking
- User retention calculation
- Conversation accuracy improvement monitoring
- Topic-specific progress analytics

## [Unreleased]

### Planned Features
- Offline mode with cached responses
- Custom conversation scenarios
- Speech rate adjustment
- Background mode support
- Social features (share progress)
- Advanced analytics dashboard
- Export to PDF/CSV
- Dark mode support
- Widget support (iOS/Android)

### Known Issues
- Voice recognition requires internet connection
- API key must be configured manually
- Limited offline functionality
- No cloud sync yet

---

## Version History

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backward compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

### Release Schedule
- Major releases: Quarterly
- Minor releases: Monthly
- Patch releases: As needed

### Support Policy
- Latest version: Full support
- Previous major version: Security updates only
- Older versions: No support

---

For more information, see:
- [README](README.md) - Project overview
- [CONTRIBUTING](CONTRIBUTING.md) - How to contribute
- [Documentation](docs/README.md) - Full documentation
