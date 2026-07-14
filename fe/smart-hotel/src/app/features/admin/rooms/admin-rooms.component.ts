import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SobaService, VrstaSobeService } from '../../../core/services/soba.service';
import { ToastService } from '../../../core/services/toast.service';
import { SobaDto, SobaInsertRequest, SobaUpdateRequest } from '../../../core/models/soba.models';
import { VrstaSobeDto } from '../../../core/models/soba.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'sh-admin-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, BadgeComponent, ModalComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Rooms</h1>
          <p class="page-subtitle">{{ rooms().length }} rooms total</p>
        </div>
        <sh-button variant="primary" iconLeft="+" (onClick)="openCreate()">Add Room</sh-button>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-wrapper">
            <table class="table">
              <thead><tr><th>Room</th><th>Code</th><th>Type</th><th>Capacity</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6,7]; track j) { <td><sh-skeleton height="1rem"></sh-skeleton></td> }</tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (rooms().length === 0) {
          <sh-empty-state icon="🛏️" title="No rooms yet" description="Add your first room to get started.">
            <sh-button variant="primary" (onClick)="openCreate()" style="margin-top:1rem">Add Room</sh-button>
          </sh-empty-state>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Room</th>
                  <th scope="col">Code</th>
                  <th scope="col">Type</th>
                  <th scope="col">Capacity</th>
                  <th scope="col">Price / Night</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (room of rooms(); track room.sobeId) {
                  <tr>
                    <td class="room-name-cell">
                      <span class="room-icon" aria-hidden="true">🛏️</span>
                      {{ room.naziv }}
                    </td>
                    <td><code class="code-cell">{{ room.sifra }}</code></td>
                    <td>{{ room.vrstaNaziv }}</td>
                    <td>{{ room.kapacitet }} pax</td>
                    <td class="price-cell">€{{ room.cijena | number:'1.0-0' }}</td>
                    <td>
                      <sh-badge [variant]="room.status ? 'success' : 'danger'">
                        {{ room.status ? 'Available' : 'Unavailable' }}
                      </sh-badge>
                    </td>
                    <td>
                      <div class="row-actions">
                        <sh-button size="sm" variant="ghost" iconLeft="✏️" (onClick)="openEdit(room)">Edit</sh-button>
                        <sh-button size="sm" variant="danger" iconLeft="🗑️" [loading]="deletingId() === room.sobeId" (onClick)="deleteRoom(room)">Delete</sh-button>
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

    <!-- Create / Edit Modal -->
    <sh-modal
      [open]="modalOpen()"
      [title]="editingRoom() ? 'Edit Room' : 'Add New Room'"
      maxWidth="540px"
      [showFooter]="true"
      (closed)="closeModal()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate id="room-form">
        <div class="form-field">
          <label for="naziv" class="form-label">Room Name</label>
          <input id="naziv" type="text" class="input-base" formControlName="naziv" placeholder="e.g. Deluxe King Suite" [attr.aria-invalid]="isInvalid('naziv')" />
          @if (isInvalid('naziv')) { <p class="field-error">Required</p> }
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="sifra" class="form-label">Room Code</label>
            <input id="sifra" type="text" class="input-base" formControlName="sifra" placeholder="e.g. DLX-101" [attr.aria-invalid]="isInvalid('sifra')" />
            @if (isInvalid('sifra')) { <p class="field-error">Required</p> }
          </div>
          <div class="form-field">
            <label for="vrstaId" class="form-label">Room Type</label>
            <select id="vrstaId" class="input-base" formControlName="vrstaId" [attr.aria-invalid]="isInvalid('vrstaId')">
              <option value="">Select type…</option>
              @for (vt of roomTypes(); track vt.vrstaId) {
                <option [value]="vt.vrstaId">{{ vt.naziv }}</option>
              }
            </select>
            @if (isInvalid('vrstaId')) { <p class="field-error">Required</p> }
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="kapacitet" class="form-label">Capacity</label>
            <input id="kapacitet" type="number" class="input-base" formControlName="kapacitet" placeholder="2" min="1" [attr.aria-invalid]="isInvalid('kapacitet')" />
            @if (isInvalid('kapacitet')) { <p class="field-error">Required (min 1)</p> }
          </div>
          <div class="form-field">
            <label for="cijena" class="form-label">Price per Night (€)</label>
            <input id="cijena" type="number" class="input-base" formControlName="cijena" placeholder="150" min="0" [attr.aria-invalid]="isInvalid('cijena')" />
            @if (isInvalid('cijena')) { <p class="field-error">Required (min 0)</p> }
          </div>
        </div>
      </form>
      <div modal-footer>
        <sh-button variant="ghost" (onClick)="closeModal()">Cancel</sh-button>
        <sh-button variant="primary" type="submit" form="room-form" [loading]="saving()" [disabled]="form.invalid">
          {{ editingRoom() ? 'Save Changes' : 'Create Room' }}
        </sh-button>
      </div>
    </sh-modal>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .page-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700; color: var(--text-primary); }
    .page-subtitle { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 0.25rem; }
    .table-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-card); }
    .room-name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    .room-icon { font-size: 1rem; }
    .code-cell { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--bg-surface-2); padding: 2px 6px; border-radius: var(--radius-sm); }
    .price-cell { font-weight: 700; color: var(--color-success); }
    .row-actions { display: flex; gap: 0.375rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; @media (max-width:480px) { grid-template-columns: 1fr; } }
    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-bottom: 0.375rem; }
    .field-error { color: var(--color-danger); font-size: var(--text-xs); margin-top: 0.25rem; }
  `],
})
export class AdminRoomsComponent implements OnInit {
  private readonly sobaService = inject(SobaService);
  private readonly vrstaSobeService = inject(VrstaSobeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly editingRoom = signal<SobaDto | null>(null);
  readonly rooms = signal<SobaDto[]>([]);
  readonly roomTypes = signal<VrstaSobeDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    naziv: ['', Validators.required],
    sifra: ['', Validators.required],
    vrstaId: [0, [Validators.required, Validators.min(1)]],
    kapacitet: [1, [Validators.required, Validators.min(1)]],
    cijena: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.sobaService.getAll().subscribe({
      next: (data) => { this.rooms.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load rooms'); },
    });
    this.vrstaSobeService.getAll().subscribe({
      next: (data) => this.roomTypes.set(data),
      error: () => this.toast.error('Failed to load room types'),
    });
  }

  openCreate(): void {
    this.editingRoom.set(null);
    this.form.reset({ naziv: '', sifra: '', vrstaId: 0, kapacitet: 1, cijena: 0 });
    this.modalOpen.set(true);
  }

  openEdit(room: SobaDto): void {
    this.editingRoom.set(room);
    this.form.patchValue({ naziv: room.naziv, sifra: room.sifra, vrstaId: room.vrstaId, kapacitet: room.kapacitet, cijena: room.cijena });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingRoom.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue();
    const payload: SobaInsertRequest = { naziv: val.naziv, sifra: val.sifra, vrstaId: Number(val.vrstaId), kapacitet: val.kapacitet, cijena: val.cijena };
    const editing = this.editingRoom();

    const req$ = editing
      ? this.sobaService.update(editing.sobeId, payload as SobaUpdateRequest)
      : this.sobaService.insert(payload);

    req$.subscribe({
      next: (saved) => {
        if (editing) {
          this.rooms.update((list) => list.map((r) => r.sobeId === saved.sobeId ? saved : r));
          this.toast.success('Room updated');
        } else {
          this.rooms.update((list) => [...list, saved]);
          this.toast.success('Room created');
        }
        this.saving.set(false);
        this.closeModal();
      },
      error: () => { this.saving.set(false); this.toast.error(editing ? 'Failed to update room' : 'Failed to create room'); },
    });
  }

  deleteRoom(room: SobaDto): void {
    if (!confirm(`Delete room "${room.naziv}"? This cannot be undone.`)) return;
    this.deletingId.set(room.sobeId);
    this.sobaService.delete(room.sobeId).subscribe({
      next: () => {
        this.rooms.update((list) => list.filter((r) => r.sobeId !== room.sobeId));
        this.deletingId.set(null);
        this.toast.success('Room deleted');
      },
      error: () => { this.deletingId.set(null); this.toast.error('Failed to delete room'); },
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
