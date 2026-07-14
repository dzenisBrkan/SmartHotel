import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VrstaSobeService } from '../../../core/services/soba.service';
import { ToastService } from '../../../core/services/toast.service';
import { VrstaSobeDto } from '../../../core/models/soba.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-admin-room-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ModalComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Room Types</h1>
          <p class="page-subtitle">{{ types().length }} types configured</p>
        </div>
        <sh-button variant="primary" iconLeft="+" (onClick)="openCreate()">Add Type</sh-button>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>Name</th><th>Description</th><th>Capacity</th><th>Base Price</th><th>Actions</th></tr></thead>
              <tbody>
                @for (i of [1,2,3]; track i) {
                  <tr>@for (j of [1,2,3,4,5]; track j) { <td><sh-skeleton height="1rem"></sh-skeleton></td> }</tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (types().length === 0) {
          <sh-empty-state icon="🏷️" title="No room types" description="Create your first room type.">
            <sh-button variant="primary" (onClick)="openCreate()" style="margin-top:1rem">Add Type</sh-button>
          </sh-empty-state>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Capacity</th>
                  <th scope="col">Base Price</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (t of types(); track t.vrstaId) {
                  <tr>
                    <td class="type-name">{{ t.naziv }}</td>
                    <td class="desc-cell">{{ t.opis }}</td>
                    <td>{{ t.kapacitet }} pax</td>
                    <td class="price-cell">€{{ t.cijena | number:'1.0-0' }}</td>
                    <td>
                      <div class="row-actions">
                        <sh-button size="sm" variant="ghost" iconLeft="✏️" (onClick)="openEdit(t)">Edit</sh-button>
                        <sh-button size="sm" variant="danger" iconLeft="🗑️" [loading]="deletingId() === t.vrstaId" (onClick)="deleteType(t)">Delete</sh-button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <sh-modal [open]="modalOpen()" [title]="editing() ? 'Edit Room Type' : 'Add Room Type'" maxWidth="500px" [showFooter]="true" (closed)="closeModal()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate id="type-form">
        <div class="form-field">
          <label for="naziv" class="form-label">Type Name</label>
          <input id="naziv" type="text" class="input-base" formControlName="naziv" placeholder="e.g. Deluxe Suite" [attr.aria-invalid]="isInvalid('naziv')" />
          @if (isInvalid('naziv')) { <p class="field-error">Required</p> }
        </div>
        <div class="form-field">
          <label for="opis" class="form-label">Description</label>
          <textarea id="opis" class="input-base textarea" formControlName="opis" rows="3" placeholder="Brief description…" [attr.aria-invalid]="isInvalid('opis')"></textarea>
          @if (isInvalid('opis')) { <p class="field-error">Required</p> }
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="kapacitet" class="form-label">Capacity</label>
            <input id="kapacitet" type="number" class="input-base" formControlName="kapacitet" min="1" [attr.aria-invalid]="isInvalid('kapacitet')" />
            @if (isInvalid('kapacitet')) { <p class="field-error">Required</p> }
          </div>
          <div class="form-field">
            <label for="cijena" class="form-label">Base Price (€)</label>
            <input id="cijena" type="number" class="input-base" formControlName="cijena" min="0" [attr.aria-invalid]="isInvalid('cijena')" />
            @if (isInvalid('cijena')) { <p class="field-error">Required</p> }
          </div>
        </div>
      </form>
      <div modal-footer>
        <sh-button variant="ghost" (onClick)="closeModal()">Cancel</sh-button>
        <sh-button variant="primary" type="submit" form="type-form" [loading]="saving()" [disabled]="form.invalid">
          {{ editing() ? 'Save Changes' : 'Create Type' }}
        </sh-button>
      </div>
    </sh-modal>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }
    .table-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card); }
    .type-name { font-weight: 700; }
    .desc-cell { color: var(--text-secondary); font-size: var(--text-sm); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price-cell { font-weight: 700; color: var(--color-success); }
    .row-actions { display: flex; gap: 0.375rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; @media (max-width:480px) { grid-template-columns: 1fr; } }
    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
    .textarea { resize: vertical; font-family: var(--font-body); }
  `],
})
export class AdminRoomTypesComponent implements OnInit {
  private readonly vrstaSobeService = inject(VrstaSobeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly editing = signal<VrstaSobeDto | null>(null);
  readonly types = signal<VrstaSobeDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    naziv: ['', Validators.required],
    opis: ['', Validators.required],
    kapacitet: [1, [Validators.required, Validators.min(1)]],
    cijena: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.vrstaSobeService.getAll().subscribe({
      next: (data) => { this.types.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load room types'); },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ naziv: '', opis: '', kapacitet: 1, cijena: 0 });
    this.modalOpen.set(true);
  }

  openEdit(t: VrstaSobeDto): void {
    this.editing.set(t);
    this.form.patchValue(t);
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); this.editing.set(null); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue();
    const e = this.editing();
    const req$ = e ? this.vrstaSobeService.update(e.vrstaId, val) : this.vrstaSobeService.insert(val);
    req$.subscribe({
      next: (saved) => {
        if (e) {
          this.types.update((list) => list.map((t) => t.vrstaId === saved.vrstaId ? saved : t));
          this.toast.success('Room type updated');
        } else {
          this.types.update((list) => [...list, saved]);
          this.toast.success('Room type created');
        }
        this.saving.set(false);
        this.closeModal();
      },
      error: () => { this.saving.set(false); this.toast.error('Save failed'); },
    });
  }

  deleteType(t: VrstaSobeDto): void {
    if (!confirm(`Delete "${t.naziv}"?`)) return;
    this.deletingId.set(t.vrstaId);
    this.vrstaSobeService.delete(t.vrstaId).subscribe({
      next: () => {
        this.types.update((list) => list.filter((x) => x.vrstaId !== t.vrstaId));
        this.deletingId.set(null);
        this.toast.success('Room type deleted');
      },
      error: () => { this.deletingId.set(null); this.toast.error('Delete failed'); },
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }
}
