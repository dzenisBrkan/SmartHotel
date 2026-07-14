import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sh-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="rounded ? '9999px' : undefined"
      role="presentation"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    :host { display: block; }
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-neutral-200) 25%,
        var(--color-neutral-100) 50%,
        var(--color-neutral-200) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() rounded = false;
}
