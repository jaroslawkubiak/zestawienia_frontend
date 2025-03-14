import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { EditSetComponent } from './components/sets/edit-set/edit-set.component';
import { SetsComponent } from './components/sets/sets.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { UiCheckComponent } from './ui-check/ui-check.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

//TODO add /login as default path
export const routes: Routes = [
  { path: '', redirectTo: '/sets', pathMatch: 'full' },
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
  { path: '**', redirectTo: '/notfound' },
];
