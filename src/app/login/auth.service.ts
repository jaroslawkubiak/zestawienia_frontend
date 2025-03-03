import { Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../services/api.service';
import { IUser } from './User';
import { Router } from '@angular/router';
import { ILoggedUser } from './LoggedUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<string | null>(null);
  //TODO remove temporary token
  authorizationToken: string | null = 'TEMORARY_TOKEN';

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
    //TODO fix this
    return true;

    // temporary solution
    // this.authorizationToken = localStorage.getItem('access_token');
    // if (this.user() && !!this.authorizationToken) {
    //   return true;
    // }

    // return false;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
