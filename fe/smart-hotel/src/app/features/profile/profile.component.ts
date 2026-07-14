import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { KorisnikService } from '../../core/services/korisnik.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { KorisnikDto } from '../../core/models/korisnik.models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'sh-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SkeletonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your personal information.</p>
      </div>

      @if (loading()) {
        <div class="profile-layout">
          <div class="profile-card">
            <sh-skeleton height="80px" width="80px" [rounded]="true" style="margin:0 auto 1rem"></sh-skeleton>
            <sh-skeleton height="1.25rem" width="60%" style="margin:0 auto 0.5rem"></sh-skeleton>
            <sh-skeleton height="0.875rem" width="40%" style="margin:0 auto"></sh-skeleton>
          </div>
          <div class="form-card">
            <sh-skeleton height="2rem" width="40%" style="margin-bottom:1.5rem"></sh-skeleton>
            @for (i of [1,2,3,4]; track i) {
              <sh-skeleton height="2.75rem" style="margin-bottom:1rem"></sh-skeleton>
            }
          </div>
        </div>
      } @else if (profile()) {
        <div class="profile-layout">
          <!-- Avatar card -->
          <aside class="profile-card">
            <div class="avatar-wrap">
              <div class="avatar" aria-hidden="true">
                {{ profile()!.ime.charAt(0) }}{{ profile()!.prezime.charAt(0) }}
              </div>
            </div>
            <h2 class="profile-name">{{ profile()!.ime }} {{ profile()!.prezime }}</h2>
            <p class="profile-username">&#64;{{ profile()!.korisnickoIme }}</p>
            <div class="profile-badges">
              @for (role of profile()!.roles; track role) {
                <sh-badge [variant]="roleBadge(role)">{{ role }}</sh-badge>
              }
            </div>
            <div class="profile-meta">
              <div class="meta-row">
                <span aria-hidden="true">📅</span>
                <span>Member since {{ profile()!.datumRegistracije | date:'mediumDate' }}</span>
              </div>
              @if (profile()!.email) {
                <div class="meta-row">
                  <span aria-hidden="true">✉️</span>
                  <span>{{ profile()!.email }}</span>
                </div>
              }
              @if (profile()!.telefon) {
                <div class="meta-row">
                  <span aria-hidden="true">📞</span>
                  <span>{{ profile()!.telefon }}</span>
                </div>
              }
            </div>
          </aside>

          <!-- Edit form -->
          <div class="form-card">
            <h3 class="form-section-title">Personal Information</h3>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              <div class="form-row">
                <div class="form-field">
                  <label for="ime" class="form-label">First Name</label>
                  <input id="ime" type="text" class="input-base" formControlName="ime"
                    placeholder="First name" autocomplete="given-name"
                    [attr.aria-invalid]="isInvalid('ime')" />
                  @if (isInvalid('ime')) { <p class="field-error">Required</p> }
                </div>
                <div class="form-field">
                  <label for="prezime" class="form-label">Last Name</label>
                  <input id="prezime" type="text" class="input-base" formControlName="prezime"
                    placeholder="Last name" autocomplete="family-name"
                    [attr.aria-invalid]="isInvalid('prezime')" />
                  @if (isInvalid('prezime')) { <p class="field-error">Required</p> }
                </div>
              </div>

              <div class="form-field">
                <label for="email" class="form-label">Email Address</label>
                <input id="email" type="email" class="input-base" formControlName="email"
                  placeholder="your@email.com" autocomplete="email"
                  [attr.aria-invalid]="isInvalid('email')" />
                @if (isInvalid('email')) { <p class="field-error">Enter a valid email</p> }
              </div>

              <div class="form-field">
                <label for="telefon" class="form-label">Phone Number <span class="optional">(optional)</span></label>
                <input id="telefon" type="tel" class="input-base" formControlName="telefon"
                  placeholder="+1 234 567 8900" autocomplete="tel" />
              </div>

              <div class="form-actions">
                <sh-button type="submit" variant="primary" [loading]="saving()" [disabled]="form.invalid || form.pristine">
                  Save Changes
                </sh-button>
                <sh-button type="button" variant="ghost" (onClick)="resetForm()">
                  Discard
                </sh-button>
              </div>
            </form>
          </div>

          <!-- Change Password -->
          <div class="form-card" style="margin-top:1.5rem">
            <h2 class="form-section-title">Change Password</h2>
            <form [formGroup]="pwForm" (ngSubmit)="changePassword()" novalidate>
              <div class="form-field">
                <label for="currentPw" class="form-label">Current Password</label>
                <input id="currentPw" type="password" class="input-base" formControlName="currentPassword" placeholder="••••••••" autocomplete="current-password" />
                @if (pwField('currentPassword').invalid && pwField('currentPassword').touched) {
                  <p class="field-error" role="alert">Current password is required</p>
                }
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="newPw" class="form-label">New Password</label>
                  <input id="newPw" type="password" class="input-base" formControlName="newPassword" placeholder="Min. 6 characters" autocomplete="new-password" />
                  @if (pwField('newPassword').invalid && pwField('newPassword').touched) {
                    <p class="field-error" role="alert">Min. 6 characters required</p>
                  }
                </div>
                <div class="form-field">
                  <label for="confirmPw" class="form-label">Confirm New Password</label>
                  <input id="confirmPw" type="password" class="input-base" formControlName="confirmPassword" placeholder="Repeat new password" autocomplete="new-password" />
                  @if (pwForm.errors?.['mismatch'] && pwField('confirmPassword').touched) {
                    <p class="field-error" role="alert">Passwords do not match</p>
                  }
                </div>
              </div>
              <div class="form-actions">
                <sh-button type="submit" variant="primary" [loading]="changingPw()">
                  Update Password
                </sh-button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .profile-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1.5rem;
      align-items: start;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .profile-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); padding: 2rem 1.5rem;
      text-align: center; box-shadow: var(--shadow-card);
    }
    .avatar-wrap { margin-bottom: 1rem; }
    .avatar {
      width: 80px; height: 80px; margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: white; font-weight: 700; font-size: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgb(37 80 245 / 0.3);
    }
    .profile-name {
      font-family: var(--font-display); font-size: var(--text-xl);
      font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;
    }
    .profile-username { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 1rem; }
    .profile-badges { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .profile-meta {
      display: flex; flex-direction: column; gap: 0.625rem;
      border-top: 1px solid var(--border-color); padding-top: 1.25rem; text-align: left;
    }
    .meta-row {
      display: flex; align-items: center; gap: 0.625rem;
      font-size: var(--text-sm); color: var(--text-secondary);
      span:first-child { font-size: 0.875rem; flex-shrink: 0; }
    }

    .form-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); padding: 1.75rem;
      box-shadow: var(--shadow-card);
    }
    .form-section-title {
      font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600;
      color: var(--text-primary); margin-bottom: 1.5rem;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; @media (max-width: 480px) { grid-template-columns: 1fr; } }
    .form-field { margin-bottom: 1.25rem; }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
    .optional { font-weight: 400; color: var(--text-muted); }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly korisnikService = inject(KorisnikService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly changingPw = signal(false);
  readonly profile = signal<KorisnikDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefon: [''],
  });

  readonly pwForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: (g) => g.get('newPassword')?.value !== g.get('confirmPassword')?.value ? { mismatch: true } : null }
  );

  ngOnInit(): void {
    this.korisnikService.getMyProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.form.patchValue({ ime: p.ime, prezime: p.prezime, email: p.email ?? '', telefon: p.telefon ?? '' });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Failed to load profile'); },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const { ime, prezime, email, telefon } = this.form.getRawValue();
    this.korisnikService.updateProfile({ ime, prezime, email, telefon: telefon || undefined }).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.form.markAsPristine();
        this.saving.set(false);
        this.toast.success('Profile updated', 'Your changes have been saved.');
      },
      error: () => { this.saving.set(false); this.toast.error('Failed to update profile'); },
    });
  }

  resetForm(): void {
    const p = this.profile();
    if (!p) return;
    this.form.patchValue({ ime: p.ime, prezime: p.prezime, email: p.email ?? '', telefon: p.telefon ?? '' });
    this.form.markAsPristine();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  roleBadge(role: string): 'info' | 'warning' | 'success' {
    if (role === 'Admin') return 'warning';
    if (role === 'Recepcioner') return 'info';
    return 'success';
  }

  pwField(name: string) { return this.pwForm.get(name)!; }

  changePassword(): void {
    if (this.pwForm.invalid) { this.pwForm.markAllAsTouched(); return; }
    this.changingPw.set(true);
    const { currentPassword, newPassword } = this.pwForm.getRawValue() as { currentPassword: string; newPassword: string; confirmPassword: string };
    this.korisnikService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.pwForm.reset();
        this.changingPw.set(false);
        this.toast.success('Password changed', 'Your password has been updated.');
      },
      error: () => {
        this.changingPw.set(false);
        this.toast.error('Failed to change password', 'Check your current password and try again.');
      },
    });
  }
}
