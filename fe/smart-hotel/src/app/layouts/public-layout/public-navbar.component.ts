import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'sh-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar" [class.navbar-scrolled]="scrolled()">
      <div class="container navbar-inner">
        <a routerLink="/" class="navbar-brand" aria-label="SmartHotel Home">
          <span class="brand-icon" aria-hidden="true">🏨</span>
          <span class="brand-name">SmartHotel</span>
        </a>

        <ul class="navbar-links" role="list">
          <li><a routerLink="/rooms" routerLinkActive="active" class="nav-link">Rooms</a></li>
          <li><a routerLink="/" fragment="services" class="nav-link">Services</a></li>
          <li><a routerLink="/" fragment="gallery" class="nav-link">Gallery</a></li>
          <li><a routerLink="/" fragment="contact" class="nav-link">Contact</a></li>
        </ul>

        <div class="navbar-actions">
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard" class="nav-link">Dashboard</a>
            <sh-button variant="secondary" size="sm" (onClick)="auth.logout()">Sign Out</sh-button>
          } @else {
            <a routerLink="/auth/login" class="nav-link">Sign In</a>
            <sh-button variant="primary" size="sm" routerLink="/auth/register">Book Now</sh-button>
          }
          <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + (dark ? 'light' : 'dark') + ' mode'">
            {{ dark ? '☀️' : '🌙' }}
          </button>
        </div>

        <button class="mobile-menu-btn" (click)="mobileOpen.set(!mobileOpen())" [attr.aria-expanded]="mobileOpen()" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (mobileOpen()) {
        <div class="mobile-menu">
          <ul role="list">
            <li><a routerLink="/rooms" (click)="mobileOpen.set(false)" class="mobile-nav-link">Rooms</a></li>
            <li><a routerLink="/" fragment="services" (click)="mobileOpen.set(false)" class="mobile-nav-link">Services</a></li>
            <li><a routerLink="/" fragment="gallery" (click)="mobileOpen.set(false)" class="mobile-nav-link">Gallery</a></li>
            <li><a routerLink="/" fragment="contact" (click)="mobileOpen.set(false)" class="mobile-nav-link">Contact</a></li>
            @if (auth.isAuthenticated()) {
              <li><a routerLink="/dashboard" (click)="mobileOpen.set(false)" class="mobile-nav-link">Dashboard</a></li>
              <li><a href="#" (click)="auth.logout()" class="mobile-nav-link danger">Sign Out</a></li>
            } @else {
              <li><a routerLink="/auth/login" (click)="mobileOpen.set(false)" class="mobile-nav-link">Sign In</a></li>
              <li><a routerLink="/auth/register" (click)="mobileOpen.set(false)" class="mobile-nav-link highlight">Book Now</a></li>
            }
          </ul>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: var(--z-navbar);
      background: transparent;
      backdrop-filter: blur(0);
      transition: all var(--transition-base);
      border-bottom: 1px solid transparent;
    }
    .navbar-scrolled {
      background: rgb(255 255 255 / 0.9);
      backdrop-filter: blur(16px);
      border-bottom-color: var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    [data-theme='dark'] .navbar-scrolled {
      background: rgb(22 27 34 / 0.9);
    }
    .navbar-inner {
      display: flex; align-items: center; gap: 2rem;
      height: 4.5rem;
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: var(--font-display); font-weight: 700;
      font-size: 1.25rem; color: var(--text-primary);
      text-decoration: none;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-name {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .navbar-links {
      display: flex; gap: 0.25rem; list-style: none;
      margin-left: auto;
      @media (max-width: 768px) { display: none; }
    }
    .nav-link {
      padding: 0.5rem 0.875rem; border-radius: var(--radius-md);
      font-size: var(--text-sm); font-weight: 500;
      color: var(--text-secondary); text-decoration: none;
      transition: color var(--transition-fast), background var(--transition-fast);
      &:hover, &.active { color: var(--text-primary); background: var(--bg-surface-2); }
    }
    .navbar-actions {
      display: flex; align-items: center; gap: 0.75rem;
      @media (max-width: 768px) { display: none; }
    }
    .theme-toggle {
      background: none; border: 1px solid var(--border-color);
      border-radius: var(--radius-md); padding: 6px 8px;
      cursor: pointer; font-size: 1rem; line-height: 1;
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-surface-2); }
    }
    .mobile-menu-btn {
      display: none; margin-left: auto;
      flex-direction: column; gap: 4px;
      background: none; border: none; padding: 6px; cursor: pointer;
      span { display: block; width: 22px; height: 2px; background: var(--text-primary); border-radius: 2px; transition: all var(--transition-fast); }
      @media (max-width: 768px) { display: flex; }
    }
    .mobile-menu {
      border-top: 1px solid var(--border-color);
      background: var(--bg-surface);
      padding: 0.75rem 1rem;
      ul { list-style: none; }
    }
    .mobile-nav-link {
      display: block; padding: 0.75rem 1rem;
      color: var(--text-primary); font-weight: 500;
      border-radius: var(--radius-md); text-decoration: none;
      &:hover { background: var(--bg-surface-2); }
      &.danger { color: var(--color-danger); }
      &.highlight { color: var(--color-primary-500); font-weight: 600; }
    }
  `],
})
export class PublicNavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly scrolled = signal(false);
  readonly mobileOpen = signal(false);

  get dark(): boolean { return this.theme.isDark(); }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
