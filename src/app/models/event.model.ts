export interface Event {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  locations: EventLocation[];
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  invites: EventInvite[];
  templateId?: string;
  status: 'draft' | 'scheduled' | 'cancelled' | 'completed';
  costDistribution: CostDistribution;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledOccurrences?: Date[];
}

export interface EventLocation {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventInvite {
  userId: string;
  status: 'pending' | 'accepted' | 'declined';
  roles: string[];
  cost?: number;
  respondedAt?: Date;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

export interface CostDistribution {
  total: number;
  type: 'manual' | 'equal';
  perUser?: { [userId: string]: number };
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  defaultDuration: number; // in minutes
  defaultLocations: EventLocation[];
  defaultRoles: string[];
  creatorId: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface ActivityProposal {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCost: number;
  estimatedDuration: number;
  suggestedLocations: EventLocation[];
}
