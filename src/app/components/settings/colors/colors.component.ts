import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-colors',
  imports: [CommonModule],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.css',
})
export class ColorsComponent implements OnInit {
  accentColors: { color: string; name: string }[] = [];
  burgundColors: { color: string; name: string }[] = [];
  neutralColors: { color: string; name: string }[] = [];

  ngOnInit(): void {
    const root = document.documentElement;

    for (let i = 1; i <= 20; i++) {
      const valueAccent = getComputedStyle(root)
        .getPropertyValue(`--accent-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorNameAccent = i.toString().padStart(2, '0');
      this.accentColors.push({ color: valueAccent, name: colorNameAccent });

      const valueBurgund = getComputedStyle(root)
        .getPropertyValue(`--burgund-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorNameBurgund = i.toString().padStart(2, '0');
      this.burgundColors.push({ color: valueBurgund, name: colorNameBurgund });
    }

    for (let i = 1; i <= 10; i++) {
      const value = getComputedStyle(root)
        .getPropertyValue(`--neutral-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorName = i.toString().padStart(2, '0');
      this.neutralColors.push({ color: value, name: colorName });
    }
  }
}
