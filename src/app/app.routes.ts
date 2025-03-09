import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { UstawieniaComponent } from './components/ustawienia/ustawienia.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ZestawieniaComponent } from './components/zestawienia/zestawienia.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProduktyComponent } from './components/produkty/produkty.component';
import { ClientsComponent } from './components/clients/clients.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';

//TODO add /login as default
export const routes: Routes = [
  { path: '', redirectTo: '/klienci', pathMatch: 'full' },
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
    path: 'zestawienia',
    component: ZestawieniaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'produkty',
    component: ProduktyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dostawcy',
    component: SuppliersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'klienci',
    component: ClientsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'ustawienia',
    component: UstawieniaComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/notfound' },
];
