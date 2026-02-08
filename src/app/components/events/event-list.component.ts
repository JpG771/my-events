import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="events-container">
      <div class="events-header">
        <h1>{{ 'nav.events' | translate }}</h1>
        <a routerLink="/events/create" class="btn btn-primary">{{ 'event.create' | translate }}</a>
      </div>

      <div class="filter-bar">
        <button [class.active]="filter === 'all'" (click)="filter = 'all'">All</button>
        <button [class.active]="filter === 'scheduled'" (click)="filter = 'scheduled'">{{ 'event.status.scheduled' | translate }}</button>
        <button [class.active]="filter === 'draft'" (click)="filter = 'draft'">{{ 'event.status.draft' | translate }}</button>
        <button [class.active]="filter === 'completed'" (click)="filter = 'completed'">{{ 'event.status.completed' | translate }}</button>
      </div>

      <div class="events-grid" *ngIf="filteredEvents.length > 0; else noEvents">
        <div class="event-card" *ngFor="let event of filteredEvents">
          <div class="event-header">
            <h3>{{ event.title }}</h3>
            <span class="event-status" [class]="'status-' + event.status">{{ event.status }}</span>
          </div>
          <p class="event-description">{{ event.description }}</p>
          <div class="event-details">
            <div class="detail-item">
              <span class="icon">📅</span>
              <span>{{ event.startDate | date:'short' }}</span>
            </div>
            <div class="detail-item" *ngIf="event.locations.length > 0">
              <span class="icon">📍</span>
              <span>{{ event.locations[0].name }}</span>
            </div>
            <div class="detail-item">
              <span class="icon">👥</span>
              <span>{{ event.invites.length }} invites</span>
            </div>
          </div>
          <div class="event-actions">
            <a [routerLink]="['/events', event.id]" class="btn btn-sm">View</a>
            <a [routerLink]="['/events', event.id, 'edit']" class="btn btn-sm btn-secondary">{{ 'common.edit' | translate }}</a>
          </div>
        </div>
      </div>

      <ng-template #noEvents>
        <div class="no-events">
          <p *ngIf="loading">Loading events...</p>
          <p *ngIf="!loading && error">{{ error }}</p>
          <p *ngIf="!loading && !error">No events found</p>
          <a routerLink="/events/create" class="btn btn-primary" *ngIf="!loading">{{ 'event.create' | translate }}</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .events-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .events-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      color: #1976d2;
      font-size: 32px;
      margin: 0;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .filter-bar button {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      background: white;
      color: #616161;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-bar button.active {
      border-color: #1976d2;
      background-color: #1976d2;
      color: white;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .event-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      transition: transform 0.3s;
    }

    .event-card:hover {
      transform: translateY(-4px);
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .event-header h3 {
      margin: 0;
      color: #212121;
      font-size: 18px;
      flex: 1;
    }

    .event-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
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

    .event-description {
      color: #616161;
      font-size: 14px;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .event-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #616161;
    }

    .icon {
      font-size: 16px;
    }

    .event-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.3s;
      text-align: center;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1565c0;
    }

    .btn-sm {
      flex: 1;
      background-color: #1976d2;
      color: white;
    }

    .btn-sm.btn-secondary {
      background-color: #42a5f5;
    }

    .no-events {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
    }

    .no-events p {
      color: #9e9e9e;
      font-size: 18px;
      margin-bottom: 20px;
    }
  `]
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filter: 'all' | 'scheduled' | 'draft' | 'completed' = 'all';
  loading = true;
  error = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      console.log('Current user:', user?.uid);
      if (user) {
        this.events = await this.eventService.getUserEvents(user.uid);
        console.log('Loaded events:', this.events);
      } else {
        this.error = 'User not authenticated';
        console.error('No user found');
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to load events';
      console.error('Error loading events:', error);
    } finally {
      this.loading = false;
    }
  }

  get filteredEvents(): Event[] {
    if (this.filter === 'all') {
      return this.events;
    }
    return this.events.filter(event => event.status === this.filter);
  }
}
