# Quick Start Guide

Get GeminiTalk up and running in 5 minutes!

## Prerequisites

✅ Node.js 16+ installed  
✅ React Native environment set up  
✅ Gemini API key ready

## Installation

### 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/trollgameskr/talk-practice.git
cd talk-practice

# Install dependencies
npm install

# iOS only (Mac users)
cd ios && pod install && cd ..
```

### 2. Configure API Key (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_key_here
```

**Get API Key**: https://makersuite.google.com/app/apikey

### 3. Run the App (2 minutes)

```bash
# Start Metro bundler
npm start

# In a new terminal:
# For iOS (Mac only)
npm run ios

# For Android
npm run android
```

## First Steps

1. **Open the app** - Wait for it to launch
2. **Go to Settings** - Tap the ⚙️ icon
3. **Enter API Key** - Paste your Gemini API key
4. **Save** - Tap "Save API Key"
5. **Start Practicing** - Return home and tap "Start Practice"

## Try Your First Conversation

1. Tap "🎯 Start Practice"
2. Choose "Daily Conversation"
3. Tap the 🎤 microphone button
4. Say "Hello, how are you?"
5. Wait for the AI response
6. Continue the conversation!

## What's Next?

- 📖 Read the [Full Documentation](docs/README.md)
- 🔧 Check [Setup Guide](docs/SETUP.md) for detailed instructions
- 💡 Explore [Usage Examples](docs/EXAMPLES.md)
- 🤝 See [Contributing Guidelines](CONTRIBUTING.md)

## Common Issues

### "API key not configured"
→ Make sure you entered the API key in Settings

### "Microphone permission denied"
→ Go to device Settings → GeminiTalk → Enable Microphone

### "Voice recognition failed"
→ Check internet connection and microphone

### Build fails
```bash
# Clear cache and rebuild
npm start -- --reset-cache
```

## Commands Cheat Sheet

```bash
# Development
npm start              # Start Metro
npm run ios            # Run on iOS
npm run android        # Run on Android

# Testing
npm test               # Run tests
npm run lint           # Lint code
npm run type-check     # Check types

# Troubleshooting
npm start -- --reset-cache  # Clear cache
rm -rf node_modules && npm install  # Reinstall
```

## Need Help?

- 📚 [Full Documentation](docs/README.md)
- 🐛 [Report Issues](https://github.com/trollgameskr/talk-practice/issues)
- 💬 [GitHub Discussions](https://github.com/trollgameskr/talk-practice/discussions)

## Success! 🎉

You're now ready to practice English with GeminiTalk!

**Happy Learning!** 🚀
