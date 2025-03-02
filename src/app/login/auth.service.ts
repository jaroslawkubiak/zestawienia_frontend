import { Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { IUser } from '../types/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  login(enteredData: IUser) {
    return this.apiService.logUser(enteredData).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('user_name', response.name);
        this.user.set(response.name); // Ustawienie użytkownika
      }),
      catchError((error) => {
        return throwError(() => new Error('Błędne dane logowania'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    this.user.set(null);
  }
}
