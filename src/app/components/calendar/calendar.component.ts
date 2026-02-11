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
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
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
