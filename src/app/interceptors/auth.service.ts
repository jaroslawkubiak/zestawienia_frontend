import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    const clonedReq = req.clone({
      withCredentials: true,
    });

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/login')) {
          const isSilent = this.authService.isSilentMode();
          this.authService.setSilentMode(false);

          // If in silent mode (app-initializer), don't show modal
          if (isSilent) {
            // Silent mode - no modal shown
          } else {
            // Otherwise show modal to user
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
        }
        return throwError(() => error);
      })
    );
  }
}
