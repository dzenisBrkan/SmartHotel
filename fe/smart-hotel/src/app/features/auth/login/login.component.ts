import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'sh-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-visual" aria-hidden="true">
        <div class="visual-overlay"></div>
        <div class="visual-content">
          <h1 class="visual-title">Welcome Back</h1>
          <p class="visual-subtitle">Experience luxury, redefined.</p>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-form-wrap">
          <a routerLink="/" class="auth-logo">
            <span>🏨</span> SmartHotel
          </a>

          <h2 class="auth-title">Sign in to your account</h2>
          <p class="auth-subtitle">Welcome back! Please enter your details.</p>

          @if (errorMsg()) {
            <div class="auth-error" role="alert">{{ errorMsg() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-field">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                type="text"
                class="input-base"
                formControlName="korisnickoIme"
                placeholder="Enter your username"
                autocomplete="username"
                [attr.aria-invalid]="isInvalid('korisnickoIme')"
              />
              @if (isInvalid('korisnickoIme')) {
                <p class="field-error" role="alert">Username is required</p>
              }
            </div>

            <div class="form-field">
              <div class="label-row">
                <label for="password" class="form-label">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="input-base"
                  formControlName="lozinka"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  [attr.aria-invalid]="isInvalid('lozinka')"
                />
                <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (isInvalid('lozinka')) {
                <p class="field-error" role="alert">Password is required</p>
              }
            </div>

            <sh-button
              type="submit"
              [loading]="loading()"
              [disabled]="form.invalid"
              [fullWidth]="true"
              size="lg"
            >
              Sign In
            </sh-button>
          </form>

          <p class="auth-switch">
            Don't have an account?
            <a routerLink="/auth/register" class="auth-switch-link">Create one free</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex;
    }
    .auth-visual {
      flex: 1;
      background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200') center/cover;
      position: relative;
      @media (max-width: 768px) { display: none; }
    }
    .visual-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgb(37 80 245 / 0.7), rgb(20 41 112 / 0.8));
    }
    .visual-content {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; padding: 2rem; color: white;
    }
    .visual-title {
      font-family: var(--font-display); font-size: 3rem; font-weight: 700;
      margin-bottom: 1rem; text-shadow: 0 2px 4px rgb(0 0 0 / 0.3);
    }
    .visual-subtitle { font-size: 1.25rem; opacity: 0.9; }
    .auth-panel {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      background: var(--bg-page);
      @media (max-width: 768px) { width: 100%; }
    }
    .auth-form-wrap { width: 100%; max-width: 380px; }
    .auth-logo {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-family: var(--font-display); font-weight: 700; font-size: 1.25rem;
      color: var(--text-primary); text-decoration: none; margin-bottom: 2rem;
    }
    .auth-title {
      font-family: var(--font-display); font-size: 1.75rem; font-weight: 700;
      color: var(--text-primary); margin-bottom: 0.5rem;
    }
    .auth-subtitle { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: 1.75rem; }
    .auth-error {
      background: var(--color-danger-light); color: #991b1b;
      border: 1px solid #fca5a5; border-radius: var(--radius-md);
      padding: 0.75rem 1rem; font-size: var(--text-sm);
      margin-bottom: 1.25rem;
    }
    .form-field { margin-bottom: 1.25rem; }
    .form-label {
      display: block; font-size: var(--text-sm); font-weight: 600;
      color: var(--text-primary); margin-bottom: 0.5rem;
    }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .forgot-link { font-size: var(--text-xs); color: var(--color-primary-500); text-decoration: none; font-weight: 500; &:hover { text-decoration: underline; } }
    .input-wrapper { position: relative; }
    .input-wrapper .input-base { padding-right: 2.75rem; }
    .password-toggle {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem;
      color: var(--text-muted); padding: 2px;
    }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
    .auth-switch {
      text-align: center; margin-top: 1.5rem;
      font-size: var(--text-sm); color: var(--text-secondary);
    }
    .auth-switch-link { color: var(--color-primary-500); font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    korisnickoIme: ['', Validators.required],
    lozinka: ['', Validators.required],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.toast.success('Welcome back!', `Hello, ${res.user?.ime}`);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg.set(res.message ?? 'Login failed. Please try again.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Invalid credentials. Please check your username and password.');
      },
    });
  }
}
