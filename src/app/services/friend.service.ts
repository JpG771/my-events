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

  constructor() {}

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
    const friendsCollection = collection(this.firestore, 'friends');
    const q = query(
      friendsCollection,
      where('userId', '==', userId),
      where('status', '==', 'accepted')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Friend));
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
