import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { firebase } from '../../firebase';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = firebase.auth;
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$: Observable<FirebaseUser | null> = this.currentUserSubject.asObservable();
  
  private authStateInitializedSubject = new ReplaySubject<boolean>(1);
  public authStateInitialized$: Observable<boolean> = this.authStateInitializedSubject.asObservable();
  public isAuthStateInitialized = false;

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (!this.isAuthStateInitialized) {
        this.isAuthStateInitialized = true;
        this.authStateInitializedSubject.next(true);
      }
    });
  }

  async login(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  async register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  }

  async loginWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
