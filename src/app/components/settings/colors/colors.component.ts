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

  ngOnInit(): void {
    const root = document.documentElement;

    for (let i = 1; i <= 20; i++) {
      const value = getComputedStyle(root)
        .getPropertyValue(`--accent-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorName = i.toString().padStart(2, '0');
      this.accentColors.push({ color: value, name: colorName });
    }

    for (let i = 1; i <= 20; i++) {
      const value = getComputedStyle(root)
        .getPropertyValue(`--burgund-color-${i.toString().padStart(2, '0')}`)
        .trim();
      const colorName = i.toString().padStart(2, '0');
      this.burgundColors.push({ color: value, name: colorName });
    }
  }
}
