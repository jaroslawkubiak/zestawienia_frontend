import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Material from '@primeng/themes/material';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { ClientsService } from './components/clients/clients.service';
import { EditSetService } from './components/sets/edit-set/edit-set.service';
import { SetsService } from './components/sets/sets.service';
import { SuppliersService } from './components/suppliers/suppliers.service';
import { initializeApp } from './core/app-initializer';
import { AuthInterceptor } from './interceptors/auth.service';
import { AuthService } from './login/auth.service';
import { NotificationService } from './services/notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true,
    },
    MessageService,
    ConfirmationService,
    NotificationService,
    SuppliersService,
    ClientsService,
    SetsService,
    ConfirmationService,
    EditSetService,
    SuppliersService,
    AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      inputVariant: 'filled',
      theme: {
        preset: Material,
        options: {
          prefix: 'p',
          darkModeSelector: '',
          cssLayer: false,
        },
      },
      ripple: true,
    }),
    provideAnimationsAsync(),
  ],
};
