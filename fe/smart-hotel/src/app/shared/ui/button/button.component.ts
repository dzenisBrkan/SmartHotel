import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'sh-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <span class="btn-spinner" aria-hidden="true"></span>
      }
      @if (iconLeft && !loading) {
        <span class="btn-icon" aria-hidden="true">{{ iconLeft }}</span>
      }
      <span [class.sr-only]="iconOnly">
        <ng-content></ng-content>
      </span>
      @if (iconRight && !loading) {
        <span class="btn-icon" aria-hidden="true">{{ iconRight }}</span>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: var(--font-body);
      font-weight: 600;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      text-decoration: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      &:focus-visible {
        outline: 2px solid var(--color-primary-500);
        outline-offset: 2px;
      }
    }

    /* Sizes */
    .btn-sm { padding: 0.375rem 0.875rem; font-size: var(--text-sm); }
    .btn-md { padding: 0.625rem 1.25rem; font-size: var(--text-base); }
    .btn-lg { padding: 0.875rem 1.75rem; font-size: var(--text-lg); }

    /* Variants */
    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
      color: white;
      box-shadow: 0 2px 8px rgb(37 80 245 / 0.3);
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgb(37 80 245 / 0.4); }
      &:active { transform: translateY(0); }
    }

    .btn-secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-color-strong);
      box-shadow: var(--shadow-sm);
      &:hover { background: var(--bg-surface-2); transform: translateY(-1px); }
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 2px 8px rgb(239 68 68 / 0.3);
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgb(239 68 68 / 0.4); }
    }

    .btn-gold {
      background: linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600));
      color: white;
      box-shadow: 0 2px 8px rgb(245 200 66 / 0.4);
      &:hover { transform: translateY(-1px); }
    }

    .btn-full { width: 100%; }

    .btn-spinner {
      display: inline-block;
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .sr-only {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0);
      white-space: nowrap; border: 0;
    }
  `],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() iconOnly = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return [
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.fullWidth ? 'btn-full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
