import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SettingsService } from '../settings.service';
import { IChangePassword } from '../types/IChangePassword';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../login/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-password-change',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.css',
})
export class PasswordChangeComponent {
  form: FormGroup;
  userId = () => this.authService.getUserId();

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notificationService: NotificationService,

    private authService: AuthService
  ) {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(3)]],
        repeatPassword: ['', [Validators.required, Validators.minLength(3)]],
      },
      { validators: [PasswordChangeComponent.matchPasswords] }
    );
  }

  static matchPasswords(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('newPassword')?.value;
    const repeat = group.get('repeatPassword')?.value;
    if (newPass && repeat && newPass !== repeat) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  get currentPassword() {
    return this.form.get('currentPassword');
  }
  get newPassword() {
    return this.form.get('newPassword');
  }
  get repeatPassword() {
    return this.form.get('repeatPassword');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: IChangePassword = {
      userId: this.userId(),
      currentPassword: this.currentPassword?.value,
      newPassword: this.newPassword?.value,
    };

    this.settingsService.changePassword(payload).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'success',
          'Hasło zostało zmienione'
        );
      },
      error: (error) => {
        this.notificationService.showNotification('error', error.message);
      },
    });
  }
}
