import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RezervacijaService } from '../../../core/services/rezervacija.service';
import { ToastService } from '../../../core/services/toast.service';
import { RezervacijaDto, StatusRezervacije } from '../../../core/models/rezervacija.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-checkin',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Check-In / Check-Out</h1>
          <p class="page-subtitle">{{ today }}</p>
        </div>
      </div>

      <div class="checkin-layout">
        <!-- Arrivals -->
        <section class="panel panel-arrivals">
          <div class="panel-header">
            <div class="panel-title-row">
              <span class="panel-icon" aria-hidden="true">🔔</span>
              <h2 class="panel-title">Today's Arrivals</h2>
              @if (!loading()) {
                <span class="panel-count">{{ pending().length }}</span>
              }
            </div>
            <p class="panel-subtitle">Guests expecting check-in</p>
          </div>

          <div class="panel-body">
            @if (loading()) {
              @for (i of [1,2,3]; track i) {
                <div class="card-skeleton">
                  <sh-skeleton height="5rem"></sh-skeleton>
                </div>
              }
            } @else if (pending().length === 0) {
              <sh-empty-state icon="🎉" title="No arrivals" description="No check-ins pending today."></sh-empty-state>
            } @else {
              @for (r of pending(); track r.rezervacijaId) {
                <div class="guest-card arrivals-card">
                  <div class="guest-info">
                    <div class="guest-avatar" aria-hidden="true">{{ r.korisnikImePrezime.charAt(0) }}</div>
                    <div>
                      <p class="guest-name">{{ r.korisnikImePrezime }}</p>
                      <p class="guest-meta">{{ r.sobaNaziv }}</p>
                      <p class="guest-meta">
                        {{ r.datumOd | date:'mediumDate' }} → {{ r.datumDo | date:'mediumDate' }}
                        · {{ r.brojOsoba }} {{ r.brojOsoba === 1 ? 'guest' : 'guests' }}
                      </p>
                    </div>
                  </div>
                  <sh-button
                    variant="primary"
                    size="sm"
                    iconLeft="✅"
                    [loading]="actionId() === r.rezervacijaId + '-ci'"
                    (onClick)="checkIn(r)"
                  >
                    Check In
                  </sh-button>
                </div>
              }
            }
          </div>
        </section>

        <!-- Departures -->
        <section class="panel panel-departures">
          <div class="panel-header">
            <div class="panel-title-row">
              <span class="panel-icon" aria-hidden="true">🚪</span>
              <h2 class="panel-title">Active Guests</h2>
              @if (!loading()) {
                <span class="panel-count">{{ active().length }}</span>
              }
            </div>
            <p class="panel-subtitle">Currently checked in</p>
          </div>

          <div class="panel-body">
            @if (loading()) {
              @for (i of [1,2,3]; track i) {
                <div class="card-skeleton">
                  <sh-skeleton height="5rem"></sh-skeleton>
                </div>
              }
            } @else if (active().length === 0) {
              <sh-empty-state icon="🏨" title="No active guests" description="No guests are currently checked in."></sh-empty-state>
            } @else {
              @for (r of active(); track r.rezervacijaId) {
                <div class="guest-card departures-card">
                  <div class="guest-info">
                    <div class="guest-avatar departures-avatar" aria-hidden="true">{{ r.korisnikImePrezime.charAt(0) }}</div>
                    <div>
                      <p class="guest-name">{{ r.korisnikImePrezime }}</p>
                      <p class="guest-meta">{{ r.sobaNaziv }}</p>
                      <p class="guest-meta">
                        Check-out: {{ r.datumDo | date:'mediumDate' }}
                        · {{ r.brojOsoba }} {{ r.brojOsoba === 1 ? 'guest' : 'guests' }}
                      </p>
                    </div>
                  </div>
                  <sh-button
                    variant="secondary"
                    size="sm"
                    iconLeft="🚪"
                    [loading]="actionId() === r.rezervacijaId + '-co'"
                    (onClick)="checkOut(r)"
                  >
                    Check Out
                  </sh-button>
                </div>
              }
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-muted); margin-top: 0.25rem; }

    .checkin-layout {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .panel {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card);
    }
    .panel-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .panel-arrivals .panel-header { background: linear-gradient(135deg, #fefce8, #fef9c3); }
    [data-theme='dark'] .panel-arrivals .panel-header { background: rgba(245,200,66,0.08); }
    .panel-departures .panel-header { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
    [data-theme='dark'] .panel-departures .panel-header { background: rgba(59,130,246,0.08); }

    .panel-title-row { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.25rem; }
    .panel-icon { font-size: 1.25rem; }
    .panel-title { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }
    .panel-count {
      background: var(--color-primary-50); color: var(--color-primary-600);
      font-size: var(--text-xs); font-weight: 700;
      padding: 2px 8px; border-radius: var(--radius-full);
    }
    .panel-subtitle { font-size: var(--text-xs); color: var(--text-muted); }

    .panel-body { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.625rem; }

    .card-skeleton { padding: 0.25rem; }

    .guest-card {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 1rem; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-surface-2); }
    }
    .guest-info { display: flex; align-items: center; gap: 0.875rem; flex: 1; min-width: 0; }
    .guest-avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: white; font-weight: 700; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
    }
    .departures-avatar { background: linear-gradient(135deg, var(--color-success), #059669); }
    .guest-name { font-weight: 700; font-size: var(--text-sm); color: var(--text-primary); }
    .guest-meta { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
  `],
})
export class CheckinComponent implements OnInit {
  private readonly rezervacijaService = inject(RezervacijaService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly actionId = signal<string | null>(null);
  readonly reservations = signal<RezervacijaDto[]>([]);

  readonly pending = computed(() => this.reservations().filter((r) => r.status === StatusRezervacije.Kreirana));
  readonly active = computed(() => this.reservations().filter((r) => r.status === StatusRezervacije.U_Toku));

  readonly today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit(): void {
    this.rezervacijaService.getAll().subscribe({
      next: (data) => { this.reservations.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load reservations'); },
    });
  }

  checkIn(r: RezervacijaDto): void {
    this.actionId.set(r.rezervacijaId + '-ci');
    this.rezervacijaService.checkIn(r.rezervacijaId).subscribe({
      next: (updated) => {
        this.reservations.update((list) => list.map((x) => x.rezervacijaId === updated.rezervacijaId ? updated : x));
        this.actionId.set(null);
        this.toast.success('Check-in complete', `Welcome, ${r.korisnikImePrezime}!`);
      },
      error: () => { this.actionId.set(null); this.toast.error('Check-in failed'); },
    });
  }

  checkOut(r: RezervacijaDto): void {
    this.actionId.set(r.rezervacijaId + '-co');
    this.rezervacijaService.checkOut(r.rezervacijaId).subscribe({
      next: (updated) => {
        this.reservations.update((list) => list.map((x) => x.rezervacijaId === updated.rezervacijaId ? updated : x));
        this.actionId.set(null);
        this.toast.success('Check-out complete', `Goodbye, ${r.korisnikImePrezime}!`);
      },
      error: () => { this.actionId.set(null); this.toast.error('Check-out failed'); },
    });
  }
}
