import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SobaService } from '../../../core/services/soba.service';
import { RecenzijaService } from '../../../core/services/recenzija.service';
import { RezervacijaService } from '../../../core/services/rezervacija.service';
import { UslugaService } from '../../../core/services/usluga.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SobaDto } from '../../../core/models/soba.models';
import { RecenzijaDto } from '../../../core/models/recenzija.models';
import { DodatnaUslugaDto } from '../../../core/models/usluga.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800',
];

@Component({
  selector: 'sh-room-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    ButtonComponent, BadgeComponent, SkeletonComponent, SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-enter">
      @if (loading()) {
        <div class="detail-loading">
          <sh-spinner size="xl"></sh-spinner>
        </div>
      } @else if (!room()) {
        <div class="not-found">
          <p>🏨 Room not found.</p>
          <sh-button variant="primary" routerLink="/rooms">Back to Rooms</sh-button>
        </div>
      } @else {
        <!-- Hero Images -->
        <section class="detail-hero" aria-label="Room gallery">
          <div class="hero-main">
            <img
              [src]="ROOM_IMAGES[activeImg()]"
              [alt]="room()!.naziv"
              class="hero-main-img"
              (click)="openLightbox()"
            />
            <div class="hero-nav" aria-label="Gallery navigation">
              <button class="hero-nav-btn" (click)="prevImg()" aria-label="Previous image">‹</button>
              <span class="hero-nav-counter" aria-live="polite">{{ activeImg() + 1 }} / {{ ROOM_IMAGES.length }}</span>
              <button class="hero-nav-btn" (click)="nextImg()" aria-label="Next image">›</button>
            </div>
          </div>
          <div class="hero-thumbs" role="list" aria-label="Gallery thumbnails">
            @for (img of ROOM_IMAGES; track img; let i = $index) {
              <button
                role="listitem"
                class="hero-thumb-btn"
                [class.active]="activeImg() === i"
                (click)="activeImg.set(i)"
                [attr.aria-label]="'View image ' + (i + 1)"
                [attr.aria-current]="activeImg() === i"
              >
                <img [src]="img" alt="" class="hero-thumb-img" />
              </button>
            }
          </div>
        </section>

        <!-- Lightbox -->
        @if (lightboxOpen()) {
          <div
            class="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Room image lightbox"
            (click)="closeLightbox()"
            (keydown.escape)="closeLightbox()"
            (keydown.arrowLeft)="prevImg()"
            (keydown.arrowRight)="nextImg()"
            tabindex="0"
          >
            <button class="lightbox-close" (click)="closeLightbox()" aria-label="Close lightbox">✕</button>
            <button class="lightbox-prev" (click)="prevImg(); $event.stopPropagation()" aria-label="Previous">‹</button>
            <img
              [src]="ROOM_IMAGES[activeImg()]"
              [alt]="room()!.naziv"
              class="lightbox-img"
              (click)="$event.stopPropagation()"
            />
            <button class="lightbox-next" (click)="nextImg(); $event.stopPropagation()" aria-label="Next">›</button>
          </div>
        }

        <div class="container detail-layout">
          <!-- Left column -->
          <div class="detail-main">
            <div class="detail-header">
              <div class="detail-meta">
                <sh-badge variant="neutral">{{ room()!.vrstaNaziv }}</sh-badge>
                <sh-badge [variant]="room()!.status ? 'success' : 'danger'">
                  {{ room()!.status ? 'Available' : 'Unavailable' }}
                </sh-badge>
                <span class="room-code-label">Room {{ room()!.sifra }}</span>
              </div>
              <h1 class="detail-title">{{ room()!.naziv }}</h1>
              <div class="detail-rating">
                <div class="stars-lg" aria-label="Rating: 4.8 out of 5">★★★★★</div>
                <span class="rating-count">({{ reviews().length }} reviews)</span>
                <span class="rating-num">4.8</span>
              </div>
            </div>

            <!-- Key Facts -->
            <div class="key-facts">
              <div class="fact">
                <span class="fact-icon" aria-hidden="true">👥</span>
                <span class="fact-label">Capacity</span>
                <span class="fact-value">{{ room()!.kapacitet }} Guests</span>
              </div>
              <div class="fact">
                <span class="fact-icon" aria-hidden="true">🛏️</span>
                <span class="fact-label">Bed</span>
                <span class="fact-value">King Size</span>
              </div>
              <div class="fact">
                <span class="fact-icon" aria-hidden="true">📐</span>
                <span class="fact-label">Size</span>
                <span class="fact-value">45 m²</span>
              </div>
              <div class="fact">
                <span class="fact-icon" aria-hidden="true">🌅</span>
                <span class="fact-label">View</span>
                <span class="fact-value">City View</span>
              </div>
            </div>

            <!-- Description -->
            <div class="detail-section">
              <h2 class="detail-section-title">About This Room</h2>
              <p class="detail-desc">
                Experience unparalleled luxury in our {{ room()!.vrstaNaziv }} room. Featuring sophisticated
                décor, premium bedding, and all the amenities you need for a perfect stay. The room offers a
                stunning view and is fully equipped with modern technology to ensure your comfort and convenience.
              </p>
            </div>

            <!-- Amenities -->
            <div class="detail-section">
              <h2 class="detail-section-title">Room Amenities</h2>
              <div class="amenities-grid" role="list">
                @for (amenity of amenities; track amenity.label) {
                  <div class="amenity-item" role="listitem">
                    <span class="amenity-icon" aria-hidden="true">{{ amenity.icon }}</span>
                    <span class="amenity-label">{{ amenity.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Add-on Services -->
            @if (addOnServices().length > 0) {
              <div class="detail-section">
                <h2 class="detail-section-title">Optional Add-on Services</h2>
                <div class="services-list" role="list">
                  @for (svc of addOnServices(); track svc.uslugaId) {
                    <label class="service-option" role="listitem">
                      <input
                        type="checkbox"
                        class="service-check"
                        [value]="svc.uslugaId"
                        [checked]="isServiceSelected(svc.uslugaId)"
                        (change)="toggleService(svc.uslugaId)"
                      />
                      <span class="service-info">
                        <span class="service-name">{{ svc.naziv }}</span>
                        <span class="service-price">+€{{ svc.cijena | number:'1.2-2' }}</span>
                      </span>
                    </label>
                  }
                </div>
              </div>
            }

            <!-- Reviews -->
            <div class="detail-section">
              <div class="section-header-row">
                <h2 class="detail-section-title">Guest Reviews</h2>
                @if (reviews().length > 0) {
                  <div class="avg-rating">
                    <span class="avg-stars" aria-hidden="true">★</span>
                    <span class="avg-num">{{ avgRating() | number:'1.1-1' }}</span>
                    <span class="avg-count">({{ reviews().length }})</span>
                  </div>
                }
              </div>
              @if (loadingReviews()) {
                <div style="padding: 1rem;">
                  @for (i of [1,2,3]; track i) {
                    <sh-skeleton height="80px" style="margin-bottom:0.75rem;display:block"></sh-skeleton>
                  }
                </div>
              } @else if (reviews().length === 0) {
                <div class="no-reviews">
                  <div class="no-reviews-icon" aria-hidden="true">💬</div>
                  <p>No reviews yet. Be the first to review this room!</p>
                </div>
              } @else {
                <div class="reviews-list" role="list">
                  @for (review of reviews(); track review.recenzijeId) {
                    <article class="review-card" role="listitem">
                      <div class="review-header">
                        <div class="reviewer-avatar" aria-hidden="true">
                          {{ review.korisnikImePrezime.charAt(0) }}
                        </div>
                        <div class="reviewer-info">
                          <p class="reviewer-name">{{ review.korisnikImePrezime }}</p>
                          <p class="review-date">{{ review.datum | date:'mediumDate' }}</p>
                        </div>
                        <div class="review-stars-sm" [attr.aria-label]="review.ocjena + ' out of 5 stars'">
                          @for (s of getStars(review.ocjena); track $index) {
                            <span [class.filled]="s === 'full'">★</span>
                          }
                        </div>
                      </div>
                      <p class="review-text">{{ review.komentar }}</p>
                    </article>
                  }
                </div>
              }

              <!-- Add Review Form -->
              @if (auth.isAuthenticated()) {
                <div class="add-review">
                  <h3 class="add-review-title">Write a Review</h3>
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" novalidate>
                    <div class="star-picker" role="group" aria-label="Select rating">
                      @for (n of [1,2,3,4,5]; track n) {
                        <button
                          type="button"
                          class="star-pick-btn"
                          [class.selected]="reviewForm.get('ocjena')!.value >= n"
                          (click)="reviewForm.get('ocjena')!.setValue(n)"
                          [attr.aria-label]="n + ' star' + (n > 1 ? 's' : '')"
                        >★</button>
                      }
                    </div>
                    <div class="form-field" style="margin-top:0.75rem">
                      <label for="review-comment" class="form-label">Your Review</label>
                      <textarea
                        id="review-comment"
                        class="input-base"
                        formControlName="komentar"
                        rows="3"
                        placeholder="Share your experience with this room…"
                        style="resize:vertical"
                      ></textarea>
                      @if (reviewForm.get('komentar')!.invalid && reviewForm.get('komentar')!.touched) {
                        <p class="field-error" role="alert">Please write at least 10 characters</p>
                      }
                    </div>
                    <sh-button type="submit" variant="primary" [loading]="submittingReview()">
                      Submit Review
                    </sh-button>
                  </form>
                </div>
              }
            </div>
          </div>

          <!-- Booking Widget -->
          <aside class="booking-widget-wrap" aria-label="Booking form">
            <div class="booking-widget">
              <div class="widget-price">
                <span class="widget-price-num">€{{ room()!.cijena | number:'1.0-0' }}</span>
                <span class="widget-price-per">/ night</span>
              </div>
              <div class="stars-sm" aria-hidden="true">★★★★★ <span style="color:var(--text-muted);font-size:.8rem">(4.8)</span></div>

              <form [formGroup]="bookingForm" (ngSubmit)="onBook()" novalidate class="booking-form">
                <div class="date-fields">
                  <div class="form-field">
                    <label for="checkIn" class="form-label">Check-in</label>
                    <input id="checkIn" type="date" class="input-base" formControlName="datumOd" [min]="today" />
                  </div>
                  <div class="form-field">
                    <label for="checkOut" class="form-label">Check-out</label>
                    <input id="checkOut" type="date" class="input-base" formControlName="datumDo" [min]="minCheckOut" />
                  </div>
                </div>

                <div class="form-field">
                  <label for="guests" class="form-label">Guests</label>
                  <select id="guests" class="input-base" formControlName="brojOsoba">
                    @for (n of guestOptions; track n) {
                      <option [value]="n">{{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}</option>
                    }
                  </select>
                </div>

                @if (bookingNights() > 0) {
                  <div class="price-breakdown" aria-live="polite">
                    <div class="breakdown-row">
                      <span>€{{ room()!.cijena | number:'1.0-0' }} × {{ bookingNights() }} night{{ bookingNights() > 1 ? 's' : '' }}</span>
                      <span>€{{ (room()!.cijena * bookingNights()) | number:'1.2-2' }}</span>
                    </div>
                    @for (svc of selectedServiceObjects(); track svc.uslugaId) {
                      <div class="breakdown-row">
                        <span>{{ svc.naziv }}</span>
                        <span>+€{{ svc.cijena | number:'1.2-2' }}</span>
                      </div>
                    }
                    <div class="breakdown-divider"></div>
                    <div class="breakdown-total">
                      <span>Total</span>
                      <span>€{{ totalPrice() | number:'1.2-2' }}</span>
                    </div>
                  </div>
                }

                @if (auth.isAuthenticated()) {
                  <sh-button type="submit" [loading]="bookingLoading()" [fullWidth]="true" size="lg" variant="gold">
                    Reserve Now
                  </sh-button>
                } @else {
                  <sh-button variant="primary" [fullWidth]="true" size="lg" routerLink="/auth/login">
                    Sign in to Book
                  </sh-button>
                  <p class="signin-hint">Create a free account to make reservations</p>
                }
              </form>
            </div>

            <!-- Policies -->
            <div class="policies-card">
              <h3 class="policies-title">Policies</h3>
              <ul class="policies-list">
                <li>🕒 Check-in: 3:00 PM – 11:00 PM</li>
                <li>🕐 Check-out: by 12:00 PM</li>
                <li>🚭 Non-smoking room</li>
                <li>🐾 Pet-free room</li>
                <li>❌ Free cancellation 24h before check-in</li>
              </ul>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-loading, .not-found {
      min-height: 60vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1.5rem; text-align: center;
    }
    .not-found p { font-size: 1.5rem; color: var(--text-secondary); }
    .detail-hero {
      display: grid; grid-template-columns: 2fr 1fr;
      height: 500px; gap: 4px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .hero-main { overflow: hidden; position: relative; cursor: zoom-in; }
    .hero-main-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; &:hover { transform: scale(1.02); } }
    .hero-nav {
      position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
      border-radius: var(--radius-full); padding: 0.375rem 0.75rem;
    }
    .hero-nav-btn {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 1.25rem; line-height: 1; padding: 0 0.25rem;
      transition: opacity var(--transition-fast);
      &:hover { opacity: 0.7; }
    }
    .hero-nav-counter { color: rgba(255,255,255,0.9); font-size: var(--text-xs); font-weight: 600; white-space: nowrap; }
    .hero-thumbs { display: grid; grid-template-rows: repeat(4, 1fr); gap: 4px; overflow: hidden; @media (max-width: 768px) { display: none; } }
    .hero-thumb-btn {
      border: none; padding: 0; cursor: pointer; overflow: hidden; position: relative;
      border: 2px solid transparent; transition: border-color var(--transition-fast);
      &.active { border-color: var(--color-primary-400); }
      &:hover:not(.active) { opacity: 0.85; }
    }
    .hero-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .lightbox {
      position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 200ms ease; outline: none;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lightbox-img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: var(--radius-lg); box-shadow: var(--shadow-2xl); }
    .lightbox-close {
      position: fixed; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.15);
      border: none; color: #fff; font-size: 1.5rem; width: 44px; height: 44px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast);
      &:hover { background: rgba(255,255,255,0.25); }
    }
    .lightbox-prev, .lightbox-next {
      position: fixed; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.12); border: none; color: #fff;
      font-size: 2.5rem; width: 56px; height: 80px; border-radius: var(--radius-lg);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background var(--transition-fast);
      &:hover { background: rgba(255,255,255,0.22); }
    }
    .lightbox-prev { left: 1rem; }
    .lightbox-next { right: 1rem; }
    .detail-layout {
      display: grid; grid-template-columns: 1fr 380px;
      gap: 3rem; padding-block: 3rem;
      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }
    .detail-header { margin-bottom: 2rem; }
    .detail-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .room-code-label { font-size: var(--text-xs); color: var(--text-muted); }
    .detail-title { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
    .detail-rating { display: flex; align-items: center; gap: 0.5rem; }
    .stars-lg { color: var(--color-gold-500); font-size: 1.125rem; letter-spacing: 2px; }
    .rating-count { font-size: var(--text-sm); color: var(--text-secondary); }
    .rating-num { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); }
    .key-facts {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1rem; margin-bottom: 2.5rem;
      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }
    .fact {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      padding: 1rem; background: var(--bg-surface); border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
    }
    .fact-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .fact-label { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .fact-value { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-top: 0.25rem; }
    .detail-section { margin-bottom: 2.5rem; }
    .detail-section-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
    .detail-desc { color: var(--text-secondary); line-height: 1.8; }
    .amenities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
    .amenity-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color); }
    .amenity-icon { font-size: 1.125rem; }
    .amenity-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary); }
    .services-list { display: flex; flex-direction: column; gap: 0.625rem; }
    .service-option {
      display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1rem;
      background: var(--bg-surface); border-radius: var(--radius-lg);
      border: 1px solid var(--border-color); cursor: pointer;
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-surface-2); }
    }
    .service-check { accent-color: var(--color-primary-500); width: 1rem; height: 1rem; cursor: pointer; }
    .service-info { display: flex; justify-content: space-between; align-items: center; flex: 1; }
    .service-name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
    .service-price { font-size: var(--text-sm); font-weight: 600; color: var(--color-success); }
    .no-reviews { text-align: center; padding: 2rem 1rem; }
    .no-reviews-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .no-reviews p { color: var(--text-secondary); font-size: var(--text-sm); }
    .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .avg-rating { display: flex; align-items: center; gap: 0.25rem; }
    .avg-stars { color: var(--color-gold-500); font-size: 1.1rem; }
    .avg-num { font-weight: 700; color: var(--text-primary); }
    .avg-count { font-size: var(--text-xs); color: var(--text-muted); }
    .reviews-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .review-card { padding: 1.25rem; background: var(--bg-surface-2); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    .review-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .reviewer-info { flex: 1; }
    .reviewer-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600)); color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; flex-shrink: 0; }
    .reviewer-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
    .review-date { font-size: var(--text-xs); color: var(--text-muted); }
    .review-stars-sm { color: var(--color-neutral-300); .filled { color: var(--color-gold-500); } }
    .review-text { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; }
    .add-review { border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 0.5rem; }
    .add-review-title { font-size: var(--text-base); font-weight: 600; color: var(--text-primary); margin-bottom: 0.875rem; }
    .star-picker { display: flex; gap: 0.25rem; }
    .star-pick-btn {
      background: none; border: none; font-size: 1.75rem; cursor: pointer;
      color: var(--color-neutral-300); transition: color var(--transition-fast);
      padding: 0; line-height: 1;
      &.selected { color: var(--color-gold-500); }
      &:hover { color: var(--color-gold-400); }
    }
    .field-error { font-size: var(--text-xs); color: var(--color-danger); margin-top: 0.25rem; }
    /* Booking widget */
    .booking-widget-wrap { position: sticky; top: 5rem; }
    .booking-widget {
      background: var(--bg-surface); border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl); border: 1px solid var(--border-color);
      padding: 1.75rem; margin-bottom: 1rem;
    }
    .widget-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 0.25rem; }
    .widget-price-num { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); }
    .widget-price-per { color: var(--text-muted); font-size: var(--text-sm); }
    .stars-sm { color: var(--color-gold-500); font-size: 0.875rem; margin-bottom: 1.25rem; }
    .booking-form { display: flex; flex-direction: column; gap: 1rem; }
    .date-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .price-breakdown { background: var(--bg-surface-2); border-radius: var(--radius-lg); padding: 1rem; font-size: var(--text-sm); }
    .breakdown-row { display: flex; justify-content: space-between; margin-bottom: 0.375rem; color: var(--text-secondary); }
    .breakdown-divider { height: 1px; background: var(--border-color); margin: 0.625rem 0; }
    .breakdown-total { display: flex; justify-content: space-between; font-weight: 700; color: var(--text-primary); font-size: var(--text-base); }
    .signin-hint { font-size: var(--text-xs); color: var(--text-muted); text-align: center; margin-top: 0.5rem; }
    .policies-card { background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px solid var(--border-color); padding: 1.25rem; }
    .policies-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
    .policies-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; li { font-size: var(--text-xs); color: var(--text-secondary); } }
  `],
})
export class RoomDetailComponent implements OnInit {
  protected readonly ROOM_IMAGES = ROOM_IMAGES;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sobaService = inject(SobaService);
  private readonly recenzijaService = inject(RecenzijaService);
  private readonly rezervacijaService = inject(RezervacijaService);
  private readonly uslugaService = inject(UslugaService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly activeImg = signal(0);
  readonly lightboxOpen = signal(false);

  readonly room = signal<SobaDto | null>(null);
  readonly reviews = signal<RecenzijaDto[]>([]);
  readonly addOnServices = signal<DodatnaUslugaDto[]>([]);
  readonly loading = signal(true);
  readonly loadingReviews = signal(true);
  readonly bookingLoading = signal(false);
  readonly submittingReview = signal(false);
  readonly selectedServiceIds = signal<Set<number>>(new Set());

  readonly today = new Date().toISOString().split('T')[0];

  readonly avgRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rev) => sum + rev.ocjena, 0) / r.length;
  });

  readonly bookingForm = this.fb.nonNullable.group({
    datumOd: [this.today, Validators.required],
    datumDo: ['', Validators.required],
    brojOsoba: [1, [Validators.required, Validators.min(1)]],
  });

  readonly reviewForm = this.fb.nonNullable.group({
    ocjena: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    komentar: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly guestOptions = [1, 2, 3, 4, 5, 6];

  readonly amenities = [
    { icon: '📶', label: 'Free WiFi' }, { icon: '❄️', label: 'Air Conditioning' },
    { icon: '📺', label: 'Smart TV' }, { icon: '🍳', label: 'Mini Kitchen' },
    { icon: '🛁', label: 'Bathtub' }, { icon: '☕', label: 'Coffee Machine' },
    { icon: '🧴', label: 'Premium Toiletries' }, { icon: '🔒', label: 'Electronic Safe' },
    { icon: '🌿', label: 'Daily Housekeeping' }, { icon: '📞', label: 'Room Service' },
    { icon: '🔌', label: 'Multiple Outlets' }, { icon: '🪟', label: 'Blackout Curtains' },
  ];

  get minCheckOut(): string {
    const d = new Date(this.bookingForm.value.datumOd ?? this.today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  get bookingNights(): () => number {
    return () => {
      const { datumOd, datumDo } = this.bookingForm.value;
      if (!datumOd || !datumDo) return 0;
      const diff = new Date(datumDo).getTime() - new Date(datumOd).getTime();
      return Math.max(0, Math.floor(diff / 86400000));
    };
  }

  get selectedServiceObjects(): () => DodatnaUslugaDto[] {
    return () => this.addOnServices().filter((s) => this.selectedServiceIds().has(s.uslugaId));
  }

  get totalPrice(): () => number {
    return () => {
      const r = this.room();
      if (!r) return 0;
      const roomCost = r.cijena * this.bookingNights();
      const svcCost = this.selectedServiceObjects().reduce((sum: number, s: DodatnaUslugaDto) => sum + s.cijena, 0);
      return roomCost + svcCost;
    };
  }

  prevImg(): void {
    this.activeImg.update((i) => (i - 1 + ROOM_IMAGES.length) % ROOM_IMAGES.length);
  }

  nextImg(): void {
    this.activeImg.update((i) => (i + 1) % ROOM_IMAGES.length);
  }

  openLightbox(): void {
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sobaService.getById(id).subscribe({
      next: (room) => { this.room.set(room); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
    this.recenzijaService.getBySoba(id).subscribe({
      next: (reviews) => { this.reviews.set(reviews); this.loadingReviews.set(false); },
      error: () => this.loadingReviews.set(false),
    });
    this.uslugaService.getAll().subscribe({
      next: (services) => this.addOnServices.set(services),
    });
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds().has(id);
  }

  toggleService(id: number): void {
    this.selectedServiceIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  getStars(rating: number): ('full' | 'empty')[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 'full' : 'empty'));
  }

  submitReview(): void {
    if (this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    const room = this.room();
    if (!room) return;
    this.submittingReview.set(true);
    const { ocjena, komentar } = this.reviewForm.getRawValue();
    this.recenzijaService.insert({ sobaId: room.sobeId, ocjena, komentar }).subscribe({
      next: (r) => {
        this.reviews.update((list) => [r, ...list]);
        this.reviewForm.reset({ ocjena: 5, komentar: '' });
        this.submittingReview.set(false);
        this.toast.success('Review submitted', 'Thank you for your feedback!');
      },
      error: () => {
        this.submittingReview.set(false);
        this.toast.error('Failed to submit review');
      },
    });
  }

  onBook(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const { datumOd, datumDo, brojOsoba } = this.bookingForm.getRawValue();
    this.bookingLoading.set(true);

    this.rezervacijaService.insert({
      sobaId: this.room()!.sobeId,
      datumOd,
      datumDo,
      brojOsoba,
      uslugeIds: Array.from(this.selectedServiceIds()),
    }).subscribe({
      next: () => {
        this.bookingLoading.set(false);
        this.toast.success('Reservation Created!', 'Your room has been reserved. Check your dashboard for details.');
        this.router.navigate(['/dashboard/my-reservations']);
      },
      error: () => {
        this.bookingLoading.set(false);
        this.toast.error('Booking Failed', 'Please try again or contact support.');
      },
    });
  }
}
