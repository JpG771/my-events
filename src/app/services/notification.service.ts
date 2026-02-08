import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { Notification } from '../models/notification.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore: Firestore = firebase.firestore;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  private unsubscribe?: () => void;

  constructor() {}

  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<string> {
    const notificationsCollection = collection(this.firestore, 'notifications');
    const docRef = await addDoc(notificationsCollection, {
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  subscribeToNotifications(userId: string): void {
    const notificationsCollection = collection(this.firestore, 'notifications');
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      this.notificationsSubject.next(notifications);
    });
  }

  unsubscribeFromNotifications(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notificationDoc = doc(this.firestore, 'notifications', notificationId);
    await updateDoc(notificationDoc, {
      read: true
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notificationsCollection = collection(this.firestore, 'notifications');
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    await Promise.all(updates);
  }

  async notifyEventInvite(inviteeId: string, eventId: string, eventTitle: string): Promise<void> {
    await this.createNotification(
      inviteeId,
      'event_invite',
      'New Event Invitation',
      `You have been invited to ${eventTitle}`,
      { eventId }
    );
  }

  async notifyEventUpdate(userId: string, eventId: string, eventTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      'event_update',
      'Event Updated',
      `${eventTitle} has been updated`,
      { eventId }
    );
  }

  async notifyEventCancelled(userId: string, eventId: string, eventTitle: string): Promise<void> {
    await this.createNotification(
      userId,
      'event_cancelled',
      'Event Cancelled',
      `${eventTitle} has been cancelled`,
      { eventId }
    );
  }
}
