import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './login/auth.service';
import { MenuComponent } from './components/menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  user = computed(() => this.authService.user());
  auth = () => this.authService.isAuthenticated();


  constructor(private authService: AuthService) {}

}
