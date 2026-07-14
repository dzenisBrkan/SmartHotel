import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sh-paginator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="paginator" aria-label="Pagination">
        <button
          class="page-btn page-nav"
          [disabled]="currentPage() <= 1"
          (click)="pageChange.emit(currentPage() - 1)"
          aria-label="Previous page"
        >
          ‹
        </button>

        @for (p of pages(); track p) {
          @if (p === -1) {
            <span class="page-ellipsis" aria-hidden="true">…</span>
          } @else {
            <button
              class="page-btn"
              [class.active]="p === currentPage()"
              [attr.aria-current]="p === currentPage() ? 'page' : undefined"
              (click)="pageChange.emit(p)"
            >
              {{ p }}
            </button>
          }
        }

        <button
          class="page-btn page-nav"
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChange.emit(currentPage() + 1)"
          aria-label="Next page"
        >
          ›
        </button>

        <span class="page-info">{{ currentPage() }} / {{ totalPages() }}</span>
      </nav>
    }
  `,
  styles: [`
    .paginator {
      display: flex; align-items: center; gap: 0.375rem;
      flex-wrap: wrap; justify-content: center;
    }
    .page-btn {
      min-width: 36px; height: 36px; padding: 0 0.5rem;
      border: 1px solid var(--border-color); border-radius: var(--radius-md);
      background: var(--bg-surface); color: var(--text-secondary);
      font-size: var(--text-sm); font-weight: 500; cursor: pointer;
      transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center;
      &:hover:not(:disabled):not(.active) { background: var(--bg-surface-2); color: var(--text-primary); border-color: var(--color-primary-300); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &.active { background: var(--color-primary-600); color: #fff; border-color: var(--color-primary-600); font-weight: 700; }
    }
    .page-nav { font-size: 1.1rem; }
    .page-ellipsis { color: var(--text-muted); padding: 0 0.25rem; }
    .page-info { font-size: var(--text-xs); color: var(--text-muted); margin-left: 0.5rem; white-space: nowrap; }
  `],
})
export class PaginatorComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly windowSize = input(2);

  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const w = this.windowSize();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [];
    pages.push(1);
    if (current - w > 2) pages.push(-1);
    for (let i = Math.max(2, current - w); i <= Math.min(total - 1, current + w); i++) pages.push(i);
    if (current + w < total - 1) pages.push(-1);
    pages.push(total);
    return pages;
  });
}
