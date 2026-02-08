# My Events - Event Management Application

A comprehensive event management application built with Angular 21, Firebase, and i18n support for English and French. Features a beautiful light blue theme.

## 🎯 Features Implemented

### ✅ Core Features
- **Authentication**
  - User registration and login with Firebase Auth
  - Protected routes with AuthGuard
  - Session management

- **Event Management**
  - Create, edit, and delete events
  - Event templates for faster creation
  - Multiple locations per event
  - Multiple roles for invitees
  - Event status (draft, scheduled, completed, cancelled)
  - Cancel individual occurrences of recurring events
  - Cost distribution (equal split or manual per invitee)

- **Calendar Features**
  - Month view
  - Week view
  - List view
  - Auto-scheduling based on availability
  - Google Calendar import/export (UI ready)

- **Social Features**
  - Friend management with groups
  - Block/unblock users
  - Event invitations with roles
  - Chat system (event chats and direct messages)

- **Budget Management**
  - Monthly budget tracking
  - Event cost allocation
  - Budget limits and spending overview

- **Notifications**
  - Real-time notifications for:
    - New event invites
    - Event updates
    - Event cancellations
    - Chat messages
  - Notification preferences

- **Multi-language Support**
  - English (EN)
  - French (FR)
  - Easy language switching

- **Activity Proposals**
  - Auto-propose activities based on preferences
  - Activity templates

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login.component.ts
│   │   │   └── register.component.ts
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts
│   │   ├── events/
│   │   │   ├── event-list.component.ts
│   │   │   └── event-form.component.ts
│   │   └── calendar/
│   │       └── calendar.component.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── event.model.ts
│   │   ├── chat.model.ts
│   │   ├── notification.model.ts
│   │   ├── budget.model.ts
│   │   ├── friend.model.ts
│   │   └── calendar.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── chat.service.ts
│   │   ├── notification.service.ts
│   │   ├── budget.service.ts
│   │   ├── friend.service.ts
│   │   └── user.service.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.ts
│   ├── app.html
│   └── app.scss
├── firebase.ts
├── firebase.secret.ts (you need to create this)
└── assets/
    └── i18n/
        ├── en.json
        └── fr.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure Firebase:**
Create `src/firebase.secret.ts` with your Firebase configuration:
```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. **Set up Firebase Firestore Collections:**
The app expects the following Firestore collections:
- `users` - User profiles
- `events` - Events
- `eventTemplates` - Event templates
- `chats` - Event chats
- `directChats` - Direct messages
- `notifications` - User notifications
- `budgets` - Monthly budgets
- `friends` - Friend relationships
- `friendGroups` - Friend groups

4. **Run the development server:**
```bash
npm start
```

Navigate to `http://localhost:4200/`

## 🎨 Theme

The application uses a light blue color palette:
- Primary: #1976d2 (Blue)
- Primary Light: #42a5f5 (Light Blue)
- Primary Dark: #1565c0 (Dark Blue)
- Background: #f5f5f5 (Light Gray)
- Surface: #ffffff (White)

## 🌍 Internationalization

The app supports English and French. Switch languages using the language selector in the sidebar.

Translation files are located in:
- `public/assets/i18n/en.json`
- `public/assets/i18n/fr.json`

## 📱 Features Not Yet Fully Implemented

The following features have UI and services ready but may need additional implementation:
- Google Calendar sync (requires Google API setup)
- Push notifications (requires Firebase Cloud Messaging setup)
- Activity auto-proposals (AI integration needed)
- Auto-scheduling algorithm (needs calendar availability analysis)

## 🔒 Security Rules

Remember to set up proper Firebase Security Rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
    
    // Add more rules for other collections
  }
}
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Developer Notes

- The app uses standalone components (Angular 21+)
- Services use RxJS Observables for reactive data flow
- Firebase Firestore for real-time data synchronization
- Responsive design with mobile-friendly sidebar

## 🚀 Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📧 Contact

For questions or support, please open an issue in the repository.
