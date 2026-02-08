export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: 'en' | 'fr';
  notifications: {
    newInvite: boolean;
    eventUpdate: boolean;
    chatMessage: boolean;
    eventReminder: boolean;
  };
  defaultCalendarView: 'month' | 'week' | 'list';
  timezone: string;
}
