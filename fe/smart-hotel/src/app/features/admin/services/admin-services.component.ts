import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UslugaService } from '../../../core/services/usluga.service';
import { ToastService } from '../../../core/services/toast.service';
import { DodatnaUslugaDto } from '../../../core/models/usluga.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ModalComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Hotel Services</h1>
          <p class="page-subtitle">{{ services().length }} additional services available</p>
        </div>
        <sh-button variant="primary" iconLeft="+" (onClick)="openCreate()">Add Service</sh-button>
      </div>

      <div class="services-grid">
        @if (loading()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="service-card">
              <sh-skeleton height="1.25rem" width="60%" style="margin-bottom:0.5rem"></sh-skeleton>
              <sh-skeleton height="1rem" width="40%"></sh-skeleton>
            </div>
          }
        } @else if (services().length === 0) {
          <div class="empty-wrap">
            <sh-empty-state icon="✨" title="No services yet" description="Add hotel services guests can add to their reservation.">
              <sh-button variant="primary" (onClick)="openCreate()" style="margin-top:1rem">Add Service</sh-button>
            </sh-empty-state>
          </div>
        } @else {
          @for (s of services(); track s.uslugaId) {
            <div class="service-card">
              <div class="service-icon" aria-hidden="true">✨</div>
              <div class="service-info">
                <h3 class="service-name">{{ s.naziv }}</h3>
                <p class="service-price">€{{ s.cijena | number:'1.2-2' }} / stay</p>
              </div>
              <div class="service-actions">
                <sh-button size="sm" variant="ghost" iconLeft="✏️" [iconOnly]="true" (onClick)="openEdit(s)"></sh-button>
                <sh-button size="sm" variant="danger" iconLeft="🗑️" [iconOnly]="true" [loading]="deletingId() === s.uslugaId" (onClick)="deleteService(s)"></sh-button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <sh-modal [open]="modalOpen()" [title]="editing() ? 'Edit Service' : 'Add Service'" maxWidth="420px" [showFooter]="true" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" id="service-form" novalidate>
        <div class="form-field">
          <label for="naziv" class="form-label">Service Name</label>
          <input id="naziv" type="text" class="input-base" formControlName="naziv" placeholder="e.g. Airport Transfer" [attr.aria-invalid]="isInvalid('naziv')" />
          @if (isInvalid('naziv')) { <p class="field-error">Required</p> }
        </div>
        <div class="form-field">
          <label for="cijena" class="form-label">Price (€)</label>
          <input id="cijena" type="number" class="input-base" formControlName="cijena" placeholder="0.00" min="0" step="0.01" [attr.aria-invalid]="isInvalid('cijena')" />
          @if (isInvalid('cijena')) { <p class="field-error">Required (min 0)</p> }
        </div>
      </form>
      <div modal-footer>
        <sh-button variant="ghost" (onClick)="closeModal()">Cancel</sh-button>
        <sh-button variant="primary" type="submit" form="service-form" [loading]="saving()" [disabled]="form.invalid">
          {{ editing() ? 'Save' : 'Create' }}
        </sh-button>
      </div>
    </sh-modal>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .empty-wrap { grid-column: 1 / -1; }

    .service-card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-xl); padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
    }
    .service-icon {
      font-size: 1.75rem; flex-shrink: 0;
      width: 48px; height: 48px;
      background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100));
      border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
    }
    .service-info { flex: 1; min-width: 0; }
    .service-name { font-weight: 700; font-size: var(--text-sm); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .service-price { font-size: var(--text-xs); color: var(--color-success); font-weight: 600; margin-top: 2px; }
    .service-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }

    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
  `],
})
export class AdminServicesComponent implements OnInit {
  private readonly uslugaService = inject(UslugaService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly editing = signal<DodatnaUslugaDto | null>(null);
  readonly services = signal<DodatnaUslugaDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    naziv: ['', Validators.required],
    cijena: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.uslugaService.getAll().subscribe({
      next: (data) => { this.services.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load services'); },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ naziv: '', cijena: 0 });
    this.modalOpen.set(true);
  }

  openEdit(s: DodatnaUslugaDto): void {
    this.editing.set(s);
    this.form.patchValue({ naziv: s.naziv, cijena: s.cijena });
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); this.editing.set(null); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue();
    const e = this.editing();
    const req$ = e ? this.uslugaService.update(e.uslugaId, val) : this.uslugaService.insert(val);
    req$.subscribe({
      next: (saved) => {
        if (e) {
          this.services.update((list) => list.map((s) => s.uslugaId === saved.uslugaId ? saved : s));
          this.toast.success('Service updated');
        } else {
          this.services.update((list) => [...list, saved]);
          this.toast.success('Service created');
        }
        this.saving.set(false);
        this.closeModal();
      },
      error: () => { this.saving.set(false); this.toast.error('Save failed'); },
    });
  }

  deleteService(s: DodatnaUslugaDto): void {
    if (!confirm(`Delete "${s.naziv}"?`)) return;
    this.deletingId.set(s.uslugaId);
    this.uslugaService.delete(s.uslugaId).subscribe({
      next: () => {
        this.services.update((list) => list.filter((x) => x.uslugaId !== s.uslugaId));
        this.deletingId.set(null);
        this.toast.success('Service deleted');
      },
      error: () => { this.deletingId.set(null); this.toast.error('Delete failed'); },
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }
}
