# Usage Examples

This document provides practical examples of using GeminiTalk's API and features.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Service Examples](#service-examples)
- [Custom Implementations](#custom-implementations)
- [Advanced Features](#advanced-features)

## Basic Usage

### Starting a Conversation

```typescript
import GeminiService from './services/GeminiService';
import VoiceService from './services/VoiceService';
import { ConversationTopic } from './types';

// Initialize services
const gemini = new GeminiService('your-api-key');
const voice = new VoiceService();

// Start conversation
const starterMessage = await gemini.startConversation(ConversationTopic.DAILY);
console.log('AI:', starterMessage);

// Speak the message
await voice.speak(starterMessage);
```

### Voice Interaction

```typescript
// Start listening
await voice.startListening(
  async (text) => {
    console.log('You said:', text);
    
    // Send to AI
    const response = await gemini.sendMessage(text);
    console.log('AI:', response);
    
    // Speak response
    await voice.speak(response);
  },
  (error) => {
    console.error('Voice error:', error);
  }
);

// Stop listening after 10 seconds
setTimeout(async () => {
  await voice.stopListening();
}, 10000);
```

### Saving Progress

```typescript
import StorageService from './services/StorageService';

const storage = new StorageService();

// Create session
const session = {
  id: generateId(),
  topic: ConversationTopic.DAILY,
  startTime: new Date(Date.now() - 300000), // 5 minutes ago
  endTime: new Date(),
  messages: [...], // Your messages
  duration: 300, // 5 minutes in seconds
};

// Save session
await storage.saveSession(session);

// Get progress
const progress = await storage.getUserProgress();
console.log('Total sessions:', progress.totalSessions);
console.log('Overall score:', progress.overallScore);
```

## Service Examples

### GeminiService

#### Daily Conversation Example

```typescript
const gemini = new GeminiService('your-api-key');

// Start daily conversation
await gemini.startConversation(ConversationTopic.DAILY);

// User talks about their morning
const response1 = await gemini.sendMessage(
  "I woke up at 7 AM and had breakfast with my family."
);
// AI: "That sounds like a nice start to the day! What did you have for breakfast?"

// Continue conversation
const response2 = await gemini.sendMessage(
  "We had pancakes and orange juice."
);
// AI: "Yum! Pancakes are delicious. Do you usually eat breakfast with your family?"
```

#### Travel Scenario Example

```typescript
// Start travel conversation
await gemini.startConversation(ConversationTopic.TRAVEL);

// Simulate hotel check-in
const response1 = await gemini.sendMessage(
  "I have a reservation under the name John Smith."
);
// AI: "Welcome! Let me check that for you. Could you please spell your last name?"

const response2 = await gemini.sendMessage(
  "S-M-I-T-H"
);
// AI: "Thank you. I found your reservation for a deluxe room, checking in today..."
```

#### Business Meeting Example

```typescript
// Start business conversation
await gemini.startConversation(ConversationTopic.BUSINESS);

// Opening a meeting
const response1 = await gemini.sendMessage(
  "Good morning everyone, let's begin our quarterly review meeting."
);
// AI: "Good morning! Could you give us an overview of the key topics we'll be discussing today?"

const response2 = await gemini.sendMessage(
  "We'll cover sales performance, upcoming projects, and team goals."
);
// AI: "Excellent. Let's start with the sales performance. How did we do this quarter?"
```

#### Getting Feedback

```typescript
const userSentence = "I go to school yesterday";

const feedback = await gemini.analyzeFeedback(userSentence);

console.log('Pronunciation:', feedback.pronunciation.score);
console.log('Grammar:', feedback.grammar.score);
console.log('Fluency:', feedback.fluency);

// Show grammar errors
feedback.grammar.errors.forEach(error => {
  console.log(`Error: ${error.text}`);
  console.log(`Correction: ${error.correction}`);
  console.log(`Explanation: ${error.explanation}`);
});
```

#### Generating Summary

```typescript
const messages = [
  { id: '1', role: 'assistant', content: 'Tell me about your day', timestamp: new Date() },
  { id: '2', role: 'user', content: 'I had a great day at work', timestamp: new Date() },
  // ... more messages
];

const summary = await gemini.generateSummary(messages);
console.log('Session summary:', summary);
// "Great conversation! You discussed your work day and showed good use of past tense..."
```

### VoiceService

#### Continuous Listening

```typescript
const voice = new VoiceService();
let isActive = true;

const continuousListen = async () => {
  while (isActive) {
    await voice.startListening(
      async (text) => {
        console.log('Recognized:', text);
        await voice.stopListening();
        
        // Process the text
        // ...
        
        // Continue listening
        if (isActive) {
          await continuousListen();
        }
      },
      (error) => {
        console.error('Error:', error);
        // Retry
        if (isActive) {
          setTimeout(() => continuousListen(), 1000);
        }
      }
    );
  }
};

// Start
continuousListen();

// Stop after 5 minutes
setTimeout(() => {
  isActive = false;
}, 300000);
```

#### Text-to-Speech with Queue

```typescript
const voice = new VoiceService();
const messageQueue = ['Hello!', 'How are you?', 'Have a great day!'];

const speakQueue = async (messages: string[]) => {
  for (const message of messages) {
    await voice.speak(message);
    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

await speakQueue(messageQueue);
```

### StorageService

#### Session Management

```typescript
const storage = new StorageService();

// Get all sessions
const sessions = await storage.getAllSessions();
console.log(`Total sessions: ${sessions.length}`);

// Filter by topic
const travelSessions = await storage.getSessionsByTopic(ConversationTopic.TRAVEL);
console.log(`Travel sessions: ${travelSessions.length}`);

// Get recent sessions
const recentSessions = sessions
  .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  .slice(0, 5);
  
console.log('Recent sessions:', recentSessions);
```

#### Progress Tracking

```typescript
const storage = new StorageService();
const progress = await storage.getUserProgress();

// Check achievements
if (progress.achievements.length > 0) {
  console.log('Achievements:');
  progress.achievements.forEach(achievement => {
    console.log(`- ${achievement.icon} ${achievement.title}`);
  });
}

// Topic-specific progress
Object.entries(progress.topicProgress).forEach(([topic, data]) => {
  console.log(`${topic}:`);
  console.log(`  Sessions: ${data.sessionsCompleted}`);
  console.log(`  Avg Score: ${data.averageScore.toFixed(1)}`);
});
```

#### Data Export

```typescript
const storage = new StorageService();

// Export all data
const jsonData = await storage.exportData();

// Save to file (in a real app)
// Or send to backend
console.log('Exported data:', jsonData);

// Parse exported data
const data = JSON.parse(jsonData);
console.log('Sessions:', data.sessions.length);
console.log('Export date:', data.exportDate);
```

## Custom Implementations

### Custom Feedback Analyzer

```typescript
import GeminiService from './services/GeminiService';

class CustomFeedbackAnalyzer {
  private gemini: GeminiService;
  
  constructor(apiKey: string) {
    this.gemini = new GeminiService(apiKey);
  }
  
  async analyzeWithContext(
    currentMessage: string,
    previousMessages: string[]
  ) {
    // Build context
    const context = previousMessages.join(' ');
    const fullText = `${context} ${currentMessage}`;
    
    // Get feedback
    const feedback = await this.gemini.analyzeFeedback(fullText);
    
    // Custom scoring with context weight
    const contextScore = this.calculateContextScore(currentMessage, context);
    
    return {
      ...feedback,
      contextAwareness: contextScore,
    };
  }
  
  private calculateContextScore(message: string, context: string): number {
    // Custom logic for context awareness
    // Check if message relates to context
    // Return score 0-100
    return 85;
  }
}

// Usage
const analyzer = new CustomFeedbackAnalyzer('your-api-key');
const feedback = await analyzer.analyzeWithContext(
  "Yes, I really enjoyed it",
  ["What did you do yesterday?", "I went to the movies"]
);
```

### Conversation Logger

```typescript
import { Message } from './types';

class ConversationLogger {
  private messages: Message[] = [];
  
  log(message: Message) {
    this.messages.push(message);
    console.log(`[${message.role}] ${message.content}`);
  }
  
  getStatistics() {
    const userMessages = this.messages.filter(m => m.role === 'user');
    const aiMessages = this.messages.filter(m => m.role === 'assistant');
    
    const avgUserLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    const avgAiLength = aiMessages.reduce((sum, m) => sum + m.content.length, 0) / aiMessages.length;
    
    return {
      totalMessages: this.messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      avgUserMessageLength: avgUserLength,
      avgAiMessageLength: avgAiLength,
    };
  }
  
  exportToText(): string {
    return this.messages
      .map(m => `[${m.role}] ${m.content}`)
      .join('\n\n');
  }
}

// Usage
const logger = new ConversationLogger();
// Log throughout conversation
logger.log({ id: '1', role: 'user', content: 'Hello', timestamp: new Date() });
// Get stats
const stats = logger.getStatistics();
console.log('Statistics:', stats);
```

### Achievement System Extension

```typescript
import StorageService from './services/StorageService';
import { Achievement, UserProgress } from './types';

class AchievementManager {
  private storage: StorageService;
  
  constructor() {
    this.storage = new StorageService();
  }
  
  async checkCustomAchievements(progress: UserProgress): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    // Custom achievement: Night Owl
    const lateSessions = await this.getSessionsAfter(22); // 10 PM
    if (lateSessions >= 5) {
      newAchievements.push({
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Practiced 5 times after 10 PM',
        earnedDate: new Date(),
        icon: '🦉',
      });
    }
    
    // Custom achievement: Speed Learner
    if (progress.averageSessionDuration < 300 && progress.totalSessions >= 10) {
      newAchievements.push({
        id: 'speed_learner',
        title: 'Speed Learner',
        description: 'Completed 10 efficient sessions',
        earnedDate: new Date(),
        icon: '⚡',
      });
    }
    
    return newAchievements;
  }
  
  private async getSessionsAfter(hour: number): Promise<number> {
    const sessions = await this.storage.getAllSessions();
    return sessions.filter(s => {
      const sessionHour = new Date(s.startTime).getHours();
      return sessionHour >= hour;
    }).length;
  }
}
```

## Advanced Features

### Multi-language Support

```typescript
// Extend for other languages
class MultilingualGeminiService extends GeminiService {
  private language: string;
  
  constructor(apiKey: string, language: string = 'en-US') {
    super(apiKey);
    this.language = language;
  }
  
  async startConversationInLanguage(topic: ConversationTopic) {
    // Customize prompts for different languages
    const languagePrompt = this.getPromptForLanguage(this.language, topic);
    // Start conversation with custom prompt
    return await this.startConversation(topic);
  }
  
  private getPromptForLanguage(language: string, topic: ConversationTopic): string {
    // Return language-specific prompts
    return '';
  }
}
```

### Offline Mode

```typescript
class OfflineConversationService {
  private cachedResponses: Map<string, string>;
  
  constructor() {
    this.cachedResponses = new Map();
    this.loadCommonResponses();
  }
  
  private loadCommonResponses() {
    // Cache common responses for offline use
    this.cachedResponses.set('hello', 'Hi there! How can I help you today?');
    this.cachedResponses.set('how are you', "I'm doing well, thank you! How about you?");
    // ... more responses
  }
  
  getResponse(input: string): string | null {
    const normalized = input.toLowerCase().trim();
    return this.cachedResponses.get(normalized) || null;
  }
}
```

### Performance Optimization

```typescript
class OptimizedGeminiService extends GeminiService {
  private requestCache: Map<string, any>;
  private requestQueue: any[];
  
  constructor(apiKey: string) {
    super(apiKey);
    this.requestCache = new Map();
    this.requestQueue = [];
  }
  
  async sendMessageCached(message: string): Promise<string> {
    // Check cache first
    if (this.requestCache.has(message)) {
      return this.requestCache.get(message);
    }
    
    // Send request
    const response = await this.sendMessage(message);
    
    // Cache response
    this.requestCache.set(message, response);
    
    return response;
  }
  
  clearCache() {
    this.requestCache.clear();
  }
}
```

## Integration Examples

### React Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import GeminiService from './services/GeminiService';
import VoiceService from './services/VoiceService';

const ConversationComponent = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  
  useEffect(() => {
    const gemini = new GeminiService('your-api-key');
    const voice = new VoiceService();
    
    // Initialize conversation
    const init = async () => {
      const starter = await gemini.startConversation(ConversationTopic.DAILY);
      setMessages([{ role: 'assistant', content: starter }]);
      await voice.speak(starter);
    };
    
    init();
    
    return () => {
      voice.destroy();
    };
  }, []);
  
  const handleListen = async () => {
    // Implementation
  };
  
  return (
    <div>
      {/* UI implementation */}
    </div>
  );
};
```

These examples demonstrate the flexibility and power of GeminiTalk's API. Customize them to fit your specific needs!
