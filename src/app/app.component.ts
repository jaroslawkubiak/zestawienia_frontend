import { Component, computed, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './login/auth.service';
import { MenuComponent } from './components/menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    './shared/css/basic.css',
    './shared/css/p-table.css',
    './shared/css/p-toast.css',
  ],
  standalone: true,
})
export class AppComponent {
  user = computed(() => this.authService.user());
  auth = () => this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}
}
