import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMenu } from '../menu/IMenu';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  imports: [RouterLink, CommonModule],
})
export class SettingsComponent {
  page: string = '';

  settingList: IMenu[] = [
    {
      name: 'UI Check',
      route: '/settings/ui-check',
      icon: 'pi-sparkles',
    },
    {
      name: 'Notification',
      route: '/settings/notification',
      icon: 'pi-bell',
    },
  ];
}
