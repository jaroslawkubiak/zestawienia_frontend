import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MenuComponent } from './components/menu/menu.component';
import { AuthService } from './login/auth.service';
import { ConfirmationModalService } from './services/confirmation.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [MenuComponent, RouterOutlet, ConfirmDialog, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    './shared/css/basic.css',
    './shared/css/p-toast.css',
    './shared/css/theme.css',
  ],
  standalone: true,
  providers: [ConfirmationModalService],
})
export class AppComponent {
  userName = () => this.authService.getUserName();
  auth = () => this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}
}
