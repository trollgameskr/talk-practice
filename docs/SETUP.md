# Setup Guide

This guide will help you set up the GeminiTalk development environment from scratch.

## Table of Contents
- [System Requirements](#system-requirements)
- [Development Environment](#development-environment)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Windows 10+, or Ubuntu 18.04+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Internet**: Stable connection for API calls

### Software Requirements
- **Node.js**: v16.0 or higher
- **npm**: v7.0 or higher (comes with Node.js)
- **Git**: v2.0 or higher

### Platform-Specific Requirements

#### iOS Development (macOS only)
- macOS 10.15 (Catalina) or higher
- Xcode 12 or higher
- CocoaPods 1.10 or higher
- iOS 13.0+ device or simulator

#### Android Development
- Android Studio 4.0 or higher
- Android SDK (API level 21+)
- Java Development Kit (JDK) 17
- Android device or emulator

## Development Environment

### 1. Install Node.js

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Windows
```bash
# Download installer from nodejs.org
# Or using Chocolatey
choco install nodejs
```

#### Linux (Ubuntu/Debian)
```bash
# Using apt
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 3. iOS Setup (macOS only)

#### Install Xcode
1. Download from Mac App Store
2. Open Xcode and accept license
3. Install Command Line Tools:
   ```bash
   xcode-select --install
   ```

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

### 4. Android Setup

#### Install Android Studio
1. Download from [developer.android.com](https://developer.android.com/studio)
2. Run installer
3. Open Android Studio
4. Go to Settings > Appearance & Behavior > System Settings > Android SDK
5. Install required SDK versions (API 21+)

#### Configure Environment Variables

##### macOS/Linux
Add to `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

##### Windows
Add to System Environment Variables:
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools
PATH=%PATH%;%ANDROID_HOME%\tools
```

### 5. Install Watchman (Recommended for macOS)

```bash
brew install watchman
```

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/trollgameskr/talk-practice.git
cd talk-practice
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Gemini AI SDK
- Voice recognition libraries
- Navigation libraries
- And more...

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

This installs iOS-specific dependencies.

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

**Important**: Keep your API key secure! Never commit it to version control.

### 5. Configure Environment

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

## Configuration

### Editor Setup

#### VS Code (Recommended)
Install recommended extensions:
- ESLint
- Prettier
- React Native Tools
- TypeScript and JavaScript Language Features

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### Other Editors
Configure to use:
- ESLint for linting
- Prettier for formatting
- TypeScript language server

### Git Configuration

Set up git hooks (optional):
```bash
# Install husky for pre-commit hooks
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## Verification

### 1. Check Installation

```bash
# Check Node.js
node --version  # Should be v16.0 or higher

# Check npm
npm --version   # Should be v7.0 or higher

# Check React Native
npx react-native --version

# Check environment
npx react-native doctor
```

### 2. Run Tests

```bash
npm test
```

All tests should pass.

### 3. Check Linting

```bash
npm run lint
```

Should show no errors.

### 4. Check Type Checking

```bash
npm run type-check
```

Should compile without errors.

### 5. Start Metro Bundler

```bash
npm start
```

You should see the Metro bundler running.

### 6. Run on iOS (macOS only)

```bash
npm run ios
```

The app should launch in iOS simulator.

### 7. Run on Android

```bash
npm run android
```

The app should launch in Android emulator or connected device.

## Post-Installation

### Configure API Key in App

1. Launch the app
2. Go to Settings screen
3. Enter your Gemini API key
4. Tap "Save API Key"
5. Return to home screen
6. Try starting a conversation

### First Test Conversation

1. Tap "Start Practice"
2. Select "Daily Conversation"
3. Tap microphone button
4. Say "Hello, how are you?"
5. Wait for AI response

If you hear a response, everything is working!

## Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

#### Pod Installation Fails (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Android Build Fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Node Modules Issues
```bash
# Remove and reinstall
rm -rf node_modules
npm install
```

#### Permission Errors (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
```

### Platform-Specific Issues

#### iOS Simulator Not Starting
1. Open Xcode
2. Window > Devices and Simulators
3. Create new simulator
4. Try running again

#### Android Emulator Not Starting
1. Open Android Studio
2. Tools > AVD Manager
3. Create new virtual device
4. Start emulator manually
5. Run `npm run android`

#### Voice Recognition Not Working
1. Check microphone permissions
2. Ensure internet connection
3. Try on physical device (simulators have limitations)

#### API Key Issues
1. Verify key is correct
2. Check API is enabled in Google Cloud Console
3. Verify no quota limits reached

### Getting Help

If you're still having issues:

1. Check [Documentation](./README.md)
2. Search [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)
3. Create new issue with:
   - OS and version
   - Node.js version
   - Error messages
   - Steps to reproduce

### Logs and Debugging

#### View React Native Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

#### View Metro Bundler Logs
Already visible when running `npm start`

#### Enable Debug Mode
In the app, shake device (or Cmd+D on simulator) and select "Debug"

## Next Steps

Once setup is complete:

1. Read the [API Documentation](./API.md)
2. Explore [Usage Examples](./EXAMPLES.md)
3. Check [Contributing Guidelines](../CONTRIBUTING.md)
4. Try [Deployment Guide](./DEPLOYMENT.md)

## Quick Reference

### Common Commands
```bash
# Start development
npm start

# Run iOS
npm run ios

# Run Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check

# Clear cache
npm start -- --reset-cache
```

### Project Structure
```
talk-practice/
├── src/              # Source code
├── ios/              # iOS native code
├── android/          # Android native code
├── docs/             # Documentation
├── .github/          # GitHub Actions
└── package.json      # Dependencies
```

## Support

For additional help:
- 📖 [Full Documentation](./README.md)
- 💬 [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)
- 🤝 [Contributing](../CONTRIBUTING.md)

Happy coding! 🚀
