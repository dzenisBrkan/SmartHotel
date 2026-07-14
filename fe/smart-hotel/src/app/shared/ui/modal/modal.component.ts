import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'sh-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(-16px)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
  template: `
    @if (open) {
      <div class="modal-backdrop" [@backdropAnim] (click)="onBackdropClick()">
        <div
          class="modal-dialog"
          [@dialogAnim]
          [style.max-width]="maxWidth"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title-' + uid"
          (click)="$event.stopPropagation()"
        >
          @if (title) {
            <div class="modal-header">
              <h2 [id]="'modal-title-' + uid" class="modal-title">{{ title }}</h2>
              <button class="modal-close" (click)="closed.emit()" aria-label="Close modal">✕</button>
            </div>
          }
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; z-index: var(--z-modal);
      background: rgb(0 0 0 / 0.5);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .modal-dialog {
      background: var(--bg-surface);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      width: 100%;
      max-height: calc(100vh - 2rem);
      overflow-y: auto;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }
    .modal-close {
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      font-size: 1rem; padding: 4px;
      border-radius: var(--radius-sm);
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
    }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }
  `],
})
export class ModalComponent {
  @Input() open = false;
  @Input() title?: string;
  @Input() maxWidth = '560px';
  @Input() closeOnBackdrop = true;
  @Input() showFooter = false;
  @Output() closed = new EventEmitter<void>();

  readonly uid = Math.random().toString(36).slice(2, 9);

  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.closed.emit();
  }
}
