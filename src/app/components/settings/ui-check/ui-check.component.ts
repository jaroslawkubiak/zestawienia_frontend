import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TBadgeSeverity } from '../../sets/action-btns/types/badgeSeverity.type';
import { TButtonSeverity } from '../types/TButtonSeverity';

type badgeListOption = {
  severity: TBadgeSeverity;
  value: number;
};

type buttonListOption = {
  severity: TButtonSeverity;
  icon: string;
};

@Component({
  selector: 'app-ui-check',
  imports: [ButtonModule, BadgeModule, CommonModule],
  templateUrl: './ui-check.component.html',
  styleUrl: './ui-check.component.css',
})
export class UiCheckComponent {
  badgeList: badgeListOption[] = [
    {
      severity: 'contrast',
      value: 16,
    },
    {
      severity: 'secondary',
      value: 44,
    },
    {
      severity: 'success',
      value: 63,
    },
    {
      severity: 'info',
      value: 14,
    },
    {
      severity: 'warn',
      value: 1,
    },
    {
      severity: 'danger',
      value: 55,
    },
  ];

  buttonList: buttonListOption[] = [
    {
      severity: 'primary',
      icon: 'pi-star-fill',
    },
    {
      severity: 'secondary',
      icon: 'pi-trash',
    },
    {
      severity: 'danger',
      icon: 'pi-bolt',
    },
    {
      severity: 'info',
      icon: 'pi-info',
    },
    {
      severity: 'help',
      icon: 'pi-question',
    },
    {
      severity: 'warn',
      icon: 'pi-exclamation-triangle',
    },
    {
      severity: 'contrast',
      icon: 'pi-times',
    },
    {
      severity: 'success',
      icon: 'pi-check',
    },
  ];
}
