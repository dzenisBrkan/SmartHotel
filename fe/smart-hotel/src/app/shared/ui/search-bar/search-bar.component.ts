import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  OnInit,
  OnDestroy,
  effect,
  model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'sh-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar" [class.search-bar-sm]="size() === 'sm'">
      <span class="search-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        type="search"
        class="search-input"
        [placeholder]="placeholder()"
        [value]="query()"
        (input)="onInput($event)"
        [attr.aria-label]="placeholder()"
        autocomplete="off"
      />
      @if (query()) {
        <button class="clear-btn" (click)="clear()" aria-label="Clear search" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      position: relative; display: flex; align-items: center;
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); transition: border-color var(--transition-fast);
      &:focus-within { border-color: var(--color-primary-400); box-shadow: 0 0 0 3px var(--color-primary-100); }
    }
    .search-bar-sm .search-input { padding: 0.5rem 0.75rem 0.5rem 2.25rem; font-size: var(--text-sm); }
    .search-icon {
      position: absolute; left: 0.75rem; color: var(--text-muted);
      display: flex; align-items: center; pointer-events: none;
    }
    .search-input {
      width: 100%; background: transparent; border: none; outline: none;
      padding: 0.625rem 2.5rem 0.625rem 2.5rem;
      font-size: var(--text-sm); color: var(--text-primary);
      font-family: var(--font-body);
      &::placeholder { color: var(--text-muted); }
    }
    .clear-btn {
      position: absolute; right: 0.625rem; background: none; border: none;
      cursor: pointer; color: var(--text-muted); display: flex; align-items: center;
      border-radius: var(--radius-sm); padding: 2px;
      transition: color var(--transition-fast);
      &:hover { color: var(--text-primary); }
    }
  `],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  readonly placeholder = input('Search…');
  readonly size = input<'sm' | 'md'>('md');
  readonly debounce = input(300);

  readonly query = signal('');
  readonly searched = output<string>();

  private readonly destroy$ = new Subject<void>();
  private readonly input$ = new Subject<string>();

  ngOnInit(): void {
    this.input$
      .pipe(debounceTime(this.debounce()), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.query.set(q);
        this.searched.emit(q);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(e: Event): void {
    this.input$.next((e.target as HTMLInputElement).value);
  }

  clear(): void {
    this.query.set('');
    this.searched.emit('');
    this.input$.next('');
  }
}
