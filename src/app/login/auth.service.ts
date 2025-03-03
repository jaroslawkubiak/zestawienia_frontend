import { Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { IUser } from '../types/User';
import { Router } from '@angular/router';
import { ILoggedUser } from '../types/LoggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);

  constructor(private apiService: ApiService, private router: Router) {}

  login(enteredData: IUser): Observable<ILoggedUser> {
    return this.apiService.logUser(enteredData).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('user_name', response.name);
        this.user.set(response.name); // Ustawienie użytkownika
        this.router.navigate(['/welcome']);
      }),
      catchError((error) => {
        return throwError(() => new Error('Błędne dane logowania'));
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (this.user() && !!token) {
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
