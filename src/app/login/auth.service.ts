import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { ILoggedUser } from './types/ILoggedUser';
import { ILoginUser } from './types/ILoginUser';
import { Role } from './types/role';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);
  userRole = signal<Role | null>(null);
  userId = signal<number | undefined>(undefined);
  authorizationToken = signal<string | null>(null);
  private silentMode: boolean = false;

  private currentUserSubject = new BehaviorSubject<ILoggedUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getAuthorizationToken(): string | null {
    return this.authorizationToken();
  }

  getUserId(): number {
    return Number(this.userId());
  }

  getUserName(): string {
    return String(this.user());
  }

  getUserRole(): Role {
    return this.userRole() ?? (null as unknown as Role);
  }

  isAuthenticated(): boolean {
    const hasUser = !!this.user();
    const hasToken = !!this.authorizationToken();
    return hasUser && hasToken;
  }

  setSilentMode(silent: boolean): void {
    this.silentMode = silent;
  }

  isSilentMode(): boolean {
    return this.silentMode;
  }

  login(enteredData: ILoginUser): Observable<ILoggedUser> {
    return this.http
      .post<ILoggedUser>(`${environment.API_URL}/auth/login`, enteredData, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.storeUserData(response)),
        catchError((err) => {
          // BACKEND MESSAGE
          const backendMsg =
            err?.error?.message ||
            err?.error?.error ||
            'Błędne dane logowania. Spróbuj ponownie.';

          return throwError(() => new Error(backendMsg));
        })
      );
  }

  private storeUserData(response: ILoggedUser): void {
    this.authorizationToken.set(response.accessToken);
    this.user.set(response.name);
    this.userId.set(response.id);
    this.userRole.set(response.role);

    this.router.navigate(['/welcome']);
  }

  logout(): void {
    this.user.set(null);
    this.userId.set(undefined);
    this.authorizationToken.set(null);
    this.userRole.set(null);
    this.currentUserSubject.next(null);

    this.http
      .post(`${environment.API_URL}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {},
        error: () => {},
      });

    this.router.navigate(['/login']);
  }

  loadUserFromServer(silent: boolean = false): Observable<ILoggedUser | null> {
    if (silent) this.setSilentMode(true);
    return this.http
      .get<ILoggedUser>(`${environment.API_URL}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          if (user) {
            this.currentUserSubject.next(user);
            this.authorizationToken.set(user.accessToken);
            this.user.set(user.name);
            this.userId.set(user.id);
            this.userRole.set(user.role);
          }
        }),
        catchError((error) => {
          this.currentUserSubject.next(null);
          this.authorizationToken.set(null);
          this.user.set(null);
          this.userId.set(undefined);
          this.userRole.set(null);
          return of(null);
        }),
        finalize(() => {
          if (this.silentMode) {
            this.setSilentMode(false);
          }
        })
      );
  }
}
