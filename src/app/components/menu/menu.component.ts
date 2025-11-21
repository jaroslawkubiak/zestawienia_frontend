import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../login/auth.service';
import { IMenu } from './IMenu';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive],
})
export class MenuComponent {
  userlabel = () => this.authService.getUserName();
  userRole = () => this.authService.getUserRole();

  menuItems: IMenu[] = [
    {
      label: 'Zestawienia',
      routerLink: '/sets',
      icon: 'pi-list',
    },
    {
      label: 'Klienci',
      routerLink: '/clients',
      icon: 'pi-user',
    },
    {
      label: 'Dostawcy',
      routerLink: '/suppliers',
      icon: 'pi-truck',
    },
    {
      label: 'Wysłane e-maile',
      routerLink: '/emails',
      icon: 'pi-envelope',
    },
    {
      label: 'Ustawienia',
      routerLink: '/settings',
      icon: 'pi-cog',
    },
  ];

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
