import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationService } from '../../../services/notification.service';
import { SettingsService } from '../settings.service';
import { DbSettings } from '../types/IDbSettings';

@Component({
  selector: 'app-db-settings',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './db-settings.component.html',
  styleUrl: './db-settings.component.css',
})
export class DbSettingsComponent {
  form!: FormGroup;
  settingList!: DbSettings[];
  formReady = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.settingsService.findAll().subscribe({
      next: (response: DbSettings[]) => {
        this.settingList = response;
        this.buildForm(response);
        this.formReady = true;
      },
    });
  }

  private buildForm(settings: DbSettings[]) {
    const group: Record<string, any> = {};
    settings.forEach((setting) => {
      const validators = [Validators.required];

      // add validator depending on field type
      switch (setting.type) {
        case 'email':
          validators.push(Validators.email);
          break;
        case 'number':
          validators.push(Validators.pattern(/^\d+$/));
          break;
        case 'boolean':
          validators.push(this.booleanStringValidator);
          break;
        case 'string':
        default:
          validators.push(Validators.maxLength(150));
          break;
      }

      group[setting.name] = [setting.value ?? '', validators];
    });

    this.form = this.fb.group(group);
  }

  private booleanStringValidator(control: AbstractControl) {
    const val = control.value;

    if (val === null || val === undefined || val === '') {
      return null;
    }

    if (val === 'true' || val === 'false') {
      return null;
    }

    return { booleanString: true };
  }

  getFieldErrors(name: string) {
    const control = this.form.get(name);
    if (!control || !control.errors || !control.touched) {
      return [];
    }

    const errors = [];
    if (control.errors['required']) {
      errors.push('Pole jest wymagane.');
    }
    if (control.errors['email']) {
      errors.push('Nieprawidłowy adres email.');
    }
    if (control.errors['pattern']) {
      errors.push('Nieprawidłowy format liczby.');
    }
    if (control.errors['booleanString']) {
      errors.push('Pole musi być "true" lub "false".');
    }
    if (control.errors['maxlength']) {
      errors.push(
        `Maksymalna długość to ${control.errors['maxlength'].requiredLength} znaków.`,
      );
    }

    return errors;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const formValue = this.form.value;

    const payload: DbSettings[] = this.settingList.map((setting) => ({
      id: setting.id,
      name: setting.name,
      type: setting.type,
      value: formValue[setting.name],
    }));

    this.settingsService.saveSettings(payload).subscribe({
      next: (response) => {
        this.notificationService.showNotification('success', response?.message);
      },
      error: (error) => {
        this.notificationService.showNotification('error', error?.message);
      },
    });
  }
}
