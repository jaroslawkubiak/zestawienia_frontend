import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { EditSetComponent } from './components/sets/edit-set/edit-set.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { SetsComponent } from './components/sets/sets.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { UiCheckComponent } from './misc/ui-check/ui-check.component';
import { NotificationComponent } from './misc/notification/notification.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sets',
    component: SetsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sets/new',
    component: NewSetComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sets/:id',
    component: EditSetComponent,
    canActivate: [AuthGuard],
    canDeactivate: [UnsavedChangesGuard],
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'suppliers',
    component: SuppliersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'clients',
    component: ClientsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings/ui-check',
    component: UiCheckComponent,
  },
  {
    path: 'settings/notification',
    component: NotificationComponent,
  },
  { path: '**', redirectTo: '/notfound' },
];
