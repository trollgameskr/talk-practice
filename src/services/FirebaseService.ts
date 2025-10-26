/**
 * Firebase Service
 * Handles authentication and Firestore operations
 */

import {initializeApp, FirebaseApp} from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import {firebaseConfig} from '../config/firebase.config';
import {ConversationSession, TokenUsage} from '../types';

export class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private currentUser: User | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Check if Firebase is properly configured
    this.isConfigured = this.validateFirebaseConfig();

    if (this.isConfigured) {
      try {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);

        // Set up auth state listener
        onAuthStateChanged(this.auth, user => {
          this.currentUser = user;
        });
      } catch (error) {
        console.warn('Firebase initialization failed:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn(
        'Firebase is not configured. App will run with local storage only.',
      );
    }
  }

  /**
   * Validate Firebase configuration
   */
  private validateFirebaseConfig(): boolean {
    // Check if all required Firebase config values are present and non-empty
    return !!(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.apiKey !== '' &&
      firebaseConfig.authDomain !== '' &&
      firebaseConfig.projectId !== '' &&
      firebaseConfig.appId !== ''
    );
  }

  /**
   * Check if Firebase is properly configured and initialized
   */
  isFirebaseConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string): Promise<UserCredential> {
    if (!this.isConfigured || !this.auth) {
      throw new Error('Firebase is not configured');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      // Initialize user profile in Firestore
      await this.initializeUserProfile(userCredential.user.uid);

      return userCredential;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<UserCredential> {
    if (!this.isConfigured || !this.auth) {
      throw new Error('Firebase is not configured');
    }

    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    if (!this.isConfigured || !this.auth) {
      throw new Error('Firebase is not configured');
    }

    try {
      await signOut(this.auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (!this.isConfigured || !this.auth) {
      return null;
    }
    return this.auth.currentUser || this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Initialize user profile in Firestore
   */
  private async initializeUserProfile(userId: string): Promise<void> {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firebase is not configured');
    }

    try {
      const userRef = doc(this.db, 'users', userId);
      await setDoc(userRef, {
        createdAt: Timestamp.now(),
        totalSessions: 0,
        totalTokens: 0,
        totalCost: 0,
      });
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  }

  /**
   * Save conversation session to Firestore
   */
  async saveSession(session: ConversationSession): Promise<void> {
    if (!this.isConfigured || !this.db) {
      console.warn('Firebase not configured, session not saved to cloud');
      return;
    }

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const sessionRef = doc(
        this.db,
        'users',
        user.uid,
        'sessions',
        session.id,
      );

      await setDoc(sessionRef, {
        ...session,
        startTime: Timestamp.fromDate(new Date(session.startTime)),
        endTime: session.endTime
          ? Timestamp.fromDate(new Date(session.endTime))
          : null,
        userId: user.uid,
      });

      // Update user statistics
      await this.updateUserStats(session);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  /**
   * Update user statistics
   */
  private async updateUserStats(session: ConversationSession): Promise<void> {
    if (!this.isConfigured || !this.db) {
      return;
    }

    const user = this.getCurrentUser();
    if (!user) {
      return;
    }

    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const totalTokens =
          (userData.totalTokens || 0) + (session.tokenUsage?.totalTokens || 0);
        const totalCost =
          (userData.totalCost || 0) + (session.tokenUsage?.estimatedCost || 0);
        const totalSessions = (userData.totalSessions || 0) + 1;

        await setDoc(
          userRef,
          {
            totalSessions,
            totalTokens,
            totalCost,
            lastSessionDate: Timestamp.now(),
          },
          {merge: true},
        );
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  /**
   * Get all sessions for current user
   */
  async getAllSessions(): Promise<ConversationSession[]> {
    if (!this.isConfigured || !this.db) {
      console.warn('Firebase not configured, returning empty sessions');
      return [];
    }

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const sessionsRef = collection(this.db, 'users', user.uid, 'sessions');
      const q = query(sessionsRef, orderBy('startTime', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(document => {
        const data = document.data();
        return {
          ...data,
          startTime:
            data.startTime instanceof Timestamp
              ? data.startTime.toDate().toISOString()
              : data.startTime,
          endTime:
            data.endTime instanceof Timestamp
              ? data.endTime.toDate().toISOString()
              : data.endTime,
        } as ConversationSession;
      });
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalSessions: number;
    totalTokens: number;
    totalCost: number;
  }> {
    if (!this.isConfigured || !this.db) {
      return {totalSessions: 0, totalTokens: 0, totalCost: 0};
    }

    const user = this.getCurrentUser();
    if (!user) {
      return {totalSessions: 0, totalTokens: 0, totalCost: 0};
    }

    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userDocument = await getDoc(userRef);

      if (userDocument.exists()) {
        const data = userDocument.data();
        return {
          totalSessions: data.totalSessions || 0,
          totalTokens: data.totalTokens || 0,
          totalCost: data.totalCost || 0,
        };
      }

      return {totalSessions: 0, totalTokens: 0, totalCost: 0};
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {totalSessions: 0, totalTokens: 0, totalCost: 0};
    }
  }

  /**
   * Save token usage to Firestore
   */
  async saveTokenUsage(
    sessionId: string,
    tokenUsage: TokenUsage,
  ): Promise<void> {
    if (!this.isConfigured || !this.db) {
      console.warn('Firebase not configured, token usage not saved to cloud');
      return;
    }

    const user = this.getCurrentUser();
    if (!user) {
      return;
    }

    try {
      const usageRef = doc(this.db, 'users', user.uid, 'tokenUsage', sessionId);

      await setDoc(usageRef, {
        ...tokenUsage,
        timestamp: Timestamp.now(),
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error saving token usage:', error);
    }
  }

  /**
   * Get token usage history
   */
  async getTokenUsageHistory(): Promise<TokenUsage[]> {
    if (!this.isConfigured || !this.db) {
      return [];
    }

    const user = this.getCurrentUser();
    if (!user) {
      return [];
    }

    try {
      const usageRef = collection(this.db, 'users', user.uid, 'tokenUsage');
      const querySnapshot = await getDocs(usageRef);

      return querySnapshot.docs.map(document => document.data() as TokenUsage);
    } catch (error) {
      console.error('Error getting token usage history:', error);
      return [];
    }
  }

  /**
   * Set up auth state listener
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!this.isConfigured || !this.auth) {
      // Return empty unsubscribe function if Firebase is not configured
      return () => {};
    }
    return onAuthStateChanged(this.auth, callback);
  }
}

export default FirebaseService;
