import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { ImageService } from './image.service';
import { SoundService } from '../../../services/sound.service';
import { SoundType } from '../../../services/types/SoundType';

@Component({
  selector: 'app-image-clipboard-input',
  templateUrl: './image-clipboard-input.component.html',
  styleUrls: ['./image-clipboard-input.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ImageClipboardInputComponent {
  @Input() imageUpload: (imageName: string, positionId: string) => void =
    () => {};
  @Input() imagePreview: string | null = null;
  public imageFile: File | null = null;
  @Input() onPasting = false;
  @Input() setId!: number;
  @Input() positionId!: number;
  @Output() blur = new EventEmitter<Event>();
  constructor(
    private notificationService: NotificationService,
    private imageService: ImageService,
    private soundService: SoundService
  ) {}

  onPaste(event: ClipboardEvent): void {
    const clipboardItem = event.clipboardData?.items[0];

    if (clipboardItem?.type.indexOf('image') === 0) {
      const file = clipboardItem.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imagePreview = reader.result as string;
          this.imageFile = file;
          this.onSubmit();
        };
        this.soundService.playSound(SoundType.screenshot);

        reader.readAsDataURL(file);
      }
    }
  }

  uploadImage(): Observable<any> {
    const formData = new FormData();
    if (this.imageFile) {
      formData.append('image', this.imageFile, this.imageFile.name);
    }

    return this.imageService.saveImage(this.setId, this.positionId, formData);
  }

  onSubmit() {
    this.uploadImage().subscribe({
      next: (response) => {
        if (this.imageUpload) {
          this.imageUpload(response.filename, response.positionId);
        }

        this.notificationService.showNotification(
          'info',
          response.message || 'Obraz został wysłany'
        );
      },
      error: (error) => {
        this.notificationService.showNotification('error', error.message);
      },
    });
  }
}
