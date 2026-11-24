import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [LeftContentComponent, ReactiveFormsModule, InputComponent, RouterLink],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
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
      email: [null, [Validators.required, Validators.email]],

      password: [
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

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authService.loginForm(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.message === 'success') {
            this.msgError.set('');
            if (isPlatformBrowser(this.id)) {
              localStorage.setItem('token', res.token);
            }
            // nav to login

              this.router.navigate(['/home']);

          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.msgError.set(err.error.message);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
