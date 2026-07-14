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
  selector: 'sh-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-visual" aria-hidden="true">
        <div class="visual-overlay"></div>
        <div class="visual-content">
          <h1 class="visual-title">Join SmartHotel</h1>
          <p class="visual-subtitle">Begin your luxury journey today.</p>
          <div class="perks">
            <div class="perk">✓ Exclusive member rates</div>
            <div class="perk">✓ Priority booking</div>
            <div class="perk">✓ Loyalty rewards</div>
          </div>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-form-wrap">
          <a routerLink="/" class="auth-logo">
            <span>🏨</span> SmartHotel
          </a>

          <h2 class="auth-title">Create your account</h2>
          <p class="auth-subtitle">Start your journey — free forever.</p>

          @if (errorMsg()) {
            <div class="auth-error" role="alert">{{ errorMsg() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-row">
              <div class="form-field">
                <label for="ime" class="form-label">First Name</label>
                <input id="ime" type="text" class="input-base" formControlName="ime"
                  placeholder="John" autocomplete="given-name"
                  [attr.aria-invalid]="isInvalid('ime')" />
                @if (isInvalid('ime')) { <p class="field-error">Required</p> }
              </div>
              <div class="form-field">
                <label for="prezime" class="form-label">Last Name</label>
                <input id="prezime" type="text" class="input-base" formControlName="prezime"
                  placeholder="Doe" autocomplete="family-name"
                  [attr.aria-invalid]="isInvalid('prezime')" />
                @if (isInvalid('prezime')) { <p class="field-error">Required</p> }
              </div>
            </div>

            <div class="form-field">
              <label for="email" class="form-label">Email</label>
              <input id="email" type="email" class="input-base" formControlName="email"
                placeholder="john@example.com" autocomplete="email"
                [attr.aria-invalid]="isInvalid('email')" />
              @if (isInvalid('email')) {
                <p class="field-error">
                  @if (form.get('email')?.errors?.['required']) { Email is required }
                  @else { Please enter a valid email }
                </p>
              }
            </div>

            <div class="form-field">
              <label for="korisnickoIme" class="form-label">Username</label>
              <input id="korisnickoIme" type="text" class="input-base" formControlName="korisnickoIme"
                placeholder="Choose a username" autocomplete="username"
                [attr.aria-invalid]="isInvalid('korisnickoIme')" />
              @if (isInvalid('korisnickoIme')) { <p class="field-error">Username is required (min 3 chars)</p> }
            </div>

            <div class="form-field">
              <label for="lozinka" class="form-label">Password</label>
              <div class="input-wrapper">
                <input id="lozinka" [type]="showPassword() ? 'text' : 'password'" class="input-base"
                  formControlName="lozinka" placeholder="Min. 6 characters" autocomplete="new-password"
                  [attr.aria-invalid]="isInvalid('lozinka')" />
                <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (isInvalid('lozinka')) { <p class="field-error">Password is required (min 6 chars)</p> }
            </div>

            <sh-button type="submit" [loading]="loading()" [disabled]="form.invalid" [fullWidth]="true" size="lg">
              Create Account
            </sh-button>
          </form>

          <p class="auth-switch">
            Already have an account? <a routerLink="/auth/login" class="auth-switch-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }
    .auth-visual {
      flex: 1;
      background: url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200') center/cover;
      position: relative;
      @media (max-width: 768px) { display: none; }
    }
    .visual-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgb(20 41 112 / 0.85), rgb(37 80 245 / 0.65));
    }
    .visual-content {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 2rem; color: white; gap: 1rem;
    }
    .visual-title { font-family: var(--font-display); font-size: 3rem; font-weight: 700; text-shadow: 0 2px 4px rgb(0 0 0 / 0.3); }
    .visual-subtitle { font-size: 1.25rem; opacity: 0.9; }
    .perks { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
    .perk { font-size: 1rem; opacity: 0.85; font-weight: 500; }
    .auth-panel {
      width: 520px; display: flex; align-items: center; justify-content: center;
      padding: 2rem; background: var(--bg-page);
      overflow-y: auto;
      @media (max-width: 768px) { width: 100%; }
    }
    .auth-form-wrap { width: 100%; max-width: 420px; padding-block: 1rem; }
    .auth-logo {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-family: var(--font-display); font-weight: 700; font-size: 1.25rem;
      color: var(--text-primary); text-decoration: none; margin-bottom: 1.5rem;
    }
    .auth-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
    .auth-subtitle { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: 1.5rem; }
    .auth-error {
      background: var(--color-danger-light); color: #991b1b;
      border: 1px solid #fca5a5; border-radius: var(--radius-md);
      padding: 0.75rem 1rem; font-size: var(--text-sm); margin-bottom: 1.25rem;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
    .input-wrapper { position: relative; }
    .input-wrapper .input-base { padding-right: 2.75rem; }
    .password-toggle {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-muted);
    }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
    .auth-switch { text-align: center; margin-top: 1.25rem; font-size: var(--text-sm); color: var(--text-secondary); }
    .auth-switch-link { color: var(--color-primary-500); font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    korisnickoIme: ['', [Validators.required, Validators.minLength(3)]],
    lozinka: ['', [Validators.required, Validators.minLength(6)]],
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

    this.authService.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.toast.success('Account created!', 'Please sign in with your new credentials.');
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMsg.set(res.message ?? 'Registration failed. Please try again.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Registration failed. Username or email may already be taken.');
      },
    });
  }
}
