import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { ConfirmationModalService } from '../services/confirmation.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService,
    private confirmationModalService: ConfirmationModalService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/login')) {
          const confirmMessage = {
            message: 'Twoja sesja wygasła. Zaloguj się ponownie',
            header: 'Wylogowano',
            acceptLabel: 'Powrót do strony logowania',
            rejectVisible: false,
            acceptIcon: 'pi pi-sign-out',
            accept: () => this.authService.logout(),
          };
          this.confirmationModalService.showConfirmation(confirmMessage);
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
