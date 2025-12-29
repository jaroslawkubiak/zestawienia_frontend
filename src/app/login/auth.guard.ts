import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (this.auth.isAuthenticated()) {
      return of(true);
    }

    return this.auth.loadUserFromServer().pipe(
      map((user) => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
