import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { AuthService } from './login/auth.service';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    './shared/css/basic.css',
    './shared/css/p-toast.css',
    './shared/css/theme.css',
  ],
  standalone: true,
})
export class AppComponent {
  userName = () => this.authService.getUserName();
  auth = () => this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}
}
