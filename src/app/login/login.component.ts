import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ILoginUser } from './types/ILoginUser';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
      this.errorMessage = 'Login i hasło są wymagane';
      return;
    }

    const enteredData: ILoginUser = {
      username: this.form.value.login as string,
      password: this.form.value.password as string,
    };

    this.authService.login(enteredData).subscribe({
      next: () => (this.errorMessage = ''),
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }
}
