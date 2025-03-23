import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
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
import { AuthService } from './login/auth.service';
import { NotificationService } from './services/notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
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
      },
      ripple: true,
    }),
    provideAnimationsAsync(),
  ],
};
