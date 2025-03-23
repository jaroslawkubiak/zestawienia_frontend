import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../login/auth.service';
import { IMenu } from './types/IMenu';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive],
})
export class MenuComponent {
  userName = () => this.authService.getUserName();
  menuItems: IMenu[] = [
    {
      name: 'Zestawienia',
      route: '/sets',
      icon: 'pi-list',
    },
    {
      name: 'Klienci',
      route: '/clients',
      icon: 'pi-user',
    },
    {
      name: 'Dostawcy',
      route: '/suppliers',
      icon: 'pi-truck',
    },
    {
      name: 'Produkty',
      route: '/products',
      icon: 'pi-list-check',
    },
    {
      name: 'Ustawienia',
      route: '/settings',
      icon: 'pi-cog',
    },
  ];

  constructor(private authService: AuthService) {}
  logout() {
    this.authService.logout();
  }
}
