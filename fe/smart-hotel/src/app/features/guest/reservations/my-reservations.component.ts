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
import { RezervacijaService } from '../../../core/services/rezervacija.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  RezervacijaDto,
  StatusRezervacije,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../../core/models/rezervacija.models';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent, SkeletonComponent, ButtonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Reservations</h1>
          <p class="page-subtitle">All your past and upcoming stays in one place.</p>
        </div>
        <sh-button variant="primary" routerLink="/rooms" iconLeft="🔍">Browse Rooms</sh-button>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs" role="tablist" aria-label="Filter reservations">
        @for (tab of tabs; track tab.value) {
          <button
            role="tab"
            [attr.aria-selected]="activeTab() === tab.value"
            class="filter-tab"
            [class.active]="activeTab() === tab.value"
            (click)="activeTab.set(tab.value)"
          >
            {{ tab.label }}
            @if (countFor(tab.value); as n) {
              <span class="tab-count">{{ n }}</span>
            }
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="res-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="res-card">
              <sh-skeleton height="140px" style="border-radius:var(--radius-xl) var(--radius-xl) 0 0"></sh-skeleton>
              <div style="padding:1rem;display:flex;flex-direction:column;gap:0.5rem">
                <sh-skeleton height="1.25rem" width="60%"></sh-skeleton>
                <sh-skeleton height="0.875rem" width="80%"></sh-skeleton>
                <sh-skeleton height="0.875rem" width="50%"></sh-skeleton>
              </div>
            </div>
          }
        </div>

      <!-- Empty -->
      } @else if (filtered.length === 0) {
        <sh-empty-state
          icon="🗓️"
          title="No reservations found"
          [description]="activeTab() === 'all' ? 'You have no reservations yet. Start by browsing our rooms.' : 'No reservations match this filter.'"
        >
          @if (activeTab() === 'all') {
            <sh-button variant="primary" routerLink="/rooms" style="margin-top:1rem">Explore Rooms</sh-button>
          }
        </sh-empty-state>

      <!-- Cards -->
      } @else {
        <div class="res-grid">
          @for (r of filtered; track r.rezervacijaId) {
            <article class="res-card">
              <div class="res-card-header">
                <div class="res-room-icon" aria-hidden="true">🛏️</div>
                <div class="res-header-info">
                  <h3 class="res-room-name">{{ r.sobaNaziv }}</h3>
                  <span class="res-id">#{{ r.rezervacijaId }}</span>
                </div>
                <sh-badge [variant]="statusColor(r.status)" [dot]="true">
                  {{ statusLabel(r.status) }}
                </sh-badge>
              </div>

              <div class="res-details">
                <div class="res-detail-row">
                  <span class="detail-icon" aria-hidden="true">📅</span>
                  <span>{{ r.datumOd | date:'mediumDate' }} → {{ r.datumDo | date:'mediumDate' }}</span>
                </div>
                <div class="res-detail-row">
                  <span class="detail-icon" aria-hidden="true">👥</span>
                  <span>{{ r.brojOsoba }} {{ r.brojOsoba === 1 ? 'guest' : 'guests' }}</span>
                </div>
                <div class="res-detail-row">
                  <span class="detail-icon" aria-hidden="true">🌙</span>
                  <span>{{ nights(r) }} {{ nights(r) === 1 ? 'night' : 'nights' }}</span>
                </div>
                @if (r.usluge?.length) {
                  <div class="res-detail-row">
                    <span class="detail-icon" aria-hidden="true">✨</span>
                    <span>{{ uslugeNazivi(r) }}</span>
                  </div>
                }
              </div>

              <div class="res-card-footer">
                <div class="res-price">
                  <span class="price-label">Total</span>
                  <span class="price-value">€{{ r.ukupnaCijena | number:'1.2-2' }}</span>
                </div>
                @if (r.status === StatusRezervacije.Kreirana) {
                  <sh-button
                    variant="danger"
                    size="sm"
                    [loading]="cancellingId() === r.rezervacijaId"
                    (onClick)="cancel(r)"
                  >
                    Cancel
                  </sh-button>
                }
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 960px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
    }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .filter-tabs {
      display: flex; gap: 0.25rem; margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color); padding-bottom: -1px;
      overflow-x: auto;
    }
    .filter-tab {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1rem;
      font-size: var(--text-sm); font-weight: 500;
      color: var(--text-secondary); background: none; border: none;
      border-bottom: 2px solid transparent; cursor: pointer;
      transition: all var(--transition-fast); white-space: nowrap;
      margin-bottom: -1px;
      &:hover { color: var(--text-primary); }
      &.active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-500); }
    }
    .tab-count {
      background: var(--bg-surface-2); color: var(--text-muted);
      font-size: var(--text-xs); font-weight: 600;
      padding: 1px 7px; border-radius: var(--radius-full);
    }
    .filter-tab.active .tab-count { background: var(--color-primary-50); color: var(--color-primary-600); }

    .res-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .res-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); overflow: hidden;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-card-hover); }
    }
    .res-card-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-surface-2);
    }
    .res-room-icon {
      font-size: 1.5rem; width: 2.5rem; height: 2.5rem;
      background: var(--bg-surface); border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .res-header-info { flex: 1; min-width: 0; }
    .res-room-name {
      font-weight: 700; font-size: var(--text-sm); color: var(--text-primary);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .res-id { font-size: var(--text-xs); color: var(--text-muted); }

    .res-details { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .res-detail-row {
      display: flex; align-items: center; gap: 0.625rem;
      font-size: var(--text-sm); color: var(--text-secondary);
    }
    .detail-icon { font-size: 0.875rem; flex-shrink: 0; width: 1rem; text-align: center; }

    .res-card-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.875rem 1.25rem;
      border-top: 1px solid var(--border-color);
    }
    .res-price { display: flex; flex-direction: column; }
    .price-label { font-size: var(--text-xs); color: var(--text-muted); font-weight: 500; }
    .price-value { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }
  `],
})
export class MyReservationsComponent implements OnInit {
  private readonly rezervacijaService = inject(RezervacijaService);
  private readonly toast = inject(ToastService);

  readonly StatusRezervacije = StatusRezervacije;
  readonly loading = signal(true);
  readonly cancellingId = signal<number | null>(null);
  readonly activeTab = signal<string>('all');
  readonly reservations = signal<RezervacijaDto[]>([]);

  readonly tabs = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: String(StatusRezervacije.Kreirana) },
    { label: 'Active', value: String(StatusRezervacije.U_Toku) },
    { label: 'Completed', value: String(StatusRezervacije.Zavrsena) },
    { label: 'Cancelled', value: String(StatusRezervacije.Otkazana) },
  ];

  get filtered(): RezervacijaDto[] {
    const tab = this.activeTab();
    const all = this.reservations();
    if (tab === 'all') return all;
    return all.filter((r) => String(r.status) === tab);
  }

  countFor(tab: string): number {
    if (tab === 'all') return this.reservations().length;
    return this.reservations().filter((r) => String(r.status) === tab).length;
  }

  ngOnInit(): void {
    this.rezervacijaService.getMyReservations().subscribe({
      next: (data) => { this.reservations.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load reservations'); },
    });
  }

  cancel(r: RezervacijaDto): void {
    if (!confirm(`Cancel reservation for ${r.sobaNaziv}? This cannot be undone.`)) return;
    this.cancellingId.set(r.rezervacijaId);
    this.rezervacijaService.cancel(r.rezervacijaId).subscribe({
      next: () => {
        this.reservations.update((list) =>
          list.map((x) => x.rezervacijaId === r.rezervacijaId ? { ...x, status: StatusRezervacije.Otkazana } : x)
        );
        this.cancellingId.set(null);
        this.toast.success('Reservation cancelled');
      },
      error: () => { this.cancellingId.set(null); this.toast.error('Failed to cancel reservation'); },
    });
  }

  uslugeNazivi(r: RezervacijaDto): string {
    return r.usluge?.map((u) => u.naziv).join(', ') ?? '';
  }

  statusLabel(status: StatusRezervacije): string { return STATUS_LABELS[status] ?? 'Unknown'; }
  statusColor(status: StatusRezervacije): BadgeVariant { return (STATUS_COLORS[status] as BadgeVariant) ?? 'neutral'; }

  nights(r: RezervacijaDto): number {
    const ms = new Date(r.datumDo).getTime() - new Date(r.datumOd).getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }
}
