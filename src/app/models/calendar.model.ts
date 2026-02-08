export interface CalendarEvent {
  id: string;
  eventId: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  location?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface GoogleCalendarImport {
  userId: string;
  calendarId: string;
  syncToken?: string;
  lastSync?: Date;
}
