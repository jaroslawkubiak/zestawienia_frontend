import { Component, computed } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { CommonModule } from '@angular/common';
import { IMenu } from './Menu';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive],
})
export class MenuComponent {
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
  user = computed(() => this.authService.user());
  userName = localStorage.getItem('user_name');
  logout() {
    this.authService.logout();
  }
}
