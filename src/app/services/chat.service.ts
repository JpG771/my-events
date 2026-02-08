import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { Chat, ChatMessage, DirectChat } from '../models/chat.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore: Firestore = firebase.firestore;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  constructor() {}

  async createEventChat(eventId: string, participants: string[]): Promise<string> {
    const chatsCollection = collection(this.firestore, 'chats');
    const docRef = await addDoc(chatsCollection, {
      eventId,
      participants,
      messages: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async sendMessage(chatId: string, senderId: string, content: string): Promise<void> {
    const messagesCollection = collection(this.firestore, `chats/${chatId}/messages`);
    await addDoc(messagesCollection, {
      chatId,
      senderId,
      content,
      timestamp: Timestamp.now(),
      readBy: [senderId]
    });

    const chatDoc = doc(this.firestore, 'chats', chatId);
    await updateDoc(chatDoc, {
      updatedAt: Timestamp.now()
    });
  }

  subscribeToChat(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesCollection = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      callback(messages);
    });
  }

  async markMessageAsRead(chatId: string, messageId: string, userId: string): Promise<void> {
    const messageDoc = doc(this.firestore, `chats/${chatId}/messages`, messageId);
    const messageSnap = await getDoc(messageDoc);
    
    if (messageSnap.exists()) {
      const message = messageSnap.data() as ChatMessage;
      if (!message.readBy.includes(userId)) {
        await updateDoc(messageDoc, {
          readBy: [...message.readBy, userId]
        });
      }
    }
  }

  async createDirectChat(user1Id: string, user2Id: string): Promise<string> {
    const directChatsCollection = collection(this.firestore, 'directChats');
    
    // Check if chat already exists
    const q = query(
      directChatsCollection,
      where('participants', 'array-contains', user1Id)
    );
    const snapshot = await getDocs(q);
    const existingChat = snapshot.docs.find(doc => {
      const data = doc.data();
      return data['participants'].includes(user2Id);
    });

    if (existingChat) {
      return existingChat.id;
    }

    // Create new chat
    const docRef = await addDoc(directChatsCollection, {
      participants: [user1Id, user2Id],
      messages: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getEventChat(eventId: string): Promise<Chat | null> {
    const chatsCollection = collection(this.firestore, 'chats');
    const q = query(chatsCollection, where('eventId', '==', eventId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Chat;
    }
    return null;
  }
}
