import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { Event, EventTemplate, ActivityProposal } from '../models/event.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private firestore: Firestore = firebase.firestore;
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$: Observable<Event[]> = this.eventsSubject.asObservable();

  constructor() {}

  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const eventsCollection = collection(this.firestore, 'events');
    const docRef = await addDoc(eventsCollection, {
      ...event,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    await updateDoc(eventDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    await deleteDoc(eventDoc);
  }

  async getEvent(eventId: string): Promise<Event | null> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    const snapshot = await getDoc(eventDoc);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Event;
    }
    return null;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const eventsCollection = collection(this.firestore, 'events');
    
    // Query for events where user is the creator
    const creatorQuery = query(
      eventsCollection,
      where('creatorId', '==', userId)
    );
    
    const creatorSnapshot = await getDocs(creatorQuery);
    const events = creatorSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        startDate: data['startDate']?.toDate?.() || new Date(data['startDate']),
        endDate: data['endDate']?.toDate?.() || new Date(data['endDate']),
        createdAt: data['createdAt']?.toDate?.() || new Date(data['createdAt']),
        updatedAt: data['updatedAt']?.toDate?.() || new Date(data['updatedAt'])
      } as Event;
    });
    
    // Sort by startDate in memory
    events.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    
    return events;
  }

  async cancelEventOccurrence(eventId: string, occurrenceDate: Date): Promise<void> {
    const eventDoc = doc(this.firestore, 'events', eventId);
    const event = await this.getEvent(eventId);
    if (event) {
      const cancelledOccurrences = event.cancelledOccurrences || [];
      cancelledOccurrences.push(occurrenceDate);
      await updateDoc(eventDoc, {
        cancelledOccurrences,
        updatedAt: Timestamp.now()
      });
    }
  }

  async createTemplate(template: Omit<EventTemplate, 'id' | 'createdAt'>): Promise<string> {
    const templatesCollection = collection(this.firestore, 'eventTemplates');
    const docRef = await addDoc(templatesCollection, {
      ...template,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getTemplates(userId: string): Promise<EventTemplate[]> {
    const templatesCollection = collection(this.firestore, 'eventTemplates');
    const q = query(
      templatesCollection,
      where('creatorId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventTemplate));
  }

  async proposeActivities(preferences: any): Promise<ActivityProposal[]> {
    // This would integrate with an AI service or predefined activity database
    // For now, return mock data
    return [
      {
        id: '1',
        title: 'Movie Night',
        description: 'Watch a movie together',
        category: 'Entertainment',
        estimatedCost: 15,
        estimatedDuration: 180,
        suggestedLocations: []
      }
    ];
  }

  async autoScheduleEvent(
    event: Partial<Event>,
    participantIds: string[],
    preferences: any
  ): Promise<Date> {
    // This would analyze calendar availability and suggest optimal time
    // For now, return a simple suggestion
    const now = new Date();
    now.setDate(now.getDate() + 7);
    now.setHours(19, 0, 0, 0);
    return now;
  }
}
