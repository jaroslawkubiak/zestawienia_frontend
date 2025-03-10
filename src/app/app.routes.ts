import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { UstawieniaComponent } from './components/ustawienia/ustawienia.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SetsComponent } from './components/sets/sests.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { ClientsComponent } from './components/clients/clients.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';

//TODO add /login as default
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
    component: UstawieniaComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/notfound' },
];
