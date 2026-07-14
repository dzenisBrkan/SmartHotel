import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastOutletComponent } from '../../shared/ui/toast/toast-outlet.component';
import { Subscription, filter } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'sh-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-shell">
      <!-- Mobile overlay -->
      @if (mobileSidebarOpen()) {
        <div
          class="mobile-overlay"
          aria-hidden="true"
          (click)="mobileSidebarOpen.set(false)"
        ></div>
      }

      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-collapsed]="collapsed()" [class.sidebar-mobile-open]="mobileSidebarOpen()">
        <div class="sidebar-header">
          <a routerLink="/" class="sidebar-brand" [attr.aria-label]="collapsed() ? 'SmartHotel' : undefined">
            <span aria-hidden="true">🏨</span>
            @if (!collapsed()) { <span class="brand-text">SmartHotel</span> }
          </a>
          <button class="sidebar-toggle" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
            {{ collapsed() ? '›' : '‹' }}
          </button>
        </div>

        <div class="user-card">
          <div class="user-avatar" aria-hidden="true">
            {{ auth.currentUser()?.ime?.charAt(0) ?? '?' }}
          </div>
          @if (!collapsed()) {
            <div class="user-info">
              <p class="user-name">{{ auth.currentUser()?.ime }} {{ auth.currentUser()?.prezime }}</p>
              <p class="user-role">{{ primaryRole }}</p>
            </div>
          }
        </div>

        <nav class="sidebar-nav" aria-label="Dashboard navigation">
          <ul role="list">
            @for (item of visibleNavItems; track item.route) {
              <li>
                <a
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                  class="nav-item"
                  [attr.title]="collapsed() ? item.label : undefined"
                >
                  <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
                  @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="nav-item">
            <span aria-hidden="true">🏠</span>
            @if (!collapsed()) { <span>Back to Site</span> }
          </a>
          <button class="nav-item logout-btn" (click)="auth.logout()">
            <span aria-hidden="true">🚪</span>
            @if (!collapsed()) { <span>Sign Out</span> }
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="dashboard-main">
        <header class="dashboard-topbar">
          <button class="mobile-sidebar-toggle" (click)="mobileSidebarOpen.set(!mobileSidebarOpen())" aria-label="Toggle sidebar">
            ☰
          </button>
          <div class="topbar-spacer"></div>
          <div class="topbar-actions">
            <button class="theme-toggle-btn" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <span class="topbar-user">{{ auth.currentUser()?.korisnickoIme }}</span>
          </div>
        </header>
        <main class="dashboard-content page-enter" id="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    <sh-toast-outlet></sh-toast-outlet>
  `,
  styles: [`
    .dashboard-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-page);
    }
    .mobile-overlay {
      display: none;
      @media (max-width: 1024px) {
        display: block; position: fixed; inset: 0; z-index: 49;
        background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
        animation: fadeIn 150ms ease;
      }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .sidebar {
      width: 260px;
      min-height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width var(--transition-base), transform var(--transition-base);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      @media (max-width: 1024px) {
        position: fixed; left: 0; top: 0; z-index: 50; transform: translateX(-100%);
      }
    }
    .sidebar-mobile-open {
      @media (max-width: 1024px) { transform: translateX(0) !important; }
    }
    .sidebar-collapsed { width: 70px; }
    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: var(--font-display); font-weight: 700;
      font-size: 1.1rem; color: var(--text-primary);
      text-decoration: none; overflow: hidden;
      .brand-text {
        background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        white-space: nowrap;
      }
    }
    .sidebar-toggle {
      background: none; border: 1px solid var(--border-color);
      border-radius: var(--radius-md); padding: 4px 8px;
      cursor: pointer; color: var(--text-secondary);
      font-size: 1.125rem; line-height: 1;
      transition: background var(--transition-fast);
      flex-shrink: 0;
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
    }
    .user-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .user-avatar {
      width: 36px; height: 36px; flex-shrink: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: white; font-weight: 700; font-size: 0.875rem;
      display: flex; align-items: center; justify-content: center;
    }
    .user-info { overflow: hidden; }
    .user-name {
      font-size: var(--text-sm); font-weight: 600;
      color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .user-role {
      font-size: var(--text-xs); color: var(--text-muted);
    }
    .sidebar-nav {
      flex: 1; padding: 0.75rem 0.5rem;
      ul { list-style: none; display: flex; flex-direction: column; gap: 2px; }
    }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.875rem; border-radius: var(--radius-md);
      font-size: var(--text-sm); font-weight: 500;
      color: var(--text-secondary); text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer; background: none; border: none;
      width: 100%; text-align: left;
      .nav-icon { font-size: 1.125rem; flex-shrink: 0; }
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
      &.active { background: var(--color-primary-50); color: var(--color-primary-600); font-weight: 600; }
    }
    [data-theme='dark'] .nav-item.active {
      background: rgb(37 80 245 / 0.15);
      color: var(--color-primary-300);
    }
    .logout-btn { color: var(--color-danger); &:hover { background: var(--color-danger-light); } }
    .sidebar-footer { padding: 0.75rem 0.5rem; border-top: 1px solid var(--border-color); }
    .sidebar-collapsed .nav-item { justify-content: center; }
    .sidebar-collapsed .sidebar-footer a, .sidebar-collapsed .sidebar-footer button { justify-content: center; }
    .dashboard-main {
      flex: 1; display: flex; flex-direction: column;
      min-width: 0;
    }
    .dashboard-topbar {
      height: 4rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center;
      padding-inline: 1.5rem;
      gap: 1rem;
      position: sticky; top: 0; z-index: 50;
    }
    .mobile-sidebar-toggle {
      background: none; border: none; cursor: pointer;
      font-size: 1.25rem; color: var(--text-primary);
      display: none;
      @media (max-width: 1024px) { display: block; }
    }
    .topbar-spacer { flex: 1; }
    .topbar-actions { display: flex; align-items: center; gap: 0.75rem; }
    .theme-toggle-btn {
      background: none; border: 1px solid var(--border-color); border-radius: var(--radius-md);
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1rem; transition: background var(--transition-fast);
      color: var(--text-primary);
      &:hover { background: var(--bg-surface-2); }
    }
    .topbar-user {
      font-size: var(--text-sm); font-weight: 500;
      color: var(--text-secondary);
    }
    .dashboard-content {
      flex: 1; padding: 2rem;
      @media (max-width: 640px) { padding: 1rem; }
    }
  `],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  readonly collapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  private readonly routerSub: Subscription;

  constructor() {
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.mobileSidebarOpen.set(false));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  private readonly allNavItems: NavItem[] = [
    { label: 'Overview', icon: '📊', route: '/dashboard', roles: ['Admin', 'Recepcioner', 'Gost'] },
    { label: 'My Reservations', icon: '📅', route: '/dashboard/my-reservations', roles: ['Gost'] },
    { label: 'Profile', icon: '👤', route: '/dashboard/profile', roles: ['Admin', 'Recepcioner', 'Gost'] },
    { label: 'Reservations', icon: '📋', route: '/dashboard/reservations', roles: ['Admin', 'Recepcioner'] },
    { label: 'Check-In/Out', icon: '🔑', route: '/dashboard/checkin', roles: ['Admin', 'Recepcioner'] },
    { label: 'Rooms', icon: '🛏️', route: '/dashboard/admin/rooms', roles: ['Admin'] },
    { label: 'Room Types', icon: '🏷️', route: '/dashboard/admin/room-types', roles: ['Admin'] },
    { label: 'Services', icon: '✨', route: '/dashboard/admin/services', roles: ['Admin'] },
    { label: 'Users & Staff', icon: '👥', route: '/dashboard/admin/users', roles: ['Admin'] },
    { label: 'All Reservations', icon: '📊', route: '/dashboard/admin/reservations', roles: ['Admin'] },
  ];

  get visibleNavItems(): NavItem[] {
    const roles = this.auth.roles() as string[];
    return this.allNavItems.filter((item) => item.roles.some((r) => roles.includes(r)));
  }

  get primaryRole(): string {
    const roles = this.auth.roles() as string[];
    if (roles.includes('Admin')) return 'Administrator';
    if (roles.includes('Recepcioner')) return 'Receptionist';
    return 'Guest';
  }
}
