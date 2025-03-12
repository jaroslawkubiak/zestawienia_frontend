import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SetsComponent } from './components/sets/sests.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { ClientsComponent } from './components/clients/clients.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { SettingsComponent } from './components/settings/settings.component';

//TODO add /login as default path
export const routes: Routes = [
  { path: '', redirectTo: '/sets/new', pathMatch: 'full' },
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
  { path: '**', redirectTo: '/notfound' },
];
