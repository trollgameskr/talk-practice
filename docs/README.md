# GeminiTalk Documentation

## Overview

GeminiTalk is a real-time English conversation coach powered by Google's Gemini Live API. It provides an interactive mobile application for practicing English conversation with AI-powered feedback and progress tracking.

## Features

### 1. Real-time Voice Conversation
- **Voice Recognition**: Real-time speech-to-text using native device capabilities
- **Natural Language Processing**: Powered by Gemini Live API
- **Text-to-Speech**: AI responses spoken aloud for natural conversation flow

### 2. Multiple Conversation Topics
- **Daily Conversation**: Practice everyday scenarios
- **Travel English**: Learn phrases for travel situations
- **Business English**: Professional communication skills
- **Casual Chat**: Informal conversations about entertainment
- **Professional**: Workplace communication and collaboration

### 3. Intelligent Feedback System
- **Pronunciation Analysis**: Identify pronunciation issues
- **Grammar Correction**: Real-time grammar feedback
- **Fluency Scoring**: Measure conversation flow
- **Vocabulary Suggestions**: Expand your vocabulary

### 4. Progress Tracking
- **Session History**: All conversations saved automatically
- **Performance Metrics**: Track improvements over time
- **Achievement System**: Earn badges for milestones
- **Retention Analytics**: Monitor learning consistency

## Architecture

### Technology Stack
- **Frontend**: React Native (cross-platform mobile)
- **AI/ML**: Google Gemini Live API
- **Storage**: AsyncStorage (local device storage)
- **Voice**: React Native Voice & TTS libraries
- **Navigation**: React Navigation v6

### Project Structure
```
talk-practice/
├── src/
│   ├── services/           # Core services
│   │   ├── GeminiService.ts      # Gemini API integration
│   │   ├── VoiceService.ts       # Voice recognition & TTS
│   │   └── StorageService.ts     # Data persistence
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── TopicSelectionScreen.tsx
│   │   ├── ConversationScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/        # Reusable components
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions
│   ├── config/           # Configuration files
│   ├── data/             # Static data (prompts, etc.)
│   └── App.tsx           # Main app component
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── docs/                 # Documentation
└── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 16 or higher
- React Native development environment
- Gemini API key from Google AI Studio

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/trollgameskr/talk-practice.git
   cd talk-practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (Mac only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure API Key**
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Open the app and navigate to Settings
   - Enter your API key and save

5. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Usage Guide

### Starting a Practice Session

1. **Launch the app** and tap "Start Practice"
2. **Choose a topic** that matches your learning goals
3. **Tap the microphone** to start speaking
4. **Converse naturally** - the AI will respond and guide the conversation
5. **Review feedback** at the end of your session

### Understanding Feedback

- **Pronunciation Score (0-100)**: Measures clarity and accuracy
- **Grammar Score (0-100)**: Evaluates sentence structure
- **Fluency (0-100)**: Assesses conversation flow
- **Vocabulary Score (0-100)**: Rates word choice and variety

### Tracking Progress

- **Overview Tab**: See overall statistics and achievements
- **Topics Tab**: View progress by conversation topic
- **Sessions**: Review past conversations and improvements

## Performance Metrics

### Key Performance Indicators (KPIs)

1. **Daily Average Session Time**
   - Target: 10-15 minutes per session
   - Measured automatically during conversations

2. **User Retention Rate**
   - Calculated based on session frequency
   - Higher retention indicates engagement

3. **Conversation Accuracy Improvement**
   - Tracks score improvements over time
   - Broken down by topic and skill area

## API Integration

### Gemini Live API

The app uses Google's Gemini Live API for:
- Real-time conversation generation
- Context-aware responses
- Feedback analysis
- Session summaries

### Configuration

Edit `src/config/gemini.config.ts` to customize:
- Model parameters (temperature, top-k, top-p)
- Safety settings
- Voice settings
- Session limits

## Development

### Running in Development

```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. **New Conversation Topic**
   - Add to `ConversationTopic` enum in `src/types/index.ts`
   - Create prompt in `src/data/conversationPrompts.ts`
   - Update UI in `TopicSelectionScreen.tsx`

2. **New Feedback Metric**
   - Update `Feedback` interface in `src/types/index.ts`
   - Modify `analyzeFeedback` in `GeminiService.ts`
   - Update UI in feedback display components

## Automated Deployment

### GitHub Actions

The project includes automated CI/CD:
- **Linting**: Runs ESLint on all code
- **Type Checking**: Validates TypeScript types
- **Testing**: Runs Jest test suite
- **Building**: Creates Android/iOS builds
- **Deployment**: Updates documentation

### Triggering Deployments

Pushes to `main` or `develop` branches automatically trigger:
1. Code quality checks
2. Test suite execution
3. Build processes
4. Documentation updates

## Troubleshooting

### Common Issues

**Voice Recognition Not Working**
- Check microphone permissions
- Ensure device has internet connection
- Verify voice services are available

**API Key Issues**
- Verify key is correct and active
- Check API quota hasn't been exceeded
- Ensure key has proper permissions

**Build Errors**
- Clear cache: `npm start --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clean builds: `cd android && ./gradlew clean`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/trollgameskr/talk-practice/issues)
- Documentation: [docs/](./docs/)

## Credits

- **Gemini Live API**: Google AI
- **React Native**: Facebook/Meta
- **Community Libraries**: See package.json for full list
