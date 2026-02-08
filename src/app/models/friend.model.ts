export interface Friend {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  groups: string[];
  createdAt: Date;
}

export interface FriendGroup {
  id: string;
  userId: string;
  name: string;
  memberIds: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
