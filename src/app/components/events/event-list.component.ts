import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  templateUrl: `./event-list.component.html`,
  styleUrl: `./event-list.component.scss`
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filter: 'all' | 'scheduled' | 'draft' | 'completed' = 'all';
  loading = true;
  error = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      console.log('Current user:', user?.uid);
      if (user) {
        this.events = await this.eventService.getUserEvents(user.uid);
        console.log('Loaded events:', this.events);
        this.cdr.detectChanges(); // Manually trigger change detection
      } else {
        this.error = 'User not authenticated';
        console.error('No user found');
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to load events';
      console.error('Error loading events:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Trigger change detection for loading state
    }
  }

  async refreshEvents() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loading = true;
      try {
        this.events = await this.eventService.getUserEvents(user.uid);
        console.log('Refreshed events:', this.events);
        this.cdr.detectChanges();
      } catch (error: any) {
        this.error = error.message || 'Failed to refresh events';
        console.error('Error refreshing events:', error);
      } finally {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }
  }

  get filteredEvents(): Event[] {
    if (this.filter === 'all') {
      return this.events;
    }
    return this.events.filter(event => event.status === this.filter);
  }

  async deleteEvent(event: Event) {
    if (!event.id) {
      this.error = 'Cannot delete event: Event ID is missing';
      console.error('Event ID is missing:', event);
      this.cdr.detectChanges();
      return;
    }

    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      await this.eventService.deleteEvent(event.id);
      this.events = this.events.filter(e => e.id !== event.id);
      this.cdr.detectChanges();
    } catch (error: any) {
      this.error = error.message || 'Failed to delete event';
      console.error('Error deleting event:', error);
      this.cdr.detectChanges();
    }
  }
}
