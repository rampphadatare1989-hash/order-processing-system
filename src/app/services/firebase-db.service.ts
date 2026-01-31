import { Injectable } from '@angular/core';
import { 
  initializeApp, 
  FirebaseApp,
  getApps
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint,
  CollectionReference,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.config';
import { Order, SalesOrder, JobCard } from '../models/spring-part.model';
import { BehaviorSubject, Observable, from } from 'rxjs';

/**
 * Firebase service for handling database operations
 * Uses Firestore for real-time data synchronization
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firebaseApp: FirebaseApp;
  private firestore: Firestore;
  private unsubscribers: Map<string, Unsubscribe> = new Map();

  constructor() {
    // Initialize Firebase
    if (getApps().length === 0) {
      this.firebaseApp = initializeApp(firebaseConfig);
    } else {
      this.firebaseApp = getApps()[0];
    }

    this.firestore = getFirestore(this.firebaseApp);
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    return this.firestore;
  }

  /**
   * Get reference to a collection
   */
  getCollection(collectionName: string): CollectionReference<DocumentData> {
    return collection(this.firestore, collectionName);
  }

  /**
   * Get all documents from a collection
   */
  async getDocuments<T>(
    collectionName: string,
    constraints?: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const col = collection(this.firestore, collectionName);
      const q = constraints ? query(col, ...constraints) : col;
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument<T>(
    collectionName: string,
    documentId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      const snapshot = await getDocs(query(collection(this.firestore, collectionName), where('id', '==', documentId)));
      
      if (snapshot.empty) {
        return null;
      }

      const docSnap = snapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    } catch (error) {
      console.error(`Error fetching document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Add a new document to collection
   */
  async addDocument<T extends { id?: string }>(
    collectionName: string,
    data: T
  ): Promise<string> {
    try {
      const col = collection(this.firestore, collectionName);
      const docRef = await addDoc(col, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      // First, find the document by custom id field
      const snapshot = await getDocs(
        query(
          collection(this.firestore, collectionName),
          where('id', '==', documentId)
        )
      );

      if (snapshot.empty) {
        throw new Error(`Document with id ${documentId} not found in ${collectionName}`);
      }

      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<void> {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, collectionName),
          where('id', '==', documentId)
        )
      );

      if (snapshot.empty) {
        throw new Error(`Document with id ${documentId} not found in ${collectionName}`);
      }

      await deleteDoc(snapshot.docs[0].ref);
    } catch (error) {
      console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates from a collection
   */
  listenToCollection<T>(
    collectionName: string,
    constraints?: QueryConstraint[],
    onNext?: (data: T[]) => void,
    onError?: (error: any) => void
  ): Unsubscribe {
    try {
      const col = collection(this.firestore, collectionName);
      const q = constraints ? query(col, ...constraints) : col;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as T));

          if (onNext) {
            onNext(data);
          }
        },
        (error) => {
          console.error(`Error listening to ${collectionName}:`, error);
          if (onError) {
            onError(error);
          }
        }
      );

      // Store unsubscriber for cleanup
      this.unsubscribers.set(collectionName, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Stop listening to a collection
   */
  stopListening(collectionName: string): void {
    const unsubscribe = this.unsubscribers.get(collectionName);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribers.delete(collectionName);
    }
  }

  /**
   * Query documents with filters
   */
  async queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const col = collection(this.firestore, collectionName);
      const q = query(col, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch write operations
   */
  async batchWrite(
    operations: Array<{
      type: 'set' | 'update' | 'delete';
      collection: string;
      docId: string;
      data?: any;
    }>
  ): Promise<void> {
    try {
      // Firebase SDK v9+ doesn't have batch in the modular API the same way
      // We'll execute operations sequentially for now
      for (const op of operations) {
        if (op.type === 'set' || op.type === 'update') {
          if (op.type === 'update') {
            await this.updateDocument(op.collection, op.docId, op.data);
          } else {
            await this.addDocument(op.collection, { ...op.data, id: op.docId });
          }
        } else if (op.type === 'delete') {
          await this.deleteDocument(op.collection, op.docId);
        }
      }
    } catch (error) {
      console.error('Error during batch write:', error);
      throw error;
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers.clear();
  }
}
