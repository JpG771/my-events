import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isAuthenticated = false;
  currentLanguage = 'en';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  async logout() {
    // Unsubscribe from all Firestore listeners before signing out
    this.notificationService.unsubscribeFromNotifications();
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchLanguage(lang: 'en' | 'fr') {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }
}

