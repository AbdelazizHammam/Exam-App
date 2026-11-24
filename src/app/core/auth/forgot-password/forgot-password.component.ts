import { Router } from '@angular/router';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [LeftContentComponent, ReactiveFormsModule, InputComponent],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.component.css',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  isLoading = signal(false);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly id = inject(PLATFORM_ID);

  verifyEmail!: FormGroup;
  verifyCode!: FormGroup;
  resetPassword!: FormGroup;
  msgError = signal('');
  step = signal(1);
  ngOnInit(): void {
    this.initForm();
  }
  initForm(): void {
    this.verifyEmail = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });

    this.verifyCode = this.fb.group({
      resetCode: [null, [Validators.required]],
    });
    this.resetPassword = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      newPassword: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          ),
        ],
      ],
    });
  }
  formStep1(): void {
    this.isLoading.set(true);

    if (this.verifyEmail.valid) {
      this.authService.submitVerifyEmail(this.verifyEmail.value).subscribe({
        next: (res) => {
          this.resetPassword.patchValue({ email: this.verifyEmail.value.email });
          this.step.set(2);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);

          this.msgError.set(err.error.message);
        },
      });
    }
  }
  formStep2(): void {
    this.isLoading.set(true);

    if (this.verifyCode.valid) {
      this.authService.submitVerifyCode(this.verifyCode.value).subscribe({
        next: (res) => {
          this.isLoading.set(false);

          this.step.set(3);
        },
        error: (err) => {
          this.isLoading.set(false);

          this.msgError.set(err.error.message);
        },
      });
    }
  }
  formStep3(): void {
    this.isLoading.set(true);

    if (this.resetPassword.valid) {
      this.authService.submitResetPassword(this.resetPassword.value).subscribe({
        next: (res) => {
          if (isPlatformBrowser(this.id)) {
            localStorage.setItem('token', res.token);
          }
          this.isLoading.set(false);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading.set(false);

          this.msgError.set(err.error.message);
        },
      });
    }
  }
}
