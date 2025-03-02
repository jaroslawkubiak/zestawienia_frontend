import { Component, computed } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from './login/auth.service';

@Component({
  selector: 'app-root',
  imports: [LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {
  title = 'zestawienia';
  user = computed(() => this.authService.user());

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
