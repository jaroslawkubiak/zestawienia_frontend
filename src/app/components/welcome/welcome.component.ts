import { Component, computed } from '@angular/core';
import { AuthService } from '../../login/auth.service';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  constructor(private authService: AuthService) {}

  user = computed(() => this.authService.user());
}
