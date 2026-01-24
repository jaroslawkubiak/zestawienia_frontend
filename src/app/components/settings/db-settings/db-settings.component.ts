import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../services/notification.service';
import { SettingsService } from '../settings.service';
import { DbSettings } from '../types/IDbSettings';

@Component({
  selector: 'app-db-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TextareaModule,
    RadioButtonModule,
  ],
  templateUrl: './db-settings.component.html',
  styleUrl: './db-settings.component.css',
})
export class DbSettingsComponent {
  form!: FormGroup;
  settingList!: DbSettings[];
  formReady = false;

  booleanType = [
    { name: 'True', value: true },
    { name: 'False', value: false },
  ];

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
      let value: any = setting.value ?? '';

      switch (setting.type) {
        case 'email':
          validators.push(Validators.email);
          break;

        case 'number':
          validators.push(Validators.pattern(/^\d+$/));
          break;

        case 'boolean':
          value = setting.value === 'true';
          break;

        case 'textarea':
          break;

        case 'string':
        default:
          validators.push(Validators.maxLength(150));
          break;
      }

      group[setting.name] = [value, validators];
    });

    this.form = this.fb.group(group);
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

    const payload: DbSettings[] = this.settingList.map((setting) => {
      let value = this.form.value[setting.name];

      if (setting.type === 'boolean') {
        value = value ? 'true' : 'false';
      }

      return {
        id: setting.id,
        name: setting.name,
        type: setting.type,
        value,
      };
    });

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
