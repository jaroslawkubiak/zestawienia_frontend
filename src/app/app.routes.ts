import { Routes } from '@angular/router';
import { AnkietyComponent } from './components/ankiety/ankiety.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { UstawieniaComponent } from './components/ustawienia/ustawienia.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ZestawieniaComponent } from './components/zestawienia/zestawienia.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProduktyComponent } from './components/produkty/produkty.component';
import { KlienciComponent } from './components/klienci/klienci.component';
import { DostawcyComponent } from './components/dostawcy/dostawcy.component';

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
    path: 'ankiety',
    component: AnkietyComponent,
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
    component: DostawcyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'klienci',
    component: KlienciComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'ustawienia',
    component: UstawieniaComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/notfound' },
];
