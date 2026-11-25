import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: { loginForm: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = {
      loginForm: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store the token and navigate on successful login', () => {
    authService.loginForm.mockReturnValue(of({ token: 'test-token' }));
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.loginForm.setValue({
      username: ' test-user ',
      password: 'password',
    });

    component.submitForm();

    expect(authService.loginForm).toHaveBeenCalledWith({
      username: 'test-user',
      password: 'password',
    });
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show a fallback message when login fails', () => {
    authService.loginForm.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid username or password.' } })),
    );
    component.loginForm.setValue({
      username: 'test-user',
      password: 'wrong-password',
    });

    component.submitForm();

    expect(component.msgError()).toBe('Invalid username or password.');
    expect(component.isLoading()).toBe(false);
  });
});
