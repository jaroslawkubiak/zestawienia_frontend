import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { AuthService } from '../../login/auth.service';
import { IMenu } from '../menu/IMenu';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  imports: [CommonModule, RouterOutlet, RouterModule, MenuModule, Menu],
})
export class SettingsComponent implements OnInit {
  userRole = () => this.authService.getUserRole();
  items: MenuItem[] | undefined;

  ngOnInit() {
    const role = this.userRole();
    const allItems: IMenu[] = [
      {
        label: 'Zmiana hasła',
        icon: 'pi pi-lock',
        routerLink: 'passwordChange',
      },
      {
        label: 'Colors',
        icon: 'pi pi-palette',
        routerLink: 'colors',
      },
      {
        label: 'UI Check',
        icon: 'pi pi-sparkles',
        routerLink: 'ui-check',
        requiredRole: 'admin',
      },
      {
        label: 'Notification',
        icon: 'pi pi-bell',
        routerLink: 'notification',
        requiredRole: 'admin',
      },
      {
        label: 'DB Settings',
        icon: 'pi pi-database',
        routerLink: 'db-settings',
        requiredRole: 'admin',
      },
    ];

    this.items = allItems.filter(
      (item) => !item.requiredRole || item.requiredRole === role,
    );
  }
  constructor(private authService: AuthService) {}
}
