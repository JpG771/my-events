import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss'
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.event = this.getEmptyEvent();
    this.eventId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEvent(this.eventId);
    } else {
      // Initialize date strings for new event
      const now = new Date();
      this.startDateString = this.dateToString(now);
      this.endDateString = this.dateToString(new Date(now.getTime() + 3600000)); // 1 hour later
    }
    this.cdr.detectChanges();
  }

  async loadEvent(id: string) {
    try {
      this.loading = true;
      const event = await this.eventService.getEvent(id);
      if (event) {
        this.event = event;
        this.startDateString = this.dateToString(event.startDate);
        this.endDateString = this.dateToString(event.endDate);
      } else {
        this.errorMessage = 'Event not found';
        console.error('Event not found with id:', id);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load event';
      console.error('Error loading event:', error);
    } finally {
      this.loading = false;
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
