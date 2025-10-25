# API Documentation

## GeminiService

The `GeminiService` class handles all interactions with the Gemini Live API.

### Constructor

```typescript
constructor(apiKey: string)
```

Initialize the service with your Gemini API key.

### Methods

#### `startConversation(topic: ConversationTopic): Promise<string>`

Start a new conversation session with the specified topic.

**Parameters:**
- `topic`: The conversation topic (DAILY, TRAVEL, BUSINESS, CASUAL, or PROFESSIONAL)

**Returns:** Promise that resolves to the starter message from the AI

**Example:**
```typescript
const gemini = new GeminiService('your-api-key');
const starter = await gemini.startConversation(ConversationTopic.DAILY);
console.log(starter); // "Tell me about your typical day..."
```

#### `sendMessage(userMessage: string): Promise<string>`

Send a user message and get AI response.

**Parameters:**
- `userMessage`: The user's spoken or typed message

**Returns:** Promise that resolves to the AI's response

**Example:**
```typescript
const response = await gemini.sendMessage("I wake up at 7 AM every day");
console.log(response); // AI's contextual response
```

#### `analyzeFeedback(userMessage: string): Promise<Feedback>`

Analyze a user's message and generate feedback.

**Parameters:**
- `userMessage`: The user's message to analyze

**Returns:** Promise that resolves to a `Feedback` object containing:
- `pronunciation`: Pronunciation analysis and score
- `grammar`: Grammar errors and corrections
- `fluency`: Fluency score (0-100)
- `vocabulary`: Vocabulary analysis and suggestions

**Example:**
```typescript
const feedback = await gemini.analyzeFeedback("I go to school yesterday");
// Returns feedback highlighting grammar error (go -> went)
```

#### `generateSummary(messages: Message[]): Promise<string>`

Generate a summary of the conversation.

**Parameters:**
- `messages`: Array of conversation messages

**Returns:** Promise that resolves to a summary string

#### `endConversation(): void`

End the current conversation session and clean up resources.

---

## StorageService

The `StorageService` class manages local data persistence.

### Methods

#### `saveSession(session: ConversationSession): Promise<void>`

Save a completed conversation session.

**Parameters:**
- `session`: The session object to save

#### `getAllSessions(): Promise<ConversationSession[]>`

Retrieve all saved sessions.

**Returns:** Promise that resolves to an array of sessions

#### `getSessionsByTopic(topic: ConversationTopic): Promise<ConversationSession[]>`

Get sessions filtered by topic.

**Parameters:**
- `topic`: The topic to filter by

**Returns:** Promise that resolves to filtered sessions

#### `getUserProgress(): Promise<UserProgress>`

Get the user's overall progress.

**Returns:** Promise that resolves to a `UserProgress` object containing:
- `totalSessions`: Total number of completed sessions
- `totalDuration`: Total practice time in seconds
- `averageSessionDuration`: Average session length
- `topicProgress`: Progress breakdown by topic
- `overallScore`: Overall performance score
- `achievements`: Earned achievements
- `retentionRate`: User retention rate

#### `updateUserProgress(session: ConversationSession): Promise<void>`

Update progress based on a completed session.

**Parameters:**
- `session`: The completed session

#### `clearAllData(): Promise<void>`

Clear all stored data (sessions and progress).

#### `exportData(): Promise<string>`

Export all data as JSON string.

**Returns:** Promise that resolves to JSON string of all data

---

## VoiceService

The `VoiceService` class handles voice recognition and text-to-speech.

### Methods

#### `startListening(onResult: (text: string) => void, onError?: (error: any) => void): Promise<void>`

Start listening for voice input.

**Parameters:**
- `onResult`: Callback function called with recognized text
- `onError`: Optional callback for error handling

**Example:**
```typescript
const voice = new VoiceService();
await voice.startListening(
  (text) => console.log('You said:', text),
  (error) => console.error('Error:', error)
);
```

#### `stopListening(): Promise<void>`

Stop listening for voice input.

#### `speak(text: string): Promise<void>`

Speak the given text using TTS.

**Parameters:**
- `text`: The text to speak

#### `stopSpeaking(): Promise<void>`

Stop current speech output.

#### `getIsListening(): boolean`

Check if currently listening.

**Returns:** Boolean indicating listening status

#### `destroy(): Promise<void>`

Clean up and destroy the voice service.

---

## Type Definitions

### ConversationTopic

```typescript
enum ConversationTopic {
  DAILY = 'daily',
  TRAVEL = 'travel',
  BUSINESS = 'business',
  CASUAL = 'casual',
  PROFESSIONAL = 'professional',
}
```

### Message

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}
```

### ConversationSession

```typescript
interface ConversationSession {
  id: string;
  topic: ConversationTopic;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  feedback?: Feedback;
  duration: number; // in seconds
}
```

### Feedback

```typescript
interface Feedback {
  pronunciation: PronunciationFeedback;
  grammar: GrammarFeedback;
  fluency: number; // 0-100
  vocabulary: VocabularyFeedback;
}
```

### UserProgress

```typescript
interface UserProgress {
  userId: string;
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  topicProgress: Record<ConversationTopic, TopicProgress>;
  overallScore: number;
  achievements: Achievement[];
  retentionRate: number;
}
```

---

## Configuration

### Gemini Configuration

Edit `src/config/gemini.config.ts`:

```typescript
export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash-lite-preview-09-2025',
  
  generation: {
    temperature: 0.7,    // Creativity level (0-1)
    topK: 40,            // Top-K sampling
    topP: 0.95,          // Top-P (nucleus) sampling
    maxOutputTokens: 1024,
    candidateCount: 1,
  },
};
```

### Conversation Configuration

```typescript
export const CONVERSATION_CONFIG = {
  maxDuration: 1800,        // 30 minutes
  minSessionDuration: 60,   // 1 minute
  feedbackDelay: 2000,      // 2 seconds
  autoSaveInterval: 30000,  // 30 seconds
};
```

---

## Error Handling

All API methods use Promise-based error handling. Wrap calls in try-catch blocks:

```typescript
try {
  const response = await geminiService.sendMessage(text);
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

Common errors:
- **Invalid API Key**: Check API key configuration
- **Network Error**: Verify internet connection
- **Quota Exceeded**: Check API usage limits
- **Permission Denied**: Verify microphone permissions

---

## Rate Limits

Gemini API has rate limits. The app implements:
- Request queuing
- Automatic retry with backoff
- Error messages for quota issues

Monitor usage at: https://console.cloud.google.com/

---

## Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Error Handling**: Always handle errors gracefully
3. **Resource Cleanup**: Call `destroy()` methods when done
4. **Offline Support**: Check network before API calls
5. **User Feedback**: Show loading states during API calls
