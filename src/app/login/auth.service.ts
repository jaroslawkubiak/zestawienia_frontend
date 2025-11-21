import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
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

  constructor(private http: HttpClient, private router: Router) {}

  getAuthorizationToken(): string | null {
    return this.authorizationToken() || sessionStorage.getItem('access_token');
  }

  getUserId(): number {
    return Number(this.userId() ?? sessionStorage.getItem('user_id'));
  }

  getUserName(): string {
    return String(this.user() ?? sessionStorage.getItem('user_name'));
  }

  getUserRole(): Role {
    return this.userRole() ?? (sessionStorage.getItem('user_role') as Role);
  }

  isAuthenticated(): boolean {
    const token =
      this.authorizationToken() || sessionStorage.getItem('access_token');
    const user = this.user() || sessionStorage.getItem('user_name');
    return !!user && !!token;
  }

  login(enteredData: ILoginUser): Observable<ILoggedUser> {
    return this.http
      .post<ILoggedUser>(`${environment.API_URL}/auth/login`, enteredData)
      .pipe(
        tap((response) => this.storeUserData(response)),
        catchError(() =>
          throwError(
            () => new Error('Błędne dane logowania. Spróbuj ponownie.')
          )
        )
      );
  }

  private storeUserData(response: ILoggedUser): void {
    // Store the response data in signals and sessionStorage
    this.authorizationToken.set(response.accessToken);
    this.user.set(response.name);
    this.userId.set(response.id);
    this.userRole.set(response.role);

    sessionStorage.setItem('access_token', response.accessToken);
    sessionStorage.setItem('user_name', response.name);
    sessionStorage.setItem('user_role', response.role);
    sessionStorage.setItem('user_id', String(response.id));

    // Navigate to the welcome page after successful login
    this.router.navigate(['/welcome']);
  }

  logout(): void {
    // Clear all signals and sessionStorage items
    this.user.set(null);
    this.userId.set(undefined);
    this.authorizationToken.set(null);

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_role');

    // Navigate to the login page after logout
    this.router.navigate(['/login']);
  }
}
