import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SobaService, VrstaSobeService } from '../../../core/services/soba.service';
import { SobaDto, SobaSearchObject } from '../../../core/models/soba.models';
import { VrstaSobeDto } from '../../../core/models/soba.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600',
];

@Component({
  selector: 'sh-rooms-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rooms-page page-enter">
      <!-- Page Header -->
      <div class="rooms-header">
        <div class="container">
          <h1 class="rooms-title">Rooms & Suites</h1>
          <p class="rooms-subtitle">Choose from our collection of {{ rooms().length }} exceptional rooms designed for your perfect stay.</p>
        </div>
      </div>

      <div class="container rooms-layout">
        <!-- Filters sidebar -->
        <aside class="filters-sidebar" aria-label="Room filters">
          <div class="filters-card">
            <h2 class="filters-title">Filter Rooms</h2>

            <div class="filter-group">
              <label for="search" class="filter-label">Search</label>
              <input
                id="search"
                type="search"
                class="input-base"
                [(ngModel)]="searchName"
                (ngModelChange)="onFilterChange()"
                placeholder="Search by name..."
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Room Type</label>
              <div class="type-options" role="radiogroup" aria-label="Room type filter">
                <button
                  class="type-option"
                  [class.active]="selectedTypeId() === null"
                  (click)="selectType(null)"
                >All Types</button>
                @for (type of roomTypes(); track type.vrstaId) {
                  <button
                    class="type-option"
                    [class.active]="selectedTypeId() === type.vrstaId"
                    (click)="selectType(type.vrstaId)"
                  >{{ type.naziv }}</button>
                }
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Availability</label>
              <div class="avail-options" role="radiogroup">
                <button class="type-option" [class.active]="availFilter() === null" (click)="availFilter.set(null); onFilterChange()">All</button>
                <button class="type-option" [class.active]="availFilter() === true" (click)="availFilter.set(true); onFilterChange()">Available</button>
                <button class="type-option" [class.active]="availFilter() === false" (click)="availFilter.set(false); onFilterChange()">Unavailable</button>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">Price Range</label>
              <div class="price-range">
                <span class="price-val">€{{ priceRange[0] }}</span>
                <span>—</span>
                <span class="price-val">€{{ priceRange[1] }}+</span>
              </div>
              <input type="range" min="0" max="500" [(ngModel)]="priceMax" (ngModelChange)="onFilterChange()" class="price-slider" aria-label="Maximum price" />
            </div>

            <sh-button variant="ghost" [fullWidth]="true" size="sm" (onClick)="resetFilters()">
              Reset Filters
            </sh-button>
          </div>
        </aside>

        <!-- Rooms grid -->
        <main class="rooms-main" id="main-content">
          <div class="rooms-toolbar">
            <p class="results-count" aria-live="polite">
              @if (loading()) { Loading rooms... }
              @else { Showing <strong>{{ filteredRooms().length }}</strong> rooms }
            </p>
            <div class="view-toggle" role="group" aria-label="View mode">
              <button [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" aria-label="Grid view">⊞</button>
              <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" aria-label="List view">☰</button>
            </div>
          </div>

          @if (loading()) {
            <div [class]="viewMode() === 'grid' ? 'rooms-grid' : 'rooms-list'">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="room-card-skeleton">
                  <sh-skeleton height="220px"></sh-skeleton>
                  <div style="padding: 1rem;">
                    <sh-skeleton height="1.25rem" width="70%" style="margin-bottom:0.5rem"></sh-skeleton>
                    <sh-skeleton height="0.875rem" width="40%"></sh-skeleton>
                  </div>
                </div>
              }
            </div>
          } @else if (filteredRooms().length === 0) {
            <sh-empty-state
              icon="🛏️"
              title="No rooms found"
              description="Try adjusting your filters to find available rooms."
            >
              <sh-button variant="primary" (onClick)="resetFilters()">Clear Filters</sh-button>
            </sh-empty-state>
          } @else {
            <div [class]="viewMode() === 'grid' ? 'rooms-grid' : 'rooms-list'">
              @for (room of filteredRooms(); track room.sobeId; let i = $index) {
                <article
                  class="room-card"
                  [class.room-card-list]="viewMode() === 'list'"
                  [routerLink]="['/rooms', room.sobeId]"
                  [attr.aria-label]="room.naziv + ', €' + room.cijena + ' per night'"
                >
                  <div class="room-img-wrap">
                    <img
                      [src]="getImage(i)"
                      [alt]="room.naziv"
                      loading="lazy"
                      class="room-img"
                    />
                    <sh-badge
                      [variant]="room.status ? 'success' : 'danger'"
                      class="room-avail-badge"
                    >{{ room.status ? 'Available' : 'Unavailable' }}</sh-badge>
                  </div>
                  <div class="room-body">
                    <div class="room-meta-row">
                      <sh-badge variant="neutral">{{ room.vrstaNaziv }}</sh-badge>
                      <span class="room-cap">👥 Up to {{ room.kapacitet }}</span>
                    </div>
                    <h3 class="room-name">{{ room.naziv }}</h3>
                    <p class="room-id">Room {{ room.sifra }}</p>
                    <div class="room-amenities">
                      <span>🛏️ Luxury Bed</span>
                      <span>📶 Free WiFi</span>
                      <span>❄️ Air Conditioning</span>
                    </div>
                    <div class="room-footer-row">
                      <div class="room-price">
                        <span class="price-num">€{{ room.cijena | number:'1.0-0' }}</span>
                        <span class="price-per">/ night</span>
                      </div>
                      <sh-button variant="primary" size="sm">View Room</sh-button>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .rooms-header {
      background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500));
      padding: 4rem 0;
      color: white;
    }
    .rooms-title {
      font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); font-weight: 700;
    }
    .rooms-subtitle { margin-top: 0.75rem; opacity: 0.85; font-size: var(--text-lg); }
    .rooms-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      padding-top: 2rem;
      padding-bottom: 4rem;
      @media (max-width: 1024px) { grid-template-columns: 1fr; }
    }
    .filters-sidebar {
      @media (max-width: 1024px) { display: none; }
    }
    .filters-card {
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-color);
      position: sticky; top: 5rem;
    }
    .filters-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem; }
    .filter-group { margin-bottom: 1.5rem; }
    .filter-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .type-options, .avail-options { display: flex; flex-direction: column; gap: 0.375rem; }
    .type-option {
      background: none; border: 1px solid var(--border-color);
      border-radius: var(--radius-md); padding: 0.5rem 0.875rem;
      font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary);
      cursor: pointer; text-align: left; transition: all var(--transition-fast);
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
      &.active { background: var(--color-primary-50); border-color: var(--color-primary-300); color: var(--color-primary-700); font-weight: 600; }
    }
    [data-theme='dark'] .type-option.active { background: rgb(37 80 245 / 0.15); color: var(--color-primary-300); border-color: var(--color-primary-500); }
    .price-range { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: var(--text-sm); }
    .price-val { font-weight: 600; color: var(--text-primary); }
    .price-slider { width: 100%; accent-color: var(--color-primary-500); }
    .rooms-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .results-count { font-size: var(--text-sm); color: var(--text-secondary); }
    .view-toggle {
      display: flex; gap: 0.25rem;
      button {
        background: none; border: 1px solid var(--border-color);
        border-radius: var(--radius-md); padding: 0.375rem 0.625rem;
        cursor: pointer; font-size: 1.125rem; color: var(--text-muted);
        transition: all var(--transition-fast);
        &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
        &.active { background: var(--color-primary-500); border-color: var(--color-primary-500); color: white; }
      }
    }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .rooms-list {
      display: flex; flex-direction: column; gap: 1rem;
    }
    .room-card-skeleton { border-radius: var(--radius-xl); overflow: hidden; background: var(--bg-surface); border: 1px solid var(--border-color); }
    .room-card {
      background: var(--bg-surface); border-radius: var(--radius-xl);
      border: 1px solid var(--border-color); box-shadow: var(--shadow-card);
      overflow: hidden; cursor: pointer;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-card-hover); .room-img { transform: scale(1.05); } }
    }
    .room-card-list {
      display: flex; flex-direction: row;
      .room-img-wrap { width: 260px; flex-shrink: 0; height: auto; }
      @media (max-width: 640px) { flex-direction: column; .room-img-wrap { width: 100%; } }
    }
    .room-img-wrap { position: relative; overflow: hidden; height: 200px; }
    .room-img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
    .room-avail-badge { position: absolute; top: 0.75rem; right: 0.75rem; }
    .room-body { padding: 1.25rem; flex: 1; }
    .room-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .room-cap { font-size: var(--text-xs); color: var(--text-secondary); }
    .room-name { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
    .room-id { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 0.75rem; }
    .room-amenities {
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
      span { font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-surface-2); padding: 3px 8px; border-radius: var(--radius-full); }
    }
    .room-footer-row { display: flex; align-items: center; justify-content: space-between; }
    .room-price { display: flex; align-items: baseline; gap: 3px; }
    .price-num { font-size: 1.375rem; font-weight: 700; color: var(--text-primary); }
    .price-per { font-size: var(--text-xs); color: var(--text-muted); }
  `],
})
export class RoomsListComponent implements OnInit {
  private readonly sobaService = inject(SobaService);
  private readonly vrstaSobeService = inject(VrstaSobeService);

  readonly rooms = signal<SobaDto[]>([]);
  readonly roomTypes = signal<VrstaSobeDto[]>([]);
  readonly loading = signal(true);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly selectedTypeId = signal<number | null>(null);
  readonly availFilter = signal<boolean | null>(null);

  searchName = '';
  priceMax = 500;
  readonly priceRange = [0, 500];

  readonly filteredRooms = computed(() => {
    let result = this.rooms();
    if (this.searchName) {
      const q = this.searchName.toLowerCase();
      result = result.filter((r) => r.naziv.toLowerCase().includes(q) || r.sifra.toLowerCase().includes(q));
    }
    if (this.selectedTypeId() !== null) {
      result = result.filter((r) => r.vrstaId === this.selectedTypeId());
    }
    if (this.availFilter() !== null) {
      result = result.filter((r) => r.status === this.availFilter());
    }
    if (this.priceMax < 500) {
      result = result.filter((r) => r.cijena <= this.priceMax);
    }
    return result;
  });

  ngOnInit(): void {
    this.sobaService.getAll().subscribe({
      next: (rooms) => { this.rooms.set(rooms); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.vrstaSobeService.getAll().subscribe({
      next: (types) => this.roomTypes.set(types),
    });
  }

  selectType(id: number | null): void {
    this.selectedTypeId.set(id);
  }

  onFilterChange(): void {}

  resetFilters(): void {
    this.searchName = '';
    this.selectedTypeId.set(null);
    this.availFilter.set(null);
    this.priceMax = 500;
  }

  getImage(index: number): string {
    return ROOM_IMAGES[index % ROOM_IMAGES.length];
  }
}
