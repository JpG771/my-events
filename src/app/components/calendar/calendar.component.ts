import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <h1>{{ 'nav.calendar' | translate }}</h1>
        <div class="view-switcher">
          <button [class.active]="view === 'month'" (click)="view = 'month'">{{ 'calendar.month' | translate }}</button>
          <button [class.active]="view === 'week'" (click)="view = 'week'">{{ 'calendar.week' | translate }}</button>
          <button [class.active]="view === 'list'" (click)="view = 'list'">{{ 'calendar.list' | translate }}</button>
        </div>
      </div>

      <div class="calendar-controls">
        <button (click)="previousPeriod()" class="btn btn-icon">◀</button>
        <button (click)="today()" class="btn">{{ 'calendar.today' | translate }}</button>
        <button (click)="nextPeriod()" class="btn btn-icon">▶</button>
        <h2>{{ currentPeriodLabel }}</h2>
      </div>

      <div class="calendar-content" *ngIf="view === 'month'">
        <div class="calendar-grid">
          <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
          <div
            class="calendar-day"
            *ngFor="let day of calendarDays"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-events">
              <div
                class="event-indicator"
                *ngFor="let event of day.events"
                [title]="event.title"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-content" *ngIf="view === 'week'">
        <div class="week-view">
          <div class="week-day" *ngFor="let day of weekDays">
            <div class="week-day-header">
              <div class="day-name">{{ day }}</div>
              <div class="day-date">{{ getCurrentWeekDay(weekDays.indexOf(day)) }}</div>
            </div>
            <div class="week-day-events">
              <div
                class="week-event"
                *ngFor="let event of getWeekDayEvents(weekDays.indexOf(day))"
                [routerLink]="['/events', event.id]"
              >
                <div class="event-time">{{ event.startDate | date:'shortTime' }}</div>
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-content" *ngIf="view === 'list'">
        <div class="list-view">
          <div class="list-item" *ngFor="let event of sortedEvents" [routerLink]="['/events', event.id]">
            <div class="list-date">
              <div class="date-day">{{ event.startDate | date:'d' }}</div>
              <div class="date-month">{{ event.startDate | date:'MMM' }}</div>
            </div>
            <div class="list-details">
              <h3>{{ event.title }}</h3>
              <p>{{ event.startDate | date:'shortTime' }} - {{ event.endDate | date:'shortTime' }}</p>
              <p class="event-location" *ngIf="event.locations.length > 0">
                📍 {{ event.locations[0].name }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-actions">
        <button class="btn btn-secondary">{{ 'calendar.importGoogle' | translate }}</button>
        <button class="btn btn-secondary">{{ 'calendar.exportGoogle' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      color: #1976d2;
      font-size: 32px;
      margin: 0;
    }

    .view-switcher {
      display: flex;
      gap: 8px;
    }

    .view-switcher button {
      padding: 8px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      color: #616161;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .view-switcher button.active {
      background-color: #1976d2;
      border-color: #1976d2;
      color: white;
    }

    .calendar-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .calendar-controls h2 {
      margin: 0;
      color: #424242;
      font-size: 20px;
      flex: 1;
    }

    .calendar-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin-bottom: 24px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .day-header {
      background: #1976d2;
      color: white;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
    }

    .calendar-day {
      background: white;
      min-height: 100px;
      padding: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .calendar-day:hover {
      background-color: #f5f5f5;
    }

    .calendar-day.other-month {
      background-color: #fafafa;
      color: #9e9e9e;
    }

    .calendar-day.today {
      background-color: #e3f2fd;
    }

    .day-number {
      font-weight: 600;
      color: #424242;
      margin-bottom: 4px;
    }

    .day-events {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .event-indicator {
      background-color: #1976d2;
      color: white;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .week-view {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 16px;
    }

    .week-day-header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e0e0e0;
    }

    .day-name {
      font-weight: 600;
      color: #1976d2;
      font-size: 16px;
    }

    .day-date {
      color: #616161;
      font-size: 14px;
      margin-top: 4px;
    }

    .week-day-events {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .week-event {
      background-color: #e3f2fd;
      border-left: 4px solid #1976d2;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .week-event:hover {
      background-color: #bbdefb;
    }

    .event-time {
      font-size: 12px;
      color: #616161;
      margin-bottom: 4px;
    }

    .event-title {
      font-weight: 600;
      color: #212121;
      font-size: 13px;
    }

    .list-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .list-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .list-item:hover {
      background-color: #e3f2fd;
    }

    .list-date {
      background: #1976d2;
      color: white;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      min-width: 60px;
    }

    .date-day {
      font-size: 24px;
      font-weight: 700;
    }

    .date-month {
      font-size: 14px;
      text-transform: uppercase;
    }

    .list-details {
      flex: 1;
    }

    .list-details h3 {
      margin: 0 0 8px 0;
      color: #212121;
      font-size: 18px;
    }

    .list-details p {
      margin: 4px 0;
      color: #616161;
      font-size: 14px;
    }

    .calendar-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-secondary {
      background-color: #42a5f5;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #1e88e5;
    }

    .btn-icon {
      padding: 10px 16px;
      background-color: #e0e0e0;
      color: #424242;
    }

    .btn-icon:hover {
      background-color: #bdbdbd;
    }
  `]
})
export class CalendarComponent implements OnInit {
  view: 'month' | 'week' | 'list' = 'month';
  currentDate = new Date();
  events: Event[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.events = await this.eventService.getUserEvents(user.uid);
    }
    this.generateCalendar();
    this.cdr.detectChanges();
  }

  get currentPeriodLabel(): string {
    if (this.view === 'month') {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (this.view === 'week') {
      return `Week of ${this.currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return this.currentDate.getFullYear().toString();
  }

  get sortedEvents(): Event[] {
    return [...this.events].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      this.calendarDays.push({
        day: date.getDate(),
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        events: this.getEventsForDate(date)
      });
    }
  }

  getEventsForDate(date: Date): Event[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  getCurrentWeekDay(dayIndex: number): string {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + dayIndex);
    return day.getDate().toString();
  }

  getWeekDayEvents(dayIndex: number): Event[] {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + dayIndex);
    return this.getEventsForDate(day);
  }

  previousPeriod() {
    if (this.view === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    }
    this.generateCalendar();
  }

  nextPeriod() {
    if (this.view === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.view === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    }
    this.generateCalendar();
  }

  today() {
    this.currentDate = new Date();
    this.generateCalendar();
  }
}
