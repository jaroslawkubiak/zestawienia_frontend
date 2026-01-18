import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { CommentsToSetComponent } from './components/comments/comments-to-set/comments-to-set.component';
import { EmailsComponent } from './components/emails/emails.component';
import { ForClientComponent } from './components/external/forclient/forclient.component';
import { ForsupplierComponent } from './components/external/forsupplier/forsupplier.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EditSetComponent } from './components/sets/edit-set/edit-set.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { SetsComponent } from './components/sets/sets.component';
import { ColorsComponent } from './components/settings/colors/colors.component';
import { DbSettingsComponent } from './components/settings/db-settings/db-settings.component';
import { NotificationComponent } from './components/settings/notification/notification.component';
import { PasswordChangeComponent } from './components/settings/password-change/password-change.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UiCheckComponent } from './components/settings/ui-check/ui-check.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';

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
      { path: 'comments/:id', component: CommentsToSetComponent },
      {
        path: ':id',
        component: EditSetComponent,
        canDeactivate: [UnsavedChangesGuard],
      },
    ],
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
    component: SettingsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'passwordChange',
        component: PasswordChangeComponent,
      },
      {
        path: 'ui-check',
        component: UiCheckComponent,
      },
      {
        path: 'notification',
        component: NotificationComponent,
      },
      {
        path: 'colors',
        component: ColorsComponent,
      },
      {
        path: 'db-settings',
        component: DbSettingsComponent,
      },
    ],
  },
  {
    path: 'open-client/:setHash/:clientHash',
    component: ForClientComponent,
  },
  {
    path: 'open-supplier/:setHash/:supplierHash',
    component: ForsupplierComponent,
  },
  { path: '**', redirectTo: '/notfound' },
];
