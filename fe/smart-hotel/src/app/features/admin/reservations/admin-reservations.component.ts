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
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'sh-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">All Reservations</h1>
          <p class="page-subtitle">{{ filtered().length }} of {{ reservations().length }} reservations</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            class="input-base search-input"
            placeholder="Search by guest or room…"
            [(ngModel)]="searchQuery"
            aria-label="Search reservations"
          />
        </div>
        <select class="input-base filter-select" [(ngModel)]="statusFilter" aria-label="Filter by status">
          <option value="">All Statuses</option>
          <option [value]="StatusRezervacije.Kreirana">Pending</option>
          <option [value]="StatusRezervacije.U_Toku">Active</option>
          <option [value]="StatusRezervacije.Zavrsena">Completed</option>
          <option [value]="StatusRezervacije.Otkazana">Cancelled</option>
        </select>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="mini-stat">
          <span class="mini-num">{{ countByStatus(StatusRezervacije.Kreirana) }}</span>
          <span class="mini-label">Pending</span>
        </div>
        <div class="mini-stat mini-active">
          <span class="mini-num">{{ countByStatus(StatusRezervacije.U_Toku) }}</span>
          <span class="mini-label">Active</span>
        </div>
        <div class="mini-stat mini-done">
          <span class="mini-num">{{ countByStatus(StatusRezervacije.Zavrsena) }}</span>
          <span class="mini-label">Completed</span>
        </div>
        <div class="mini-stat mini-cancelled">
          <span class="mini-num">{{ countByStatus(StatusRezervacije.Otkazana) }}</span>
          <span class="mini-label">Cancelled</span>
        </div>
        <div class="mini-stat mini-revenue">
          <span class="mini-num">€{{ totalRevenue() | number:'1.0-0' }}</span>
          <span class="mini-label">Total Revenue</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (i of [1,2,3,4,5,6]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6,7,8,9]; track j) { <td><sh-skeleton height="1rem"></sh-skeleton></td> }</tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (filtered().length === 0) {
          <sh-empty-state
            icon="📋"
            title="No reservations found"
            description="Try adjusting your search or filter."
          ></sh-empty-state>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Guest</th>
                  <th scope="col">Room</th>
                  <th scope="col">Check-in</th>
                  <th scope="col">Check-out</th>
                  <th scope="col">Guests</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filtered(); track r.rezervacijaId) {
                  <tr>
                    <td class="id-cell">#{{ r.rezervacijaId }}</td>
                    <td>
                      <div class="guest-cell">
                        <div class="guest-avatar" aria-hidden="true">
                          {{ r.korisnikImePrezime.charAt(0) }}
                        </div>
                        <span class="guest-name">{{ r.korisnikImePrezime }}</span>
                      </div>
                    </td>
                    <td class="room-cell">{{ r.sobaNaziv }}</td>
                    <td class="date-cell">{{ r.datumOd | date:'mediumDate' }}</td>
                    <td class="date-cell">{{ r.datumDo | date:'mediumDate' }}</td>
                    <td class="center-cell">{{ r.brojOsoba }}</td>
                    <td class="price-cell">€{{ r.ukupnaCijena | number:'1.0-0' }}</td>
                    <td>
                      <sh-badge [variant]="statusBadge(r.status)">
                        {{ STATUS_LABELS[r.status] }}
                      </sh-badge>
                    </td>
                    <td>
                      <div class="action-btns">
                        <sh-button size="sm" variant="ghost" (onClick)="openDetail(r)">View</sh-button>
                        @if (r.status === StatusRezervacije.Kreirana) {
                          <sh-button size="sm" variant="secondary" [loading]="updatingId() === r.rezervacijaId" (onClick)="confirm(r)">Confirm</sh-button>
                          <sh-button size="sm" variant="danger" [loading]="updatingId() === r.rezervacijaId" (onClick)="cancel(r)">Cancel</sh-button>
                        }
                        @if (r.status === StatusRezervacije.U_Toku) {
                          <sh-button size="sm" variant="secondary" [loading]="updatingId() === r.rezervacijaId" (onClick)="complete(r)">Complete</sh-button>
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

    <!-- Detail Modal -->
    @if (selectedReservation()) {
      <sh-modal
        [open]="detailOpen()"
        [title]="'Reservation #' + selectedReservation()!.rezervacijaId"
        (closed)="detailOpen.set(false)"
      >
        <div class="detail-grid">
          <div class="detail-section">
            <h3 class="detail-section-title">Guest</h3>
            <p class="detail-value">{{ selectedReservation()!.korisnikImePrezime }}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Room</h3>
            <p class="detail-value">{{ selectedReservation()!.sobaNaziv }}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Check-in</h3>
            <p class="detail-value">{{ selectedReservation()!.datumOd | date:'longDate' }}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Check-out</h3>
            <p class="detail-value">{{ selectedReservation()!.datumDo | date:'longDate' }}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Guests</h3>
            <p class="detail-value">{{ selectedReservation()!.brojOsoba }} person(s)</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section-title">Status</h3>
            <sh-badge [variant]="statusBadge(selectedReservation()!.status)">
              {{ STATUS_LABELS[selectedReservation()!.status] }}
            </sh-badge>
          </div>
          <div class="detail-section detail-full">
            <h3 class="detail-section-title">Total</h3>
            <p class="detail-value detail-price">€{{ selectedReservation()!.ukupnaCijena | number:'1.2-2' }}</p>
          </div>
          @if (selectedReservation()!.usluge.length > 0) {
            <div class="detail-section detail-full">
              <h3 class="detail-section-title">Add-on Services</h3>
              <ul class="services-list">
                @for (s of selectedReservation()!.usluge; track s.uslugaId) {
                  <li>{{ s.naziv }} — <strong>€{{ s.cijena | number:'1.2-2' }}</strong></li>
                }
              </ul>
            </div>
          }
          <div class="detail-section detail-full">
            <h3 class="detail-section-title">Created</h3>
            <p class="detail-value">{{ selectedReservation()!.datumKreiranja | date:'medium' }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <sh-button variant="secondary" (onClick)="detailOpen.set(false)">Close</sh-button>
        </div>
      </sh-modal>
    }
  `,
  styles: [`
    .page { max-width: 1280px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .search-wrap { position: relative; flex: 1; min-width: 240px; }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); pointer-events: none; }
    .search-input { padding-left: 2.25rem !important; }
    .filter-select { min-width: 160px; }

    .stats-row { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .mini-stat {
      flex: 1; min-width: 100px; background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;
      box-shadow: var(--shadow-sm);
    }
    .mini-num { font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); }
    .mini-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .mini-active .mini-num { color: var(--color-success); }
    .mini-done .mini-num { color: var(--color-info); }
    .mini-cancelled .mini-num { color: var(--color-danger); }
    .mini-revenue .mini-num { color: var(--color-primary-600); font-size: var(--text-lg); }

    .table-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card); }
    .id-cell { color: var(--text-muted); font-size: var(--text-xs); font-weight: 700; font-family: var(--font-mono); }
    .guest-cell { display: flex; align-items: center; gap: 0.625rem; }
    .guest-avatar {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600));
      color: #fff; font-weight: 700; font-size: 0.7rem;
      display: flex; align-items: center; justify-content: center;
    }
    .guest-name { font-weight: 600; font-size: var(--text-sm); }
    .room-cell { font-size: var(--text-sm); color: var(--text-secondary); }
    .date-cell { font-size: var(--text-sm); color: var(--text-secondary); white-space: nowrap; }
    .center-cell { text-align: center; }
    .price-cell { font-weight: 700; color: var(--color-primary-600); white-space: nowrap; }
    .action-btns { display: flex; gap: 0.375rem; flex-wrap: wrap; }
    .table-footer { padding: 0.875rem 1.5rem; border-top: 1px solid var(--border-color); font-size: var(--text-sm); color: var(--text-muted); background: var(--bg-surface-2); }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; margin-bottom: 1.5rem; }
    .detail-section { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-full { grid-column: 1 / -1; }
    .detail-section-title { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
    .detail-value { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
    .detail-price { font-size: var(--text-xl); font-weight: 700; color: var(--color-primary-600); }
    .services-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; font-size: var(--text-sm); color: var(--text-secondary); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
  `],
})
export class AdminReservationsComponent implements OnInit {
  private readonly svc = inject(RezervacijaService);
  private readonly toast = inject(ToastService);

  readonly StatusRezervacije = StatusRezervacije;
  readonly STATUS_LABELS = STATUS_LABELS;

  readonly loading = signal(true);
  readonly reservations = signal<RezervacijaDto[]>([]);
  readonly updatingId = signal<number | null>(null);
  readonly detailOpen = signal(false);
  readonly selectedReservation = signal<RezervacijaDto | null>(null);

  searchQuery = '';
  statusFilter: string = '';

  readonly filtered = computed(() => {
    let list = this.reservations();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((r) =>
        r.korisnikImePrezime.toLowerCase().includes(q) ||
        r.sobaNaziv.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter !== '') {
      const s = Number(this.statusFilter) as StatusRezervacije;
      list = list.filter((r) => r.status === s);
    }
    return list;
  });

  readonly totalRevenue = computed(() =>
    this.reservations()
      .filter((r) => r.status !== StatusRezervacije.Otkazana)
      .reduce((sum, r) => sum + r.ukupnaCijena, 0)
  );

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (data) => { this.reservations.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load reservations'); },
    });
  }

  countByStatus(status: StatusRezervacije): number {
    return this.reservations().filter((r) => r.status === status).length;
  }

  openDetail(r: RezervacijaDto): void {
    this.selectedReservation.set(r);
    this.detailOpen.set(true);
  }

  confirm(r: RezervacijaDto): void {
    this.updatingId.set(r.rezervacijaId);
    this.svc.update(r.rezervacijaId, { status: StatusRezervacije.U_Toku }).subscribe({
      next: (updated) => { this.updateLocal(updated); this.toast.success('Reservation confirmed'); },
      error: () => { this.updatingId.set(null); this.toast.error('Failed to confirm'); },
    });
  }

  cancel(r: RezervacijaDto): void {
    this.updatingId.set(r.rezervacijaId);
    this.svc.update(r.rezervacijaId, { status: StatusRezervacije.Otkazana }).subscribe({
      next: (updated) => { this.updateLocal(updated); this.toast.success('Reservation cancelled'); },
      error: () => { this.updatingId.set(null); this.toast.error('Failed to cancel'); },
    });
  }

  complete(r: RezervacijaDto): void {
    this.updatingId.set(r.rezervacijaId);
    this.svc.update(r.rezervacijaId, { status: StatusRezervacije.Zavrsena }).subscribe({
      next: (updated) => { this.updateLocal(updated); this.toast.success('Reservation completed'); },
      error: () => { this.updatingId.set(null); this.toast.error('Failed to complete'); },
    });
  }

  private updateLocal(updated: RezervacijaDto): void {
    this.reservations.update((list) =>
      list.map((r) => r.rezervacijaId === updated.rezervacijaId ? updated : r)
    );
    this.updatingId.set(null);
  }

  statusBadge(status: StatusRezervacije): BadgeVariant {
    return (STATUS_COLORS[status] ?? 'neutral') as BadgeVariant;
  }
}
