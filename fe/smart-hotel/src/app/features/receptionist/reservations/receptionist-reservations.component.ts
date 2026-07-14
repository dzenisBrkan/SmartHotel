import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RezervacijaService } from '../../../core/services/rezervacija.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  RezervacijaDto,
  StatusRezervacije,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../../core/models/rezervacija.models';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-receptionist-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reservations</h1>
          <p class="page-subtitle">Manage all hotel reservations.</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            class="input-base search-input"
            placeholder="Search by guest name…"
            [(ngModel)]="searchQuery"
            aria-label="Search reservations"
          />
        </div>
        <select class="input-base status-filter" [(ngModel)]="statusFilter" aria-label="Filter by status">
          <option value="">All Statuses</option>
          <option [value]="StatusRezervacije.Kreirana">Pending</option>
          <option [value]="StatusRezervacije.U_Toku">Active</option>
          <option [value]="StatusRezervacije.Zavrsena">Completed</option>
          <option [value]="StatusRezervacije.Otkazana">Cancelled</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Guests</th><th>Status</th><th>Amount</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6,7,8,9]; track j) {
                      <td><sh-skeleton height="1rem" [width]="j === 7 ? '70px' : '90px'"></sh-skeleton></td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (filtered().length === 0) {
          <sh-empty-state icon="📋" title="No reservations found" description="Try adjusting your search or filter."></sh-empty-state>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Guest</th>
                  <th scope="col">Room</th>
                  <th scope="col">Check-In</th>
                  <th scope="col">Check-Out</th>
                  <th scope="col">Guests</th>
                  <th scope="col">Status</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filtered(); track r.rezervacijaId) {
                  <tr>
                    <td class="id-cell">{{ r.rezervacijaId }}</td>
                    <td>
                      <div class="guest-cell">
                        <span class="guest-avatar" aria-hidden="true">{{ r.korisnikImePrezime.charAt(0) }}</span>
                        <span>{{ r.korisnikImePrezime }}</span>
                      </div>
                    </td>
                    <td>{{ r.sobaNaziv }}</td>
                    <td>{{ r.datumOd | date:'mediumDate' }}</td>
                    <td>{{ r.datumDo | date:'mediumDate' }}</td>
                    <td>{{ r.brojOsoba }}</td>
                    <td>
                      <sh-badge [variant]="statusColor(r.status)" [dot]="true">
                        {{ statusLabel(r.status) }}
                      </sh-badge>
                    </td>
                    <td class="amount-cell">€{{ r.ukupnaCijena | number:'1.0-0' }}</td>
                    <td>
                      <div class="actions">
                        @if (r.status === StatusRezervacije.Kreirana) {
                          <sh-button size="sm" variant="primary" [loading]="actionId() === r.rezervacijaId + '-ci'" (onClick)="checkIn(r)">
                            Check In
                          </sh-button>
                        }
                        @if (r.status === StatusRezervacije.U_Toku) {
                          <sh-button size="sm" variant="secondary" [loading]="actionId() === r.rezervacijaId + '-co'" (onClick)="checkOut(r)">
                            Check Out
                          </sh-button>
                        }
                        @if (r.status === StatusRezervacije.Kreirana || r.status === StatusRezervacije.U_Toku) {
                          <sh-button size="sm" variant="danger" [loading]="actionId() === r.rezervacijaId + '-c'" (onClick)="cancel(r)">
                            Cancel
                          </sh-button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            Showing {{ filtered().length }} of {{ reservations().length }} reservations
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .toolbar {
      display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .search-wrap { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; pointer-events: none; }
    .search-input { padding-left: 2.5rem; }
    .status-filter { width: 180px; flex-shrink: 0; }

    .table-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card);
    }
    .id-cell { color: var(--text-muted); font-size: var(--text-xs); font-weight: 600; }
    .guest-cell { display: flex; align-items: center; gap: 0.625rem; }
    .guest-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600));
      color: white; font-weight: 700; font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .amount-cell { font-weight: 700; color: var(--color-success); }
    .actions { display: flex; gap: 0.375rem; flex-wrap: nowrap; }
    .table-footer {
      padding: 0.875rem 1.5rem;
      border-top: 1px solid var(--border-color);
      font-size: var(--text-sm); color: var(--text-muted);
      background: var(--bg-surface-2);
    }
  `],
})
export class ReceptionistReservationsComponent implements OnInit {
  private readonly rezervacijaService = inject(RezervacijaService);
  private readonly toast = inject(ToastService);

  readonly StatusRezervacije = StatusRezervacije;
  readonly loading = signal(true);
  readonly actionId = signal<string | null>(null);
  readonly reservations = signal<RezervacijaDto[]>([]);

  searchQuery = '';
  statusFilter: StatusRezervacije | '' = '';

  readonly filtered = computed(() => {
    let list = this.reservations();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) list = list.filter((r) => r.korisnikImePrezime.toLowerCase().includes(q) || r.sobaNaziv.toLowerCase().includes(q));
    if (this.statusFilter !== '') list = list.filter((r) => r.status === Number(this.statusFilter));
    return list;
  });

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
        this.updateReservation(updated);
        this.actionId.set(null);
        this.toast.success('Checked in', `${r.korisnikImePrezime} has been checked in.`);
      },
      error: () => { this.actionId.set(null); this.toast.error('Check-in failed'); },
    });
  }

  checkOut(r: RezervacijaDto): void {
    this.actionId.set(r.rezervacijaId + '-co');
    this.rezervacijaService.checkOut(r.rezervacijaId).subscribe({
      next: (updated) => {
        this.updateReservation(updated);
        this.actionId.set(null);
        this.toast.success('Checked out', `${r.korisnikImePrezime} has been checked out.`);
      },
      error: () => { this.actionId.set(null); this.toast.error('Check-out failed'); },
    });
  }

  cancel(r: RezervacijaDto): void {
    if (!confirm(`Cancel reservation for ${r.korisnikImePrezime}?`)) return;
    this.actionId.set(r.rezervacijaId + '-c');
    this.rezervacijaService.cancel(r.rezervacijaId).subscribe({
      next: (updated) => {
        this.updateReservation(updated);
        this.actionId.set(null);
        this.toast.success('Reservation cancelled');
      },
      error: () => { this.actionId.set(null); this.toast.error('Cancellation failed'); },
    });
  }

  private updateReservation(updated: RezervacijaDto): void {
    this.reservations.update((list) =>
      list.map((r) => r.rezervacijaId === updated.rezervacijaId ? updated : r)
    );
  }

  statusLabel(status: StatusRezervacije): string { return STATUS_LABELS[status] ?? 'Unknown'; }
  statusColor(status: StatusRezervacije): BadgeVariant { return (STATUS_COLORS[status] as BadgeVariant) ?? 'neutral'; }
}
