import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { LeftContentComponent } from '../../../shared/components/left-content/left-content.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, LeftContentComponent, InputComponent, RouterLink],
  selector: 'app-register',
  styleUrl: './register.component.css',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  isLoading = signal(false);
  msgError = signal('');
  registerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }
  initForm(): void {
    this.registerForm = this.fb.group(
      {
        username: [null, [Validators.required]],
        firstName: [null, [Validators.required]],
        lastName: [null, [Validators.required]],
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
        rePassword: [null, [Validators.required]],
        phone: [null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      },
      { validators: this.confirmPassword },
    );
  }

  confirmPassword(group: AbstractControl) {
    if (group.get('password')?.value === group.get('rePassword')?.value) {
      return null;
    } else {
      group.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.authService.registerForm(this.registerForm.value).subscribe({
        next: (res) => {
          if (res.message === 'success') {
            // nav to login
            this.msgError.set('');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 200);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.msgError.set(err.error.message);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
