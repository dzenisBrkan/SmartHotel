import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold';

@Component({
  selector: 'sh-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'badge badge-' + variant">
      @if (dot) { <span class="dot" aria-hidden="true"></span> }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 10px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger  { background: #fee2e2; color: #991b1b; }
    .badge-info    { background: #dbeafe; color: #1e40af; }
    .badge-neutral { background: var(--color-neutral-100); color: var(--color-neutral-700); }
    .badge-gold    { background: #fef9c3; color: #78350f; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  `],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() dot = false;
}
