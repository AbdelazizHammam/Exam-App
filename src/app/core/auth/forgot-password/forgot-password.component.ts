
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [LeftContentComponent, ReactiveFormsModule, InputComponent],
  styleUrl: './forgot-password.component.css',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = signal(false);
  msgError = signal('');
  msgSuccess = signal('');

  step = signal(1);

  token = '';

  verifyEmail!: FormGroup;
  resetPassword!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    // Get reset token from email link
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token') || '';

      if (this.token) {
        this.step.set(2);
      }
    });
  }

  initForm(): void {
    this.verifyEmail = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });

    this.resetPassword = this.fb.group(
      {
        newPassword: [
          null,
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            ),
          ],
        ],
        confirmPassword: [null, [Validators.required]],
      },
      {
        validators: this.confirmPassword,
      },
    );
  }

  // Confirm password validator
  confirmPassword(group: AbstractControl) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword');

    if (!confirmPassword?.value) {
      return null;
    }

    return password === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  // Step 1: Send reset email
  formStep1(): void {
    this.msgError.set('');
    this.msgSuccess.set('');

    if (this.verifyEmail.invalid) {
      this.verifyEmail.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const data = {
      email: this.verifyEmail.value.email,
      redirectUrl: `${window.location.origin}/forgot`,
    };

    this.authService.submitVerifyEmail(data).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.msgSuccess.set(
          res.message || 'Password reset link has been sent to your email.',
        );
      },

      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(
          err.error?.message || 'Something went wrong. Please try again.',
        );
      },
    });
  }

  // Step 2: Reset password
  formStep2(): void {
    this.msgError.set('');

    if (!this.token) {
      this.msgError.set('Invalid or missing reset token.');
      return;
    }

    if (this.resetPassword.invalid) {
      this.resetPassword.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const data = {
      token: this.token,
      newPassword: this.resetPassword.value.newPassword,
      confirmPassword: this.resetPassword.value.confirmPassword,
    };

    this.authService.submitResetPassword(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },

      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(
          err.error?.message || 'Unable to reset password. Please try again.',
        );
      },
    });
  }
}
