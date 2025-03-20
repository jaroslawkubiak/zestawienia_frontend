import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageService } from './image.service';
import { AuthService } from '../../../login/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { notificationLifeTime } from '../../../shared/constans';

@Component({
  selector: 'app-image-clipboard-input',
  templateUrl: './image-clipboard-input.component.html',
  styleUrls: ['./image-clipboard-input.component.css'],
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
})
export class ImageClipboardInputComponent {
  private authorizationToken: string | null;
  userId: number;
  @Input() imagePreview: string | null = null;
  public imageFile: File | null = null;
  @Input() setId! : number;
  @Input() positionId! : number;
  constructor(
    private authService: AuthService,
    private messageService: MessageService,
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
      formData,
    );
  }

  onSubmit() {
    this.uploadImage().subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Sukces',
          detail: response.message || 'Obraz został wysłany',
          life: notificationLifeTime,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: error.message,
          life: notificationLifeTime,
        });
      },
    });
  }
}
