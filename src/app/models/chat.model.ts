export interface Chat {
  id: string;
  eventId: string;
  participants: string[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  readBy: string[];
}

export interface DirectChat {
  id: string;
  participants: [string, string];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
