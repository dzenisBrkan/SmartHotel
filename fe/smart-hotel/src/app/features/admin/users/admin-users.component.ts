import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ZaposlenikService } from '../../../core/services/zaposlenik.service';
import { ToastService } from '../../../core/services/toast.service';
import { KorisnikDto, ZaposlenikInsertRequest, ZaposlenikUloga } from '../../../core/models/korisnik.models';
import { BadgeComponent, BadgeVariant } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

type Tab = 'guests' | 'employees';

@Component({
  selector: 'sh-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BadgeComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Users & Staff</h1>
          <p class="page-subtitle">Manage hotel guests and employees.</p>
        </div>
        @if (activeTab() === 'employees') {
          <sh-button variant="primary" iconLeft="+" (onClick)="openAddModal()">Add Employee</sh-button>
        }
      </div>

      <!-- Tabs -->
      <div class="tabs" role="tablist" aria-label="User categories">
        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'guests'"
          class="tab-btn"
          [class.active]="activeTab() === 'guests'"
          (click)="switchTab('guests')"
        >
          👤 Guests <span class="tab-count">{{ guests().length }}</span>
        </button>
        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'employees'"
          class="tab-btn"
          [class.active]="activeTab() === 'employees'"
          (click)="switchTab('employees')"
        >
          🏨 Employees <span class="tab-count">{{ employees().length }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            class="input-base search-input"
            [placeholder]="activeTab() === 'guests' ? 'Search guests…' : 'Search employees…'"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            aria-label="Search users"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>User</th><th>Username</th><th>Email</th><th>Phone</th><th>Member Since</th><th>Status</th></tr></thead>
              <tbody>
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6]; track j) { <td><sh-skeleton height="1rem"></sh-skeleton></td> }</tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (displayList().length === 0) {
          <sh-empty-state
            [icon]="activeTab() === 'guests' ? '👤' : '🏨'"
            [title]="activeTab() === 'guests' ? 'No guests found' : 'No employees found'"
            [description]="activeTab() === 'guests' ? 'Guests appear here after registering.' : 'Add your first employee to get started.'"
          >
            @if (activeTab() === 'employees') {
              <sh-button variant="primary" (onClick)="openAddModal()" style="margin-top:1rem">Add Employee</sh-button>
            }
          </sh-empty-state>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Member Since</th>
                  <th scope="col">Status</th>
                  @if (activeTab() === 'employees') { <th scope="col">Actions</th> }
                </tr>
              </thead>
              <tbody>
                @for (u of displayList(); track u.korisnikId) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar" [class.avatar-employee]="activeTab() === 'employees'" aria-hidden="true">
                          {{ u.ime.charAt(0) }}{{ u.prezime.charAt(0) }}
                        </div>
                        <div>
                          <p class="user-name">{{ u.ime }} {{ u.prezime }}</p>
                          <div class="role-badges">
                            @for (role of u.roles; track role) {
                              <sh-badge [variant]="roleBadge(role)">{{ role }}</sh-badge>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><code class="username-cell">&#64;{{ u.korisnickoIme }}</code></td>
                    <td class="muted-cell">{{ u.email ?? '—' }}</td>
                    <td class="muted-cell">{{ u.telefon ?? '—' }}</td>
                    <td class="muted-cell">{{ u.datumRegistracije | date:'mediumDate' }}</td>
                    <td>
                      <sh-badge [variant]="u.status ? 'success' : 'neutral'" [dot]="true">
                        {{ u.status ? 'Active' : 'Inactive' }}
                      </sh-badge>
                    </td>
                    @if (activeTab() === 'employees') {
                      <td>
                        <sh-button
                          size="sm"
                          variant="danger"
                          [loading]="deletingId() === u.korisnikId"
                          (onClick)="deleteEmployee(u)"
                        >
                          Remove
                        </sh-button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            {{ displayList().length }} {{ activeTab() === 'guests' ? 'guests' : 'employees' }} ·
            {{ activeDisplayCount() }} active
          </div>
        }
      </div>
    </div>

    <!-- Add Employee Modal -->
    <sh-modal [open]="modalOpen()" title="Add Employee" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="submitEmployee()" novalidate>
        <div class="modal-fields">
          <div class="field-row">
            <div class="form-field">
              <label class="form-label" for="emp-ime">First Name *</label>
              <input id="emp-ime" type="text" class="input-base" formControlName="ime" placeholder="John" />
              @if (fc('ime').invalid && fc('ime').touched) {
                <p class="field-error">First name is required</p>
              }
            </div>
            <div class="form-field">
              <label class="form-label" for="emp-prezime">Last Name *</label>
              <input id="emp-prezime" type="text" class="input-base" formControlName="prezime" placeholder="Doe" />
              @if (fc('prezime').invalid && fc('prezime').touched) {
                <p class="field-error">Last name is required</p>
              }
            </div>
          </div>

          <div class="form-field">
            <label class="form-label" for="emp-username">Username *</label>
            <input id="emp-username" type="text" class="input-base" formControlName="korisnickoIme" placeholder="johndoe" autocomplete="off" />
            @if (fc('korisnickoIme').invalid && fc('korisnickoIme').touched) {
              <p class="field-error">Username is required</p>
            }
          </div>

          <div class="form-field">
            <label class="form-label" for="emp-password">Password *</label>
            <input id="emp-password" type="password" class="input-base" formControlName="lozinka" placeholder="Min. 6 characters" autocomplete="new-password" />
            @if (fc('lozinka').invalid && fc('lozinka').touched) {
              <p class="field-error">Password must be at least 6 characters</p>
            }
          </div>

          <div class="field-row">
            <div class="form-field">
              <label class="form-label" for="emp-email">Email</label>
              <input id="emp-email" type="email" class="input-base" formControlName="email" placeholder="john&#64;hotel.com" />
            </div>
            <div class="form-field">
              <label class="form-label" for="emp-telefon">Phone</label>
              <input id="emp-telefon" type="tel" class="input-base" formControlName="telefon" placeholder="+387 61 000 000" />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label" for="emp-uloga">Role *</label>
            <select id="emp-uloga" class="input-base" formControlName="uloga">
              <option value="Recepcioner">Receptionist</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <sh-button type="button" variant="secondary" (onClick)="closeModal()">Cancel</sh-button>
          <sh-button type="submit" variant="primary" [loading]="submitting()">Add Employee</sh-button>
        </div>
      </form>
    </sh-modal>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .tabs { display: flex; gap: 0.25rem; background: var(--bg-surface-2); border-radius: var(--radius-lg); padding: 0.25rem; width: fit-content; margin-bottom: 1rem; }
    .tab-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: var(--radius-md); border: none;
      background: transparent; cursor: pointer; font-size: var(--text-sm);
      font-weight: 500; color: var(--text-secondary); transition: all var(--transition-fast);
    }
    .tab-btn.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }
    .tab-count { background: var(--color-neutral-200); color: var(--text-secondary); padding: 1px 7px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 700; }
    .tab-btn.active .tab-count { background: var(--color-primary-100); color: var(--color-primary-700); }

    .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-wrap { position: relative; flex: 1; min-width: 240px; }
    .search-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.875rem; }
    .search-input { padding-left: 2.25rem !important; }

    .table-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card); }

    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700));
      color: #fff; font-weight: 700; font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center;
    }
    .avatar-employee { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .user-name { font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); margin-bottom: 2px; }
    .role-badges { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .username-cell { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--bg-surface-2); padding: 2px 6px; border-radius: var(--radius-sm); }
    .muted-cell { color: var(--text-secondary); font-size: var(--text-sm); }

    .table-footer { padding: 0.875rem 1.5rem; border-top: 1px solid var(--border-color); font-size: var(--text-sm); color: var(--text-muted); background: var(--bg-surface-2); }

    .modal-fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
    .field-error { font-size: var(--text-xs); color: var(--color-danger); margin-top: 0.125rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
  `],
})
export class AdminUsersComponent implements OnInit {
  private readonly svc = inject(ZaposlenikService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly activeTab = signal<Tab>('guests');
  readonly guests = signal<KorisnikDto[]>([]);
  readonly employees = signal<KorisnikDto[]>([]);
  readonly deletingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly submitting = signal(false);
  searchQuery = '';

  readonly displayList = computed(() => {
    const list = this.activeTab() === 'guests' ? this.guests() : this.employees();
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((u) =>
      `${u.ime} ${u.prezime} ${u.korisnickoIme} ${u.email ?? ''}`.toLowerCase().includes(q)
    );
  });

  readonly activeDisplayCount = computed(() =>
    this.displayList().filter((u) => !!u.status).length
  );

  readonly form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    korisnickoIme: ['', Validators.required],
    lozinka: ['', [Validators.required, Validators.minLength(6)]],
    email: [''],
    telefon: [''],
    uloga: ['Recepcioner' as ZaposlenikUloga, Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    let guestsDone = false;
    let empDone = false;
    const tryFinish = () => { if (guestsDone && empDone) this.loading.set(false); };

    this.svc.getGuests().subscribe({
      next: (d) => { this.guests.set(d); guestsDone = true; tryFinish(); },
      error: () => { this.toast.error('Failed to load guests'); guestsDone = true; tryFinish(); },
    });
    this.svc.getEmployees().subscribe({
      next: (d) => { this.employees.set(d); empDone = true; tryFinish(); },
      error: () => { this.toast.error('Failed to load employees'); empDone = true; tryFinish(); },
    });
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.searchQuery = '';
  }

  onSearch(): void { /* displayList computed reactive */ }

  openAddModal(): void {
    this.form.reset({ uloga: 'Recepcioner' });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  submitEmployee(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    const req: ZaposlenikInsertRequest = {
      ime: v.ime!,
      prezime: v.prezime!,
      korisnickoIme: v.korisnickoIme!,
      lozinka: v.lozinka!,
      email: v.email || undefined,
      telefon: v.telefon || undefined,
      uloga: v.uloga as ZaposlenikUloga,
    };
    this.svc.insert(req).subscribe({
      next: (emp) => {
        this.employees.update((list) => [emp, ...list]);
        this.submitting.set(false);
        this.closeModal();
        this.toast.success(`Employee ${emp.ime} ${emp.prezime} added`);
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Failed to add employee');
      },
    });
  }

  deleteEmployee(u: KorisnikDto): void {
    if (!confirm(`Remove ${u.ime} ${u.prezime}? This cannot be undone.`)) return;
    this.deletingId.set(u.korisnikId);
    this.svc.delete(u.korisnikId).subscribe({
      next: () => {
        this.employees.update((list) => list.filter((e) => e.korisnikId !== u.korisnikId));
        this.deletingId.set(null);
        this.toast.success('Employee removed');
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Failed to remove employee');
      },
    });
  }

  fc(name: string) { return this.form.get(name)!; }

  roleBadge(role: string): BadgeVariant {
    if (role === 'Admin') return 'warning';
    if (role === 'Recepcioner') return 'info';
    return 'success';
  }
}


