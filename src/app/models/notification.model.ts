export interface Notification {
  id: string;
  userId: string;
  type: 'event_invite' | 'event_update' | 'event_cancelled' | 'chat_message';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}
