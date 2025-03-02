import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IUser } from '../types/User';
import { AuthService } from './auth.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../shared/css/input.css'],
  standalone: true,
})
export class LoginComponent {
  errorMessage = '';
  form = new FormGroup({
    login: new FormControl('', {
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  constructor(private authService: AuthService) {}

  get loginIsInvalid() {
    return (
      this.form.controls.login.touched &&
      this.form.controls.login.invalid &&
      this.form.controls.login.dirty
    );
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.invalid &&
      this.form.controls.password.dirty
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage = 'Login and password are required';
      return;
    }

    const enteredData: IUser = {
      username: this.form.value.login as string,
      password: this.form.value.password as string,
    };

    this.authService.login(enteredData).subscribe({
      next: () => this.errorMessage = '',
      error: () => this.errorMessage = 'Failed to login. Try again.',
    });
  }
}
