import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form = new FormGroup({
    login: new FormControl('', {
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });
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
    const enteredLogin = this.form.value.login;
    const enteredPassword = this.form.value.password;

    console.log(`##### credentials #####`);
    console.log(enteredLogin);
    console.log(enteredPassword);
  }
}
