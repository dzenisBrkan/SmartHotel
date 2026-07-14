import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RezervacijaService } from '../../../core/services/rezervacija.service';
import { SobaService } from '../../../core/services/soba.service';
import { KorisnikService } from '../../../core/services/korisnik.service';
import {
  RezervacijaDto,
  StatusRezervacije,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../../core/models/rezervacija.models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { BadgeVariant } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'sh-guest-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BadgeComponent,
    SkeletonComponent,
    ButtonComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-page page-enter">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{ greeting }}, {{ auth.currentUser()?.ime ?? 'there' }} 👋
          </h1>
          <p class="page-subtitle">
            {{ roleSubtitle }}
          </p>
        </div>
        <div class="header-meta">
          <span class="current-date">{{ today }}</span>
        </div>
      </div>

      <!-- GUEST VIEW -->
      @if (auth.isGost()) {
        <!-- Stats row -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" aria-hidden="true">📅</div>
            <div class="stat-body">
              <span class="stat-value">{{ upcomingCount() }}</span>
              <span class="stat-label">Upcoming</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" aria-hidden="true">✅</div>
            <div class="stat-body">
              <span class="stat-value">{{ completedCount() }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" aria-hidden="true">💶</div>
            <div class="stat-body">
              <span class="stat-value">€{{ totalSpent() | number:'1.0-0' }}</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </div>

        <!-- Upcoming reservations -->
        <div class="section-card">
          <div class="section-card-header">
            <h2 class="section-card-title">Upcoming Reservations</h2>
            <a routerLink="/dashboard/my-reservations" class="view-all-link">View all →</a>
          </div>

          @if (loading()) {
            <div class="res-list">
              @for (i of [1,2,3]; track i) {
                <div class="res-skeleton">
                  <sh-skeleton height="4rem"></sh-skeleton>
                </div>
              }
            </div>
          } @else if (upcoming().length === 0) {
            <sh-empty-state
              icon="🛏️"
              title="No upcoming stays"
              description="Browse our rooms and make your first reservation."
            >
              <sh-button variant="primary" routerLink="/rooms" style="margin-top:1rem">
                Explore Rooms
              </sh-button>
            </sh-empty-state>
          } @else {
            <div class="res-list">
              @for (r of upcoming(); track r.rezervacijaId) {
                <div class="res-row">
                  <div class="res-room-icon" aria-hidden="true">🛏️</div>
                  <div class="res-info">
                    <span class="res-room">{{ r.sobaNaziv }}</span>
                    <span class="res-dates">
                      {{ r.datumOd | date:'mediumDate' }} – {{ r.datumDo | date:'mediumDate' }}
                    </span>
                  </div>
                  <sh-badge [variant]="statusColor(r.status)">
                    {{ statusLabel(r.status) }}
                  </sh-badge>
                  <span class="res-price">€{{ r.ukupnaCijena | number:'1.0-0' }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <a routerLink="/rooms" class="quick-link-card">
            <span class="ql-icon" aria-hidden="true">🏨</span>
            <span class="ql-label">Browse Rooms</span>
          </a>
          <a routerLink="/dashboard/my-reservations" class="quick-link-card">
            <span class="ql-icon" aria-hidden="true">📋</span>
            <span class="ql-label">My Reservations</span>
          </a>
          <a routerLink="/dashboard/profile" class="quick-link-card">
            <span class="ql-icon" aria-hidden="true">👤</span>
            <span class="ql-label">My Profile</span>
          </a>
        </div>
      }

      <!-- RECEPTIONIST VIEW -->
      @if (auth.isRecepcioner() && !auth.isAdmin()) {
        <div class="stats-grid">
          <div class="stat-card accent-warning">
            <div class="stat-icon" aria-hidden="true">🔔</div>
            <div class="stat-body">
              <span class="stat-value">{{ pendingCount() }}</span>
              <span class="stat-label">Arrivals Today</span>
            </div>
          </div>
          <div class="stat-card accent-success">
            <div class="stat-icon" aria-hidden="true">🔑</div>
            <div class="stat-body">
              <span class="stat-value">{{ activeCount() }}</span>
              <span class="stat-label">Active Guests</span>
            </div>
          </div>
          <div class="stat-card accent-info">
            <div class="stat-icon" aria-hidden="true">🚪</div>
            <div class="stat-body">
              <span class="stat-value">{{ completedTodayCount() }}</span>
              <span class="stat-label">Check-outs Today</span>
            </div>
          </div>
        </div>

        <div class="action-shortcuts">
          <sh-button variant="primary" routerLink="/dashboard/checkin" iconLeft="🔑">
            Manage Check-Ins
          </sh-button>
          <sh-button variant="secondary" routerLink="/dashboard/reservations" iconLeft="📋">
            All Reservations
          </sh-button>
        </div>

        <div class="section-card">
          <div class="section-card-header">
            <h2 class="section-card-title">Today's Arrivals</h2>
          </div>
          @if (loading()) {
            <div class="res-list">
              @for (i of [1,2,3]; track i) {
                <div class="res-skeleton"><sh-skeleton height="4rem"></sh-skeleton></div>
              }
            </div>
          } @else if (pending().length === 0) {
            <sh-empty-state icon="🎉" title="No arrivals today" description="All caught up!"></sh-empty-state>
          } @else {
            <div class="res-list">
              @for (r of pending().slice(0, 5); track r.rezervacijaId) {
                <div class="res-row">
                  <div class="res-room-icon" aria-hidden="true">👤</div>
                  <div class="res-info">
                    <span class="res-room">{{ r.korisnikImePrezime }}</span>
                    <span class="res-dates">Room: {{ r.sobaNaziv }} · {{ r.datumOd | date:'mediumDate' }}</span>
                  </div>
                  <sh-badge variant="warning">Pending</sh-badge>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ADMIN VIEW -->
      @if (auth.isAdmin()) {
        <div class="stats-grid stats-grid-4">
          <div class="stat-card accent-primary">
            <div class="stat-icon" aria-hidden="true">🏨</div>
            <div class="stat-body">
              <span class="stat-value">{{ totalRooms() }}</span>
              <span class="stat-label">Total Rooms</span>
            </div>
          </div>
          <div class="stat-card accent-warning">
            <div class="stat-icon" aria-hidden="true">⏳</div>
            <div class="stat-body">
              <span class="stat-value">{{ pendingCount() }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card accent-success">
            <div class="stat-icon" aria-hidden="true">✅</div>
            <div class="stat-body">
              <span class="stat-value">{{ activeCount() }}</span>
              <span class="stat-label">Active Stays</span>
            </div>
          </div>
          <div class="stat-card accent-gold">
            <div class="stat-icon" aria-hidden="true">💰</div>
            <div class="stat-body">
              <span class="stat-value">€{{ totalRevenue() | number:'1.0-0' }}</span>
              <span class="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>

        <div class="admin-shortcuts">
          <a routerLink="/dashboard/admin/rooms" class="shortcut-card">
            <span aria-hidden="true">🛏️</span><span>Manage Rooms</span>
          </a>
          <a routerLink="/dashboard/admin/room-types" class="shortcut-card">
            <span aria-hidden="true">🏷️</span><span>Room Types</span>
          </a>
          <a routerLink="/dashboard/admin/services" class="shortcut-card">
            <span aria-hidden="true">✨</span><span>Services</span>
          </a>
          <a routerLink="/dashboard/admin/users" class="shortcut-card">
            <span aria-hidden="true">👥</span><span>Users & Staff</span>
          </a>
          <a routerLink="/dashboard/admin/reservations" class="shortcut-card">
            <span aria-hidden="true">📊</span><span>All Reservations</span>
          </a>
          <a routerLink="/dashboard/reservations" class="shortcut-card">
            <span aria-hidden="true">📋</span><span>Manage Reservations</span>
          </a>
          <a routerLink="/dashboard/checkin" class="shortcut-card">
            <span aria-hidden="true">🔑</span><span>Check-In/Out</span>
          </a>
        </div>

        <div class="section-card">
          <div class="section-card-header">
            <h2 class="section-card-title">Recent Reservations</h2>
            <a routerLink="/dashboard/reservations" class="view-all-link">View all →</a>
          </div>
          @if (loading()) {
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (i of [1,2,3,4,5]; track i) {
                    <tr>
                      <td><sh-skeleton height="1rem" width="120px"></sh-skeleton></td>
                      <td><sh-skeleton height="1rem" width="80px"></sh-skeleton></td>
                      <td><sh-skeleton height="1rem" width="90px"></sh-skeleton></td>
                      <td><sh-skeleton height="1rem" width="90px"></sh-skeleton></td>
                      <td><sh-skeleton height="1.25rem" width="70px" [rounded]="true"></sh-skeleton></td>
                      <td><sh-skeleton height="1rem" width="60px"></sh-skeleton></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (allReservations().length === 0) {
            <sh-empty-state icon="📋" title="No reservations yet" description="Reservations will appear here."></sh-empty-state>
          } @else {
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Guest</th>
                    <th scope="col">Room</th>
                    <th scope="col">Check-In</th>
                    <th scope="col">Check-Out</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of allReservations().slice(0, 10); track r.rezervacijaId) {
                    <tr>
                      <td>{{ r.korisnikImePrezime }}</td>
                      <td>{{ r.sobaNaziv }}</td>
                      <td>{{ r.datumOd | date:'mediumDate' }}</td>
                      <td>{{ r.datumDo | date:'mediumDate' }}</td>
                      <td>
                        <sh-badge [variant]="statusColor(r.status)">
                          {{ statusLabel(r.status) }}
                        </sh-badge>
                      </td>
                      <td class="amount-cell">€{{ r.ukupnaCijena | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1200px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    }
    .page-title {
      font-family: var(--font-display); font-size: var(--text-3xl);
      font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;
    }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); }
    .current-date { font-size: var(--text-sm); color: var(--text-muted); font-weight: 500; }
    .header-meta { display: flex; align-items: center; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }
    .stats-grid-4 {
      grid-template-columns: repeat(4, 1fr);
      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }
    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
    }
    .stat-icon { font-size: 2rem; flex-shrink: 0; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value {
      font-size: var(--text-2xl); font-weight: 700;
      color: var(--text-primary); line-height: 1.2;
    }
    .stat-label { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; margin-top: 2px; }

    .accent-primary { border-left: 3px solid var(--color-primary-500); }
    .accent-warning { border-left: 3px solid var(--color-warning); }
    .accent-success { border-left: 3px solid var(--color-success); }
    .accent-info    { border-left: 3px solid var(--color-info); }
    .accent-gold    { border-left: 3px solid var(--color-gold-500); }

    .section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .section-card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .section-card-title {
      font-family: var(--font-display); font-size: var(--text-lg); font-weight: 600;
      color: var(--text-primary);
    }
    .view-all-link {
      font-size: var(--text-sm); color: var(--color-primary-500); font-weight: 500;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .res-list { padding: 0.5rem 0; }
    .res-skeleton { padding: 0.5rem 1.5rem; }
    .res-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.875rem 1.5rem;
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-surface-2); }
    }
    .res-room-icon {
      font-size: 1.5rem; flex-shrink: 0;
      width: 2.5rem; height: 2.5rem;
      background: var(--bg-surface-2);
      border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
    }
    .res-info { flex: 1; min-width: 0; }
    .res-room { display: block; font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); }
    .res-dates { display: block; font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
    .res-price { font-weight: 700; font-size: var(--text-sm); color: var(--text-primary); white-space: nowrap; }

    .quick-links {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      margin-bottom: 1.5rem;
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }
    .quick-link-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); padding: 1.5rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      text-decoration: none; transition: all var(--transition-fast);
      box-shadow: var(--shadow-card);
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-card-hover); background: var(--bg-surface-2); }
    }
    .ql-icon { font-size: 2rem; }
    .ql-label { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }

    .action-shortcuts {
      display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;
    }

    .admin-shortcuts {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }
    .shortcut-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); padding: 1rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      text-decoration: none; font-size: var(--text-sm); font-weight: 600;
      color: var(--text-primary); transition: all var(--transition-fast);
      box-shadow: var(--shadow-card);
      span:first-child { font-size: 1.5rem; }
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); color: var(--color-primary-600); }
    }

    .amount-cell { font-weight: 600; color: var(--color-success); }
  `],
})
export class GuestDashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly rezervacijaService = inject(RezervacijaService);
  private readonly sobaService = inject(SobaService);

  readonly loading = signal(true);
  readonly allReservations = signal<RezervacijaDto[]>([]);
  readonly totalRooms = signal(0);

  readonly upcoming = computed(() =>
    this.allReservations().filter((r) => r.status === StatusRezervacije.Kreirana)
  );
  readonly pending = computed(() =>
    this.allReservations().filter((r) => r.status === StatusRezervacije.Kreirana)
  );
  readonly active = computed(() =>
    this.allReservations().filter((r) => r.status === StatusRezervacije.U_Toku)
  );
  readonly completed = computed(() =>
    this.allReservations().filter((r) => r.status === StatusRezervacije.Zavrsena)
  );

  readonly upcomingCount = computed(() => this.upcoming().length);
  readonly completedCount = computed(() => this.completed().length);
  readonly pendingCount = computed(() => this.pending().length);
  readonly activeCount = computed(() => this.active().length);
  readonly completedTodayCount = computed(() => this.completed().length);
  readonly totalSpent = computed(() =>
    this.allReservations().reduce((sum: number, r) => sum + r.ukupnaCijena, 0)
  );
  readonly totalRevenue = computed(() =>
    this.allReservations().reduce((sum: number, r) => sum + r.ukupnaCijena, 0)
  );

  readonly today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get roleSubtitle(): string {
    if (this.auth.isAdmin()) return 'System overview and management';
    if (this.auth.isRecepcioner()) return "Today's hotel operations at a glance";
    return 'Your personal travel hub';
  }

  ngOnInit(): void {
    if (this.auth.isGost()) {
      this.rezervacijaService.getMyReservations().subscribe({
        next: (data) => {
          this.allReservations.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.rezervacijaService.getAll().subscribe({
        next: (data) => {
          this.allReservations.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      if (this.auth.isAdmin()) {
        this.sobaService.getAll().subscribe({
          next: (rooms) => this.totalRooms.set(rooms.length),
          error: () => {},
        });
      }
    }
  }

  statusLabel(status: StatusRezervacije): string {
    return STATUS_LABELS[status] ?? 'Unknown';
  }

  statusColor(status: StatusRezervacije): BadgeVariant {
    return (STATUS_COLORS[status] as BadgeVariant) ?? 'neutral';
  }
}
