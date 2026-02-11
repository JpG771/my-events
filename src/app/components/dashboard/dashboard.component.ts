import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FriendService } from '../../services/friend.service';
import { Event } from '../../models/event.model';
import { Notification } from '../../models/notification.model';
import { Budget } from '../../models/budget.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="dashboard-container">
      <h1>{{ 'nav.dashboard' | translate }}</h1>

      <div class="dashboard-grid">
        <div class="card">
          <h2>{{ 'event.title' | translate }}</h2>
          <div class="stat-value">{{ upcomingEvents.length }}</div>
          <p>Upcoming events</p>
          <a routerLink="/events" class="btn btn-link">{{ 'common.viewAll' | translate }}</a>
        </div>

        <div class="card">
          <h2>{{ 'notifications.title' | translate }}</h2>
          <div class="stat-value">{{ unreadNotifications }}</div>
          <p>Unread notifications</p>
          <a routerLink="/notifications" class="btn btn-link">{{ 'common.viewAll' | translate }}</a>
        </div>

        <div class="card">
          <h2>{{ 'budget.monthly' | translate }}</h2>
          <div class="stat-value">{{ currentBudget?.spent || 0 }} / {{ currentBudget?.limit || 0 }}</div>
          <p>{{ 'budget.spent' | translate }}</p>
          <a routerLink="/budget" class="btn btn-link">{{ 'common.viewAll' | translate }}</a>
        </div>

        <div class="card">
          <h2>{{ 'friends.title' | translate }}</h2>
          <div class="stat-value">{{ friendsCount }}</div>
          <p>Friends</p>
          <a routerLink="/friends" class="btn btn-link">{{ 'common.viewAll' | translate }}</a>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <a routerLink="/events/create" class="btn btn-primary">{{ 'event.create' | translate }}</a>
          <a routerLink="/calendar" class="btn btn-secondary">{{ 'nav.calendar' | translate }}</a>
          <a routerLink="/friends/add" class="btn btn-secondary">{{ 'friends.addFriend' | translate }}</a>
        </div>
      </div>

      <div class="recent-events">
        <h2>Recent Events</h2>
        <div class="event-list" *ngIf="upcomingEvents.length > 0; else noEvents">
          <div class="event-item" *ngFor="let event of upcomingEvents.slice(0, 5)">
            <div class="event-info">
              <h3>{{ event.title }}</h3>
              <p>{{ event.startDate | date:'medium' }}</p>
              <span class="event-status" [class]="'status-' + event.status">{{ event.status }}</span>
            </div>
            <a [routerLink]="['/events', event.id]" class="btn btn-sm">View</a>
          </div>
        </div>
        <ng-template #noEvents>
          <p class="no-data">No upcoming events</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #1976d2;
      margin-bottom: 30px;
      font-size: 32px;
    }

    h2 {
      color: #424242;
      margin-bottom: 20px;
      font-size: 20px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 24px;
      transition: transform 0.3s;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .stat-value {
      font-size: 48px;
      font-weight: 700;
      color: #1976d2;
      margin: 16px 0;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 40px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .recent-events {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }

    .event-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .event-info h3 {
      margin: 0 0 8px 0;
      color: #212121;
      font-size: 16px;
    }

    .event-info p {
      margin: 0 0 8px 0;
      color: #757575;
      font-size: 14px;
    }

    .event-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-scheduled {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-draft {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-completed {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .status-cancelled {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1565c0;
    }

    .btn-secondary {
      background-color: #42a5f5;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #1e88e5;
    }

    .btn-link {
      background: none;
      color: #1976d2;
      padding: 8px 0;
    }

    .btn-link:hover {
      text-decoration: underline;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      background-color: #1976d2;
      color: white;
    }

    .no-data {
      text-align: center;
      color: #9e9e9e;
      padding: 40px 20px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  upcomingEvents: Event[] = [];
  unreadNotifications = 0;
  currentBudget: Budget | null = null;
  friendsCount = 0;

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private userService: UserService,
    private friendService: FriendService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      await this.ensureUserProfile(user);
      await this.loadDashboardData(user.uid);
    }
  }

  async ensureUserProfile(user: any) {
    try {
      const profile = await this.userService.getUserProfile(user.uid);
      if (!profile) {
        // Create user profile if it doesn't exist
        await this.userService.createUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email || 'User',
          preferences: this.userService.getDefaultPreferences(),
          blockedUsers: []
        });
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  }

  async loadDashboardData(userId: string) {
    try {
      // Load all data in parallel
      const [allEvents, budget, friends] = await Promise.all([
        this.eventService.getUserEvents(userId).catch(() => []),
        this.budgetService.getBudget(userId, this.budgetService.getCurrentMonth()).catch(() => null),
        this.friendService.getUserFriends(userId).catch(() => [])
      ]);

      // Filter to only show upcoming events (scheduled status and future start date)
      const now = new Date();
      this.upcomingEvents = allEvents.filter(event => {
        const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
        return event.status === 'scheduled' && startDate >= now;
      }).sort((a, b) => {
        const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
        const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
        return dateA.getTime() - dateB.getTime();
      });

      this.currentBudget = budget;
      this.friendsCount = friends.length;
      
      this.notificationService.notifications$.subscribe(notifications => {
        this.unreadNotifications = notifications.filter(n => !n.read).length;
        this.cdr.detectChanges();
      });
      this.notificationService.subscribeToNotifications(userId);

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
}
