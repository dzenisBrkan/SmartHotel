import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'sh-toast-outlet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [@toastAnim]
          class="toast"
          [class]="'toast toast-' + toast.type"
          role="alert"
        >
          <span class="toast-icon" aria-hidden="true">{{ icons[toast.type] }}</span>
          <div class="toast-content">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
      width: calc(100vw - 2.5rem);
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-color);
      border-left-width: 4px;
    }
    .toast-success { border-left-color: var(--color-success); }
    .toast-error   { border-left-color: var(--color-danger); }
    .toast-warning { border-left-color: var(--color-warning); }
    .toast-info    { border-left-color: var(--color-info); }
    .toast-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: 1px; }
    .toast-content { flex: 1; min-width: 0; }
    .toast-title {
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--text-primary);
      line-height: 1.4;
    }
    .toast-message {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: 2px;
      line-height: 1.5;
    }
    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      line-height: 1;
      margin-top: 2px;
      &:hover { color: var(--text-primary); }
    }
  `],
})
export class ToastOutletComponent {
  readonly toastService = inject(ToastService);

  readonly icons: Record<Toast['type'], string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
}
