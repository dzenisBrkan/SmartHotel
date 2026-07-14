import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sh-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'spinner spinner-' + size" role="status" [attr.aria-label]="label">
      <span class="visually-hidden">{{ label }}</span>
    </div>
  `,
  styles: [`
    .spinner {
      display: inline-block;
      border-radius: 50%;
      border: 2px solid var(--border-color);
      border-top-color: var(--color-primary-500);
      animation: spin 0.7s linear infinite;
    }
    .spinner-sm  { width: 1rem; height: 1rem; }
    .spinner-md  { width: 1.5rem; height: 1.5rem; }
    .spinner-lg  { width: 2.5rem; height: 2.5rem; border-width: 3px; }
    .spinner-xl  { width: 3.5rem; height: 3.5rem; border-width: 4px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .visually-hidden {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
  `],
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() label = 'Loading...';
}
