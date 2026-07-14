import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'sh-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="overlay"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        (click)="onOverlayClick($event)"
      >
        <div class="dialog" (click)="$event.stopPropagation()">
          <div class="dialog-icon" aria-hidden="true">{{ icon() }}</div>
          <h2 class="dialog-title">{{ title() }}</h2>
          <p class="dialog-message">{{ message() }}</p>
          <div class="dialog-actions">
            <sh-button variant="secondary" (onClick)="cancelled.emit()">
              {{ cancelLabel() }}
            </sh-button>
            <sh-button [variant]="confirmVariant()" [loading]="loading()" (onClick)="confirmed.emit()">
              {{ confirmLabel() }}
            </sh-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0; z-index: var(--z-modal, 1000);
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem; animation: fadeIn 150ms ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: var(--bg-surface); border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl); padding: 2rem;
      max-width: 420px; width: 100%; text-align: center;
      animation: slideUp 200ms ease;
    }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .dialog-icon { font-size: 2.5rem; margin-bottom: 1rem; line-height: 1; }
    .dialog-title { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .dialog-message { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; }
    .dialog-actions { display: flex; gap: 0.75rem; justify-content: center; }
  `],
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly title = input('Are you sure?');
  readonly message = input('This action cannot be undone.');
  readonly icon = input('⚠️');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirmVariant = input<'danger' | 'primary' | 'secondary'>('danger');
  readonly loading = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.cancelled.emit();
    }
  }
}
