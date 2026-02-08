export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  limit: number;
  spent: number;
  events: BudgetEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetEvent {
  eventId: string;
  eventTitle: string;
  cost: number;
  date: Date;
}
