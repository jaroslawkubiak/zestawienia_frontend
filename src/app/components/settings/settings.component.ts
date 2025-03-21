import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMenu } from '../menu/Menu';
import { CommonModule } from '@angular/common';

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
      name: 'Image clipboard',
      route: '/settings/clipboard',
      icon: 'pi-image',
    },
  ];
}
