import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { Friend, FriendGroup } from '../models/friend.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private firestore: Firestore = firebase.firestore;
  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  public friends$: Observable<Friend[]> = this.friendsSubject.asObservable();
  private dbName = 'MyEventsDB';
  private storeName = 'friends';
  private dbVersion = 1;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'userId' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async cacheFriends(userId: string, friends: Friend[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const data = {
        userId,
        friends,
        timestamp: Date.now()
      };
      
      await store.put(data);
    } catch (error) {
      console.error('Failed to cache friends:', error);
    }
  }

  private async getCachedFriends(userId: string): Promise<Friend[] | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(userId);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Check if cache is less than 5 minutes old
            const cacheAge = Date.now() - result.timestamp;
            if (cacheAge < 5 * 60 * 1000) {
              resolve(result.friends);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached friends:', error);
      return null;
    }
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<string> {
    const friendsCollection = collection(this.firestore, 'friends');
    const docRef = await addDoc(friendsCollection, {
      userId,
      friendId,
      status: 'pending',
      groups: [],
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async acceptFriendRequest(friendRequestId: string): Promise<void> {
    const friendDoc = doc(this.firestore, 'friends', friendRequestId);
    await updateDoc(friendDoc, {
      status: 'accepted'
    });
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    const friendsCollection = collection(this.firestore, 'friends');
    await addDoc(friendsCollection, {
      userId,
      friendId: blockedUserId,
      status: 'blocked',
      groups: [],
      createdAt: Timestamp.now()
    });
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      where('friendId', '==', blockedUserId),
      where('status', '==', 'blocked')
    );
    const snapshot = await getDocs(q);
    
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
  }

  async getUserFriends(userId: string): Promise<Friend[]> {
    // Try to get from cache first
    const cachedFriends = await this.getCachedFriends(userId);
    if (cachedFriends) {
      console.log('Returning cached friends');
      this.friendsSubject.next(cachedFriends);
      return cachedFriends;
    }

    // Fetch from Firestore if no cache or cache expired
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    const snapshot = await getDocs(q);
    const friends = snapshot.docs.map(doc => ({ ...doc.data() } as Friend));
    
    // Cache the results
    await this.cacheFriends(userId, friends);
    this.friendsSubject.next(friends);
    
    return friends;
  }

  async getBlockedUsers(userId: string): Promise<Friend[]> {
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      where('status', '==', 'blocked')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Friend));
  }

  async createGroup(userId: string, name: string, color: string): Promise<string> {
    const groupsCollection = collection(this.firestore, 'friendGroups');
    const docRef = await addDoc(groupsCollection, {
      userId,
      name,
      memberIds: [],
      color,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async addFriendToGroup(groupId: string, friendId: string): Promise<void> {
    const groupDoc = doc(this.firestore, 'friendGroups', groupId);
    const groupSnap = await getDocs(query(collection(this.firestore, 'friendGroups'), where('__name__', '==', groupId)));
    
    if (!groupSnap.empty) {
      const group = groupSnap.docs[0].data() as FriendGroup;
      const memberIds = [...group.memberIds, friendId];
      await updateDoc(groupDoc, {
        memberIds,
        updatedAt: Timestamp.now()
      });
    }
  }

  async getUserGroups(userId: string): Promise<FriendGroup[]> {
    const groupsCollection = collection(this.firestore, 'friendGroups');
    const q = query(groupsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendGroup));
  }

  async deleteGroup(groupId: string): Promise<void> {
    const groupDoc = doc(this.firestore, 'friendGroups', groupId);
    await deleteDoc(groupDoc);
  }
}
