import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { User, UserPreferences } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = firebase.firestore;

  constructor() {}

  async createUserProfile(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    const userDoc = doc(this.firestore, 'users', user.uid);
    await setDoc(userDoc, {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  async getUserProfile(uid: string): Promise<User | null> {
    const userDoc = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(userDoc);
    if (snapshot.exists()) {
      return snapshot.data() as User;
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('email', '==', email.toLowerCase().trim()));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    return null;
  }

  async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    const userDoc = doc(this.firestore, 'users', uid);
    await updateDoc(userDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async updateUserPreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
    const userDoc = doc(this.firestore, 'users', uid);
    const user = await this.getUserProfile(uid);
    
    if (user) {
      await updateDoc(userDoc, {
        preferences: { ...user.preferences, ...preferences },
        updatedAt: Timestamp.now()
      });
    }
  }

  getDefaultPreferences(): UserPreferences {
    return {
      language: 'en',
      notifications: {
        newInvite: true,
        eventUpdate: true,
        chatMessage: true,
        eventReminder: true
      },
      defaultCalendarView: 'month',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}
