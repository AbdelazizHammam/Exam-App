import { Component, inject, PLATFORM_ID, signal, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { AuthService } from '../auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-login',
  imports: [LeftContentComponent, ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly id = inject(PLATFORM_ID);

  isLoading = signal(false);
  msgError = signal('');
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],

      password: [null, [Validators.required]],
    });
  }

  submitForm(): void {
    this.msgError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const loginData = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.loginForm(loginData).subscribe({
      next: (res) => {
        this.isLoading.set(false);

        if (isPlatformBrowser(this.id)) {
          localStorage.setItem('token', res.payload.token);
        }

        this.msgError.set('');
        this.router.navigate(['/home']);
      },

      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(err.error?.message);
      },
    });
  }
}
