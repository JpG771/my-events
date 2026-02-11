import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FriendService } from '../../services/friend.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Friend, FriendGroup } from '../../models/friend.model';
import { User } from '../../models/user.model';

interface FriendWithUser extends Friend {
  user?: User;
}

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit {
  friends: FriendWithUser[] = [];
  groups: FriendGroup[] = [];
  selectedGroup: FriendGroup | null = null;
  loading = true;
  error = '';
  
  // Friend request
  friendEmail = '';
  
  // Group creation
  showCreateGroupModal = false;
  newGroupName = '';
  newGroupColor = '#3b82f6';
  
  // Group management
  showAddToGroupModal = false;
  selectedFriendsForGroup: string[] = [];
  groupToAddTo: FriendGroup | null = null;

  constructor(
    private friendService: FriendService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      const user = this.authService.getCurrentUser();
      
      if (user) {
        // Load friends and groups in parallel
        const [friendsData, groupsData] = await Promise.all([
          this.friendService.getUserFriends(user.uid),
          this.friendService.getUserGroups(user.uid)
        ]);
        
        this.friends = friendsData;
        this.groups = groupsData;
        
        // Load user details for each friend
        await this.loadFriendDetails();
        
        this.cdr.detectChanges();
      } else {
        this.error = 'User not authenticated';
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to load friends';
      console.error('Error loading friends:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadFriendDetails() {
    const userPromises = this.friends.map(async (friend) => {
      try {
        const userData = await this.userService.getUserProfile(friend.friendId);
        friend.user = userData || undefined;
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    });
    
    await Promise.all(userPromises);
  }

  async sendFriendRequest() {
    if (!this.friendEmail.trim()) {
      return;
    }

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.error = 'User not authenticated';
        this.cdr.detectChanges();
        return;
      }

      const searchTerm = this.friendEmail.trim();
      let friendUser: User | null = null;

      // Try to look up the user by email first
      if (searchTerm.includes('@')) {
        friendUser = await this.userService.getUserByEmail(searchTerm);
      }
      
      // If not found by email, try by user ID
      if (!friendUser) {
        friendUser = await this.userService.getUserProfile(searchTerm);
      }
      
      if (!friendUser) {
        this.error = 'User not found with this email address or ID';
        this.cdr.detectChanges();
        return;
      }

      // Check if trying to add self as friend
      if (friendUser.uid === user.uid) {
        this.error = 'You cannot add yourself as a friend';
        this.cdr.detectChanges();
        return;
      }

      // Check if already friends
      const alreadyFriend = this.friends.some(f => f.friendId === friendUser.uid);
      if (alreadyFriend) {
        this.error = 'This user is already your friend';
        this.cdr.detectChanges();
        return;
      }

      await this.friendService.sendFriendRequest(user.uid, friendUser.uid);
      this.friendEmail = '';
      this.error = ''; // Clear any previous errors
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to send friend request';
      this.cdr.detectChanges();
      console.error('Error sending friend request:', error);
    }
  }

  async createGroup() {
    if (!this.newGroupName.trim()) {
      return;
    }

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.error = 'User not authenticated';
        return;
      }

      await this.friendService.createGroup(user.uid, this.newGroupName, this.newGroupColor);
      this.newGroupName = '';
      this.newGroupColor = '#3b82f6';
      this.showCreateGroupModal = false;
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to create group';
      console.error('Error creating group:', error);
    }
  }

  async deleteGroup(group: FriendGroup) {
    if (!confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      return;
    }

    try {
      await this.friendService.deleteGroup(group.id);
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to delete group';
      console.error('Error deleting group:', error);
    }
  }

  selectGroup(group: FriendGroup) {
    this.selectedGroup = this.selectedGroup?.id === group.id ? null : group;
  }

  openAddToGroupModal(group: FriendGroup) {
    this.groupToAddTo = group;
    this.selectedFriendsForGroup = [];
    this.showAddToGroupModal = true;
  }

  toggleFriendSelection(friendId: string) {
    const index = this.selectedFriendsForGroup.indexOf(friendId);
    if (index > -1) {
      this.selectedFriendsForGroup.splice(index, 1);
    } else {
      this.selectedFriendsForGroup.push(friendId);
    }
  }

  async addFriendsToGroup() {
    if (!this.groupToAddTo || this.selectedFriendsForGroup.length === 0) {
      return;
    }

    try {
      const promises = this.selectedFriendsForGroup.map(friendId =>
        this.friendService.addFriendToGroup(this.groupToAddTo!.id, friendId)
      );
      
      await Promise.all(promises);
      this.showAddToGroupModal = false;
      this.groupToAddTo = null;
      this.selectedFriendsForGroup = [];
      await this.loadData();
    } catch (error: any) {
      this.error = error.message || 'Failed to add friends to group';
      console.error('Error adding friends to group:', error);
    }
  }

  getGroupFriends(group: FriendGroup): FriendWithUser[] {
    return this.friends.filter(friend => 
      group.memberIds.includes(friend.friendId)
    );
  }

  getAvailableFriendsForGroup(group: FriendGroup): FriendWithUser[] {
    return this.friends.filter(friend => 
      !group.memberIds.includes(friend.friendId)
    );
  }

  closeModals() {
    this.showCreateGroupModal = false;
    this.showAddToGroupModal = false;
    this.groupToAddTo = null;
    this.selectedFriendsForGroup = [];
  }
}
