import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';
import { AuthService } from '../../../login/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ImageService } from './image.service';

@Component({
  selector: 'app-image-clipboard-input',
  templateUrl: './image-clipboard-input.component.html',
  styleUrls: ['./image-clipboard-input.component.css'],
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [NotificationService],
})
export class ImageClipboardInputComponent {
  private authorizationToken: string | null;
  userId: number;
  @Input() imageUpload: (imageName: string, positionId: string) => void =
    () => {};
  @Input() imagePreview: string | null = null;
  public imageFile: File | null = null;
  @Input() onPasting = false;
  @Input() setId!: number;
  @Input() positionId!: number;
  @Output() blur = new EventEmitter<Event>();
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private imageService: ImageService
  ) {
    this.authorizationToken = this.authService.authorizationToken;
    this.userId = this.authService.userId() || 1;
  }

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
        reader.readAsDataURL(file);
      }
    }
  }

  uploadImage(): Observable<any> {
    const formData = new FormData();
    if (this.imageFile) {
      formData.append('image', this.imageFile, this.imageFile.name);
    }

    return this.imageService.saveImage(
      this.userId,
      this.authorizationToken,
      this.setId,
      this.positionId,
      formData
    );
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
