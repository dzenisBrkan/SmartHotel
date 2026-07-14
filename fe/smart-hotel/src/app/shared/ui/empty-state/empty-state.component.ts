import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sh-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <div class="empty-illustration" aria-hidden="true">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      gap: 0.75rem;
    }
    .empty-illustration {
      font-size: 3.5rem;
      margin-bottom: 0.5rem;
      opacity: 0.7;
    }
    .empty-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }
    .empty-description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      max-width: 320px;
      line-height: 1.6;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = '🏨';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
}
