import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { NotificationService } from '../../services/notification.service';
import { Event, EventLocation, EventInvite } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="form-container">
      <div class="form-card">
        <h1>{{ isEditMode ? ('event.edit' | translate) : ('event.create' | translate) }}</h1>

        <form (ngSubmit)="onSubmit()" #eventForm="ngForm">
          <div class="form-group">
            <label for="title">{{ 'event.title' | translate }} *</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="event.title"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="description">{{ 'event.description' | translate }}</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="event.description"
              rows="4"
              class="form-control"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">{{ 'event.startDate' | translate }} *</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                [(ngModel)]="startDateString"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="endDate">{{ 'event.endDate' | translate }} *</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                [(ngModel)]="endDateString"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label>{{ 'event.location' | translate }}</label>
            <div class="locations-list">
              <div class="location-item" *ngFor="let location of event.locations; let i = index">
                <input
                  type="text"
                  [(ngModel)]="location.name"
                  [name]="'location-' + i"
                  placeholder="Location name"
                  class="form-control"
                />
                <button type="button" (click)="removeLocation(i)" class="btn btn-danger-sm">×</button>
              </div>
            </div>
            <button type="button" (click)="addLocation()" class="btn btn-secondary btn-sm">
              {{ 'event.addLocation' | translate }}
            </button>
          </div>

          <div class="form-group">
            <label for="costTotal">{{ 'event.cost' | translate }}</label>
            <input
              type="number"
              id="costTotal"
              name="costTotal"
              [(ngModel)]="event.costDistribution.total"
              class="form-control"
              min="0"
            />
          </div>

          <div class="form-group">
            <label>{{ 'event.costDistribution' | translate }}</label>
            <div class="radio-group">
              <label>
                <input
                  type="radio"
                  [(ngModel)]="event.costDistribution.type"
                  name="costType"
                  value="equal"
                />
                {{ 'event.equalSplit' | translate }}
              </label>
              <label>
                <input
                  type="radio"
                  [(ngModel)]="event.costDistribution.type"
                  name="costType"
                  value="manual"
                />
                {{ 'event.manualSplit' | translate }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="event.isRecurring" name="isRecurring" />
              {{ 'event.recurring' | translate }}
            </label>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!eventForm.valid || loading"
            >
              {{ loading ? ('common.loading' | translate) : ('common.save' | translate) }}
            </button>
            <button type="button" (click)="onCancel()" class="btn btn-secondary">
              {{ 'common.cancel' | translate }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }

    h1 {
      color: #1976d2;
      margin-bottom: 30px;
      font-size: 28px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #424242;
      font-weight: 600;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #1976d2;
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .locations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;
    }

    .location-item {
      display: flex;
      gap: 8px;
    }

    .radio-group {
      display: flex;
      gap: 20px;
    }

    .radio-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
      cursor: pointer;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #1976d2;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1565c0;
    }

    .btn-secondary {
      background-color: #e0e0e0;
      color: #424242;
    }

    .btn-secondary:hover {
      background-color: #bdbdbd;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    .btn-danger-sm {
      padding: 4px 12px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EventFormComponent implements OnInit {
  event!: Event;
  startDateString = '';
  endDateString = '';
  isEditMode = false;
  eventId?: string;
  errorMessage = '';
  loading = false;

  constructor(
    private eventService: EventService,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.event = this.getEmptyEvent();
    this.eventId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEvent(this.eventId);
    }
  }

  async loadEvent(id: string) {
    const event = await this.eventService.getEvent(id);
    if (event) {
      this.event = event;
      this.startDateString = this.dateToString(event.startDate);
      this.endDateString = this.dateToString(event.endDate);
    }
  }

  getEmptyEvent(): Event {
    const user = this.authService.getCurrentUser();
    return {
      id: '',
      title: '',
      description: '',
      creatorId: user?.uid || '',
      locations: [],
      startDate: new Date(),
      endDate: new Date(),
      isRecurring: false,
      invites: [],
      status: 'draft',
      costDistribution: {
        total: 0,
        type: 'equal'
      },
      chatId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  addLocation() {
    this.event.locations.push({
      id: Date.now().toString(),
      name: '',
      address: ''
    });
  }

  removeLocation(index: number) {
    this.event.locations.splice(index, 1);
  }

  dateToString(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.event.startDate = new Date(this.startDateString);
      this.event.endDate = new Date(this.endDateString);

      if (this.isEditMode && this.eventId) {
        await this.eventService.updateEvent(this.eventId, this.event);
      } else {
        const eventId = await this.eventService.createEvent(this.event);
        
        // Create chat for event
        const chatId = await this.chatService.createEventChat(eventId, [this.event.creatorId]);
        await this.eventService.updateEvent(eventId, { chatId });
      }

      this.router.navigate(['/events']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save event';
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.router.navigate(['/events']);
  }
}
