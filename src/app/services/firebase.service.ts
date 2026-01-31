import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { firebaseConfig } from '../config/firebase.config';

/**
 * Firebase Service for initializing and managing Firebase services
 * Supports Firestore, Realtime Database, and Authentication
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private rtdb: Database | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase app
   */
  private initializeFirebase(): void {
    try {
      // Check if Firebase is already initialized
      if (getApps().length > 0) {
        this.configureServices();
        this.isInitialized = true;
        return;
      }

      // Check if Firebase config is properly set
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_web_api_key')) {
        console.warn(
          'Firebase Web API Key is not configured. Please:\n' +
          '1. Go to Firebase Console > Project Settings\n' +
          '2. Copy your Web API Key\n' +
          '3. Update firebase.config.ts with your actual credentials'
        );
        this.isInitialized = false;
        return;
      }

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      this.configureServices();
      this.isInitialized = true;
      console.log('Firebase initialized successfully for project:', firebaseConfig.projectId);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Configure Firebase services after app initialization
   */
  private configureServices(): void {
    const app = getApps()[0];

    // Initialize Firestore
    this.db = getFirestore(app);

    // Initialize Auth
    this.auth = getAuth(app);

    // Initialize Realtime Database
    this.rtdb = getDatabase(app);
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore | null {
    return this.db;
  }

  /**
   * Get Auth instance
   */
  getAuth(): Auth | null {
    return this.auth;
  }

  /**
   * Get Realtime Database instance
   */
  getRealtimeDatabase(): Database | null {
    return this.rtdb;
  }

  /**
   * Check if Firebase is initialized and configured
   */
  isFirebaseInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get project configuration
   */
  getProjectInfo(): { projectId: string; authDomain: string } {
    return {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    };
  }
}
