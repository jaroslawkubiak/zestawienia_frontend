import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductsComponent } from './components/products/products.component';
import { NewSetComponent } from './components/sets/new-set/new-set.component';
import { SetComponent } from './components/sets/set/set.component';
import { SetsComponent } from './components/sets/sests.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';

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
    component: SetComponent,
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
