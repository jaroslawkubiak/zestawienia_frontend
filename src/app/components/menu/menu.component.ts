import { Component, computed, Input } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { CommonModule } from '@angular/common';
import { IMenu } from '../../types/Menu';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, ButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  menuItems: IMenu[] = [
    {
      name: 'zest',
      route: '/zestawienia',
      icon: 'pi-list',
    },
    {
      name: 'ank',
      route: '/ankiety',
      icon: 'pi-file-o',
    },
    {
      name: 'Ustawienia',
      route: '/ustawienia',
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
