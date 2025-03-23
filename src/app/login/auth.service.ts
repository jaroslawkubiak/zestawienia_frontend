import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ILoggedUser } from './ILoggedUser';
import { ILoginUser } from './ILoginUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);
  userId = signal<number | undefined>(undefined);
  authorizationToken = signal<string | null>(null);

  constructor(private apiService: ApiService, private router: Router) {}

  getAuthorizationToken(): string | null {
    return this.authorizationToken() || sessionStorage.getItem('access_token');
  }

  getUserId(): number | undefined {
    if (this.userId()) {
      return Number(this.userId());
    }
    if (sessionStorage.getItem('user_id')) {
      return Number(sessionStorage.getItem('user_id'));
    }

    return undefined;
  }

  getUserName(): string | null {
    return this.user() || sessionStorage.getItem('user_name');
  }

  login(enteredData: ILoginUser): Observable<ILoggedUser> {
    return this.apiService.logUser(enteredData).pipe(
      tap((response) => {
        // Store the response data in signals and sessionStorage
        this.authorizationToken.set(response.accessToken);
        this.user.set(response.name);
        this.userId.set(response.id);

        sessionStorage.setItem('access_token', response.accessToken);
        sessionStorage.setItem('user_name', response.name);
        sessionStorage.setItem('user_id', String(response.id));

        // Navigate to the welcome page after successful login
        this.router.navigate(['/welcome']);
      }),
      catchError((error) => {
        return throwError(() => new Error('Błędne dane logowania'));
      })
    );
  }

  isAuthenticated(): boolean {
    const token =
      this.authorizationToken() || sessionStorage.getItem('access_token');
    const user = this.user() || sessionStorage.getItem('user_name');
    return !!user && !!token;
  }

  logout(): void {
    // Clear all signals and sessionStorage items
    this.user.set(null);
    this.userId.set(undefined);
    this.authorizationToken.set(null);

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_id');

    // Navigate to the login page after logout
    this.router.navigate(['/login']);
  }
}
