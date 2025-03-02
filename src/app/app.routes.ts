import { Routes } from '@angular/router';
import { AnkietyComponent } from './components/ankiety/ankiety.component';
import { ZestawieniaComponent } from './components/zestawienia/zestawienia.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'ankiety',
    component: AnkietyComponent,
  },
  {
    path: 'zestawienia',
    component: ZestawieniaComponent,
  },
];
