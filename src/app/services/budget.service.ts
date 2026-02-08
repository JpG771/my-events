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
  Timestamp
} from 'firebase/firestore';
import { firebase } from '../../firebase';
import { Budget, BudgetEvent } from '../models/budget.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private firestore: Firestore = firebase.firestore;
  private budgetSubject = new BehaviorSubject<Budget | null>(null);
  public budget$: Observable<Budget | null> = this.budgetSubject.asObservable();

  constructor() {}

  async createBudget(userId: string, month: string, limit: number): Promise<string> {
    const budgetsCollection = collection(this.firestore, 'budgets');
    const docRef = await addDoc(budgetsCollection, {
      userId,
      month,
      limit,
      spent: 0,
      events: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async getBudget(userId: string, month: string): Promise<Budget | null> {
    const budgetsCollection = collection(this.firestore, 'budgets');
    const q = query(
      budgetsCollection,
      where('userId', '==', userId),
      where('month', '==', month)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Budget;
    }
    return null;
  }

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
    const budgetDoc = doc(this.firestore, 'budgets', budgetId);
    await updateDoc(budgetDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async addEventToBudget(
    userId: string,
    month: string,
    eventId: string,
    eventTitle: string,
    cost: number,
    date: Date
  ): Promise<void> {
    let budget = await this.getBudget(userId, month);
    
    if (!budget) {
      const budgetId = await this.createBudget(userId, month, 0);
      budget = await this.getBudget(userId, month);
    }

    if (budget) {
      const budgetEvent: BudgetEvent = {
        eventId,
        eventTitle,
        cost,
        date
      };

      const events = [...budget.events, budgetEvent];
      const spent = budget.spent + cost;

      await this.updateBudget(budget.id, {
        events,
        spent
      });
    }
  }

  async getUserBudgets(userId: string): Promise<Budget[]> {
    const budgetsCollection = collection(this.firestore, 'budgets');
    const q = query(
      budgetsCollection,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
  }

  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
