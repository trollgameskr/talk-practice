# Firebase Setup Guide

This guide will help you set up Firebase for GeminiTalk to enable user authentication and cloud data storage.

## Why Firebase?

Firebase provides:
- **Authentication**: Secure user login/registration with email and password
- **Firestore**: Cloud-based database for storing conversation history and usage statistics
- **Real-time Sync**: Automatic synchronization across devices
- **Free Tier**: Generous free tier for development and small-scale usage

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "gemini-talk")
4. (Optional) Enable Google Analytics if you want usage insights
5. Click "Create project"

### 2. Register Your App

1. In your Firebase project dashboard, click the **Web** icon (`</>`)
2. Register your app with a nickname (e.g., "GeminiTalk Web")
3. **Don't** check "Also set up Firebase Hosting" (we're using GitHub Pages)
4. Click "Register app"

### 3. Get Your Firebase Configuration

After registering, Firebase will show you a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Copy these values - you'll need them in the next step.

### 4. Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable**
6. Click **Save**

### 5. Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add security rules next)
4. Select your database location (choose closest to your users)
5. Click **Enable**

### 6. Configure Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to manage their own sessions
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow users to manage their own token usage
      match /tokenUsage/{usageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **Publish** to save the rules.

### 7. Configure Your App

#### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase configuration:
   ```
   FIREBASE_API_KEY=your-api-key-from-step-3
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   ```

3. Make sure `.env` is in your `.gitignore` (it should be by default)

#### For Production Deployment (GitHub Pages)

If deploying to GitHub Pages or other hosting:

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Add the following repository secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

3. Update your build configuration to inject these environment variables

## Data Structure

### Users Collection

```
/users/{userId}
  - createdAt: Timestamp
  - totalSessions: number
  - totalTokens: number
  - totalCost: number
  - lastSessionDate: Timestamp
```

### Sessions Subcollection

```
/users/{userId}/sessions/{sessionId}
  - id: string
  - topic: string
  - startTime: Timestamp
  - endTime: Timestamp
  - duration: number
  - messages: array
  - tokenUsage: object
  - feedback: object
```

### Token Usage Subcollection

```
/users/{userId}/tokenUsage/{sessionId}
  - inputTokens: number
  - outputTokens: number
  - totalTokens: number
  - estimatedCost: number
  - timestamp: Timestamp
```

## Using the App

### First Time Setup

1. Launch the app
2. You'll see the Login screen
3. Click "Don't have an account? Sign Up"
4. Enter your email and password (minimum 6 characters)
5. Click "Sign Up"
6. You'll be automatically logged in

### Logging In

1. Enter your registered email and password
2. Click "Sign In"
3. You'll be redirected to the Home screen

### Data Synchronization

- All conversation sessions are automatically saved to Firebase
- Token usage is tracked and stored in real-time
- Data syncs across all devices where you're logged in
- Local storage is used as a fallback when offline

## Troubleshooting

### "User not authenticated" Error

- Make sure you're logged in
- Check if your authentication token has expired (logout and login again)

### "Permission denied" Error

- Verify Firestore security rules are correctly configured
- Make sure you're authenticated before making requests

### Configuration Not Loading

- Verify all environment variables are set correctly
- Check Firebase console for any service issues
- Ensure your Firebase configuration values match exactly

### Authentication Errors

Common error codes:
- `auth/email-already-in-use`: Email is already registered
- `auth/invalid-email`: Invalid email format
- `auth/user-not-found`: No account with this email
- `auth/wrong-password`: Incorrect password
- `auth/weak-password`: Password must be at least 6 characters

## Cost Considerations

Firebase offers a generous free tier:
- **Authentication**: 50,000 monthly active users (free)
- **Firestore**: 
  - 1 GB storage (free)
  - 50,000 reads/day (free)
  - 20,000 writes/day (free)
  - 20,000 deletes/day (free)

For typical usage (a few users, daily practice sessions), you'll likely stay within the free tier.

## Security Best Practices

1. **Never commit** Firebase configuration secrets to version control
2. Use environment variables for all sensitive data
3. Keep Firestore security rules restrictive (users can only access their own data)
4. Use strong passwords for user accounts
5. Regularly review Firebase usage and security logs

## Support

If you encounter any issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review Firestore security rules
3. Check the browser console for error messages
4. Open an issue on the GitHub repository

---

## Running Without Firebase

**Good news!** The app can run without Firebase configuration. If Firebase credentials are not provided:

- The app will automatically detect this and run in "local-only" mode
- Authentication screens will be skipped
- All data will be stored locally in the browser's localStorage
- You'll see a warning in the browser console: "Firebase is not configured. App will run with local storage only."

This is useful for:
- Quick testing and development
- Users who don't want to set up Firebase
- Scenarios where cloud storage is not needed

**Limitations of local-only mode:**
- No cross-device synchronization
- No cloud backup of conversation history
- Data is lost if browser cache is cleared

**Note**: For full functionality including cross-device sync and cloud backup, Firebase configuration is recommended but not required.
