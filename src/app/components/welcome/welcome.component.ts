import { Component, computed } from '@angular/core';
import { AuthService } from '../../login/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  imports: [],
})
export class WelcomeComponent {
  constructor(private authService: AuthService) {}

  user = computed(() => this.authService.user());
}
