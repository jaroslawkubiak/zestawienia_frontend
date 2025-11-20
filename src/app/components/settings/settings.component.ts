import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../login/auth.service';
import { IMenu } from '../menu/IMenu';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  imports: [RouterLink, CommonModule, RouterOutlet],
})
export class SettingsComponent {
  page: string = '';
  userRole = () => this.authService.getUserRole();

  settingList: IMenu[] = [
    {
      name: 'Zmiana hasła',
      route: 'passwordChange',
      icon: 'pi-lock',
    },
    {
      name: 'UI Check',
      route: 'ui-check',
      icon: 'pi-sparkles',
      requiredRole: 'admin',
    },
    {
      name: 'Notification',
      route: 'notification',
      icon: 'pi-bell',
      requiredRole: 'admin',
    },
  ];

  constructor(private authService: AuthService) {}
}
