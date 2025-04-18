import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { NewcommentsComponent } from './components/comments/newcomments/newcomments.component';
import { EmailsComponent } from './components/emails/emails.component';
import { SetforclientComponent } from './components/external/setforclient/setforclient.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { EditSetComponent } from './components/sets/edit-set/edit-set.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { SetsComponent } from './components/sets/sets.component';
import { EmailPreviewComponent } from './components/settings/email-preview/email-preview.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { NotificationComponent } from './misc/notification/notification.component';
import { UiCheckComponent } from './misc/ui-check/ui-check.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'notfound', component: NotFoundComponent },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sets',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SetsComponent },
      { path: 'new', component: NewSetComponent },
      { path: 'comments/:id', component: NewcommentsComponent },
      {
        path: ':id',
        component: EditSetComponent,
        canDeactivate: [UnsavedChangesGuard],
      },
    ],
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
    path: 'emails',
    component: EmailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SettingsComponent },
      { path: 'ui-check', component: UiCheckComponent },
      { path: 'notification', component: NotificationComponent },
      { path: 'email-preview', component: EmailPreviewComponent },
    ],
  },
  {
    path: ':id/:hash',
    component: SetforclientComponent,
  },
  { path: '**', redirectTo: '/notfound' },
];
