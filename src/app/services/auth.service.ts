import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private firestore!: Firestore;
  private usersCollection!: any;

  constructor(firestore: Firestore) {
    this.firestore = firestore;
    this.usersCollection = collection(this.firestore, 'users');
  }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  async login(username: string, password: string): Promise<void> {
    const hashedPassword = this.hashPassword(password);
    const q = query(this.usersCollection, where('username', '==', username), where('password', '==', hashedPassword), where('active', '==', true));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      if (data) {
        const user: User = { id: userDoc.id, ...data } as User;
        this.userSubject.next(user);
      } else {
        throw new Error('User data not found');
      }
    } else {
      throw new Error('Invalid credentials or user inactive');
    }
  }

  async logout(): Promise<void> {
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  isUser(): boolean {
    return this.isLoggedIn() && !this.isAdmin();
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(this.usersCollection);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return data ? ({ id: doc.id, ...data } as User) : null;
    }).filter(user => user !== null) as User[];
  }

  async addUser(user: Omit<User, 'id'>): Promise<void> {
    const hashedUser = { ...user, password: this.hashPassword(user.password) };
    await addDoc(this.usersCollection, hashedUser);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    if (updates.password) {
      updates.password = this.hashPassword(updates.password);
    }
    await updateDoc(doc(this.firestore, 'users', id), updates);
  }

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'users', id));
  }
}