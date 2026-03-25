import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
type TuiColors = { color: string; name: string };
@Component({
  selector: 'app-colors',
  imports: [CommonModule],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.css',
})
export class ColorsComponent implements OnInit {
  accentColors: TuiColors[] = [];
  burgundColors: TuiColors[] = [];
  neutralColors: TuiColors[] = [];
  statusColors: TuiColors[] = [];
  badgeColors: TuiColors[] = [];

  ngOnInit(): void {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    for (let i = 1; i <= 10; i++) {
      const valueAccent = styles
        .getPropertyValue(`--accent-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorNameAccent = i.toString().padStart(2, '0');
      this.accentColors.push({ color: valueAccent, name: colorNameAccent });

      const valueBurgund = styles
        .getPropertyValue(`--burgund-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorNameBurgund = i.toString().padStart(2, '0');
      this.burgundColors.push({ color: valueBurgund, name: colorNameBurgund });

      const value = styles
        .getPropertyValue(`--neutral-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorName = i.toString().padStart(2, '0');
      this.neutralColors.push({ color: value, name: colorName });
    }

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];

      if (prop.startsWith('--status-') && prop.endsWith('-color')) {
        const value = styles.getPropertyValue(prop).trim();

        this.statusColors.push({
          name: prop.replace('--status-', '').replace('-color', ''),
          color: value,
        });
      }

      if (prop.startsWith('--p-badge-') && prop.endsWith('-background')) {
        const value = styles.getPropertyValue(prop).trim();

        this.badgeColors.push({
          name: prop.replace('--p-badge-', '').replace('-background', ''),
          color: value,
        });
      }
    }
  }
}
