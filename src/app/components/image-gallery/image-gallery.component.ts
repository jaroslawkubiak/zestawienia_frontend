import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { IGalleryList } from './types/IGalleryList';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule, GalleriaModule, ImageModule, ButtonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent {
  @Input() images: IGalleryList[] = [];
  @Input() activeIndex: number = 0;
  show: boolean = false;
  displayBasic: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.displayBasic) return;

    const target = event.target as HTMLElement;

    const clickedInsideGallery =
      target.closest('.p-galleria') ||
      target.closest('.p-galleria-nav-button') ||
      target.closest('.p-galleria-close');

    if (!clickedInsideGallery) {
      this.displayBasic = false;
    }
  }

  openGallery(index: number = 0) {
    this.activeIndex = index;
    this.show = true;
    this.displayBasic = true;
  }
}
