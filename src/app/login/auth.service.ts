import { Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { IUser } from './User';
import { Router } from '@angular/router';
import { ILoggedUser } from './ILoggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);
  //TODO remove temporary token TEMP_TOKEN
  authorizationToken: string | null = 'TEMP_TOKEN';

  constructor(private apiService: ApiService, private router: Router) {}

  login(enteredData: IUser): Observable<ILoggedUser> {
    return this.apiService.logUser(enteredData).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('user_name', response.name);
        localStorage.setItem('user_id', String(response.id));
        this.user.set(response.name); // Ustawienie użytkownika
        this.router.navigate(['/welcome']);
      }),
      catchError((error) => {
        return throwError(() => new Error('Błędne dane logowania'));
      })
    );
  }

  isAuthenticated(): boolean {
    //TODO use for deveelopment
    return true;

    this.authorizationToken = localStorage.getItem('access_token');
    if (this.user() && !!this.authorizationToken) {
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
