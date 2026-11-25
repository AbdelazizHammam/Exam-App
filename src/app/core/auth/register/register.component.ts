import { Component, inject, OnInit, signal } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth.service';

import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, LeftContentComponent, InputComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Signals
  isLoading = signal(false);
  msgError = signal('');
  currentStep = signal(1);

  registerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  // Initialize Form
  initForm(): void {
    this.registerForm = this.fb.group(
      {
        // Step 1: Email
        email: [null, [Validators.required, Validators.email]],

        // Step 2: OTP
        code: [null, [Validators.required]],

        // Step 3: Personal Information
        username: [null, [Validators.required]],

        firstName: [null, [Validators.required]],

        lastName: [null, [Validators.required]],

        phone: [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],

        // Step 4: Password
        password: [
          null,
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            ),
          ],
        ],

        rePassword: [null, [Validators.required]],
      },
      {
        validators: this.confirmPassword,
      },
    );
  }

  // Check Password and Confirm Password
  confirmPassword(group: AbstractControl) {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;

    if (!password || !rePassword) {
      return null;
    }

    return password === rePassword ? null : { mismatch: true };
  }

  // Handle Steps
  handleSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.msgError.set('');

    switch (this.currentStep()) {
      // Step 1
      case 1:
        this.sendVerificationCode();
        break;

      // Step 2
      case 2:
        this.confirmVerificationCode();
        break;

      // Step 3
      case 3:
        this.validatePersonalInformation();
        break;

      // Step 4
      case 4:
        this.submitRegister();
        break;
    }
  }

  // Step 1: Send Email Verification Code
  sendVerificationCode(): void {
    const emailControl = this.registerForm.get('email');

    if (emailControl?.invalid) {
      emailControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);

    const data = {
      email: emailControl?.value,
    };

    this.authService.verifyEmail(data).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.currentStep.set(2);
      },

      error: (err) => {
        this.isLoading.set(false);

        this.msgError.set(err.error?.message || 'Failed to send verification code.');
      },
    });
  }

  // Step 2: Confirm OTP
  confirmVerificationCode(): void {
    const codeControl = this.registerForm.get('code');

    if (codeControl?.invalid) {
      codeControl.markAsTouched();
      return;
    }

    this.isLoading.set(true);

    const data = {
      email: this.registerForm.get('email')?.value,
      code: codeControl?.value,
    };

    this.authService.confirmEmail(data).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.currentStep.set(3);
      },

      error: (err) => {
        this.isLoading.set(false);

        this.msgError.set(err.error?.message || 'Invalid verification code.');
      },
    });
  }

  // Step 3: Validate Personal Information
  validatePersonalInformation(): void {
    const fields = ['username', 'firstName', 'lastName', 'phone'];

    let isValid = true;

    fields.forEach((field) => {
      const control = this.registerForm.get(field);

      if (control?.invalid) {
        control.markAsTouched();

        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    // Move to Password Step
    this.currentStep.set(4);
  }

  // Step 4: Register
  submitRegister(): void {
    const passwordControl = this.registerForm.get('password');
    const rePasswordControl = this.registerForm.get('rePassword');

    // Validate Password Fields
    if (passwordControl?.invalid || rePasswordControl?.invalid) {
      passwordControl?.markAsTouched();
      rePasswordControl?.markAsTouched();

      return;
    }

    // Check Password Match
    if (this.registerForm.hasError('mismatch')) {
      rePasswordControl?.markAsTouched();

      return;
    }

    this.isLoading.set(true);

    const formData = {
      username: this.registerForm.get('username')?.value,

      email: this.registerForm.get('email')?.value,

      password: passwordControl?.value,

      confirmPassword: rePasswordControl?.value,

      firstName: this.registerForm.get('firstName')?.value,

      lastName: this.registerForm.get('lastName')?.value,

      phone: this.registerForm.get('phone')?.value,
    };

    this.authService.registerForm(formData).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.msgError.set('');

        this.router.navigate(['/login']);
      },

      error: (err) => {
        this.isLoading.set(false);

        this.msgError.set(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
