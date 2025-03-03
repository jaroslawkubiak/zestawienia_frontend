import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should mark login field as invalid when empty', () => {
    const loginControl = component.form.controls.login;
    loginControl.markAsTouched();
    loginControl.markAsDirty();
    fixture.detectChanges();

    expect(component.loginIsInvalid).toBeTrue();
  });

  it('should mark password field as invalid when empty', () => {
    const passwordControl = component.form.controls.password;
    passwordControl.markAsTouched();
    passwordControl.markAsDirty();
    fixture.detectChanges();

    expect(component.passwordIsInvalid).toBeTrue();
  });

  it('should have a valid form when login and password are set', () => {
    component.form.controls.login.setValue('testuser');
    component.form.controls.password.setValue('password123');
    expect(component.form.valid).toBeTrue();
  });

  it('should display error message when form is invalid and submitted', () => {
    component.onSubmit();
    expect(component.errorMessage).toBe('Login and password are required');
  });

  it('should call AuthService.login() when form is valid', () => {
    component.form.controls.login.setValue('admin');
    component.form.controls.password.setValue('123');

    authServiceSpy.login.and.returnValue(
      of({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzQxMDE4ODEwLCJleHAiOjE3NDEwMjI0MTB9.taFAhkrrv9FTzE8SeVmmh2PL8XUKBbSGe8e2TxHOr0Y',
        name: 'Jarek',
      })
    );

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'admin',
      password: '123',
    });
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage when login fails', () => {
    component.form.controls.login.setValue('testuser');
    component.form.controls.password.setValue('password123');

    authServiceSpy.login.and.returnValue(
      throwError(() => new Error('Login failed'))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('Failed to login. Try again.');
  });
});
