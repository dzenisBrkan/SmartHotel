import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SobaService } from '../../core/services/soba.service';
import { SobaDto } from '../../core/models/soba.models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

const ROOM_IMAGES: Record<string, string> = {
  default: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
  suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  deluxe: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
  standard: 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600',
};

@Component({
  selector: 'sh-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, SkeletonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="container hero-content">
        <div class="hero-badge">⭐ Rated #1 Luxury Hotel 2024</div>
        <h1 class="hero-title">
          Experience Luxury<br>
          <span class="hero-accent">Redefined</span>
        </h1>
        <p class="hero-subtitle">
          Discover unparalleled comfort and elegance in every corner of our world-class hotel.
          Your perfect stay begins here.
        </p>
        <div class="hero-actions">
          <sh-button variant="gold" size="lg" routerLink="/rooms">Explore Rooms</sh-button>
          <sh-button variant="secondary" size="lg" routerLink="/auth/register">Join Today</sh-button>
        </div>
        <div class="hero-stats" aria-label="Hotel highlights">
          <div class="stat"><span class="stat-num">250+</span><span class="stat-label">Rooms & Suites</span></div>
          <div class="stat-divider" aria-hidden="true"></div>
          <div class="stat"><span class="stat-num">4.9★</span><span class="stat-label">Guest Rating</span></div>
          <div class="stat-divider" aria-hidden="true"></div>
          <div class="stat"><span class="stat-num">15k+</span><span class="stat-label">Happy Guests</span></div>
        </div>
      </div>
      <div class="scroll-cue" aria-hidden="true">
        <span>↓</span>
      </div>
    </section>

    <!-- Featured Rooms -->
    <section class="section" id="rooms">
      <div class="container">
        <div class="section-header">
          <sh-badge variant="info">Our Rooms</sh-badge>
          <h2 class="section-title">Rooms & Suites</h2>
          <p class="section-subtitle">From cozy standard rooms to lavish penthouse suites — every room is a sanctuary of comfort and style.</p>
        </div>

        @if (loadingRooms()) {
          <div class="grid-rooms">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="room-card">
                <sh-skeleton height="220px" style="border-radius: var(--radius-xl) var(--radius-xl) 0 0"></sh-skeleton>
                <div class="room-card-body">
                  <sh-skeleton height="1.25rem" width="60%"></sh-skeleton>
                  <sh-skeleton height="0.875rem" width="40%" style="margin-top:0.5rem"></sh-skeleton>
                  <sh-skeleton height="1rem" width="80%" style="margin-top:0.75rem"></sh-skeleton>
                </div>
              </div>
            }
          </div>
        } @else if (rooms().length === 0) {
          <div class="empty-rooms">
            <p>🏨 No rooms available at the moment.</p>
          </div>
        } @else {
          <div class="grid-rooms">
            @for (room of rooms().slice(0, 6); track room.sobeId) {
              <article class="room-card" [routerLink]="['/rooms', room.sobeId]">
                <div class="room-img-wrap">
                  <img [src]="getRoomImage(room)" [alt]="room.naziv + ' room'" loading="lazy" class="room-img" />
                  <div class="room-img-overlay" aria-hidden="true"></div>
                  <div class="room-price-badge" aria-label="Price per night">
                    <span class="price-amount">€{{ room.cijena | number:'1.0-0' }}</span>
                    <span class="price-per">/ night</span>
                  </div>
                  <sh-badge [variant]="room.status ? 'success' : 'danger'" class="room-status-badge">
                    {{ room.status ? 'Available' : 'Unavailable' }}
                  </sh-badge>
                </div>
                <div class="room-card-body">
                  <div class="room-meta">
                    <sh-badge variant="neutral">{{ room.vrstaNaziv }}</sh-badge>
                    <span class="room-capacity">👥 {{ room.kapacitet }}</span>
                  </div>
                  <h3 class="room-name">{{ room.naziv }}</h3>
                  <p class="room-code">Room {{ room.sifra }}</p>
                  <div class="room-footer">
                    <div class="stars" aria-label="4.5 out of 5 stars">★★★★★</div>
                    <sh-button variant="primary" size="sm">View Details</sh-button>
                  </div>
                </div>
              </article>
            }
          </div>

          <div class="see-all">
            <sh-button variant="secondary" size="lg" routerLink="/rooms">
              View All Rooms →
            </sh-button>
          </div>
        }
      </div>
    </section>

    <!-- Services -->
    <section class="section section-dark" id="services">
      <div class="container">
        <div class="section-header">
          <sh-badge variant="gold">Premium Services</sh-badge>
          <h2 class="section-title">Everything You Need</h2>
          <p class="section-subtitle">Our world-class amenities ensure your stay is nothing short of extraordinary.</p>
        </div>
        <div class="services-grid">
          @for (service of services; track service.icon) {
            <div class="service-card">
              <div class="service-icon" aria-hidden="true">{{ service.icon }}</div>
              <h3 class="service-title">{{ service.title }}</h3>
              <p class="service-desc">{{ service.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section" id="testimonials">
      <div class="container">
        <div class="section-header">
          <sh-badge variant="success">Reviews</sh-badge>
          <h2 class="section-title">What Guests Say</h2>
          <p class="section-subtitle">Real stories from real guests who experienced the SmartHotel difference.</p>
        </div>
        <div class="testimonials-grid">
          @for (review of testimonials; track review.name) {
            <blockquote class="testimonial-card">
              <div class="review-stars" aria-label="5 stars">★★★★★</div>
              <p class="review-text">"{{ review.text }}"</p>
              <footer class="review-author">
                <div class="author-avatar" aria-hidden="true">{{ review.name.charAt(0) }}</div>
                <div>
                  <p class="author-name">{{ review.name }}</p>
                  <p class="author-location">{{ review.location }}</p>
                </div>
              </footer>
            </blockquote>
          }
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="section section-dark" id="gallery">
      <div class="container">
        <div class="section-header">
          <sh-badge variant="info">Gallery</sh-badge>
          <h2 class="section-title">Experience Our World</h2>
        </div>
        <div class="gallery-grid" role="list" aria-label="Hotel gallery">
          @for (img of gallery; track img.src) {
            <div class="gallery-item" role="listitem">
              <img [src]="img.src" [alt]="img.alt" loading="lazy" class="gallery-img" />
              <div class="gallery-overlay" aria-hidden="true">
                <p>{{ img.alt }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2 class="cta-title">Ready to Experience Luxury?</h2>
            <p class="cta-subtitle">Join thousands of satisfied guests. Book your perfect stay today.</p>
          </div>
          <div class="cta-actions">
            <sh-button variant="gold" size="lg" routerLink="/rooms">Book a Room</sh-button>
            <sh-button variant="ghost" size="lg" routerLink="/auth/register">Create Account</sh-button>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="section" id="contact">
      <div class="container">
        <div class="section-header">
          <sh-badge variant="neutral">Contact</sh-badge>
          <h2 class="section-title">Get in Touch</h2>
        </div>
        <div class="contact-grid">
          <div class="contact-info">
            @for (info of contactInfo; track info.label) {
              <div class="contact-item">
                <span class="contact-icon" aria-hidden="true">{{ info.icon }}</span>
                <div>
                  <p class="contact-label">{{ info.label }}</p>
                  <p class="contact-value">{{ info.value }}</p>
                </div>
              </div>
            }
          </div>
          <div class="contact-map" aria-label="Hotel location map">
            <div class="map-placeholder">
              <span aria-hidden="true">🗺️</span>
              <p>123 Luxury Avenue, Sarajevo, Bosnia & Herzegovina</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section section-dark" id="faq">
      <div class="container container-sm">
        <div class="section-header">
          <sh-badge variant="info">FAQ</sh-badge>
          <h2 class="section-title">Frequently Asked Questions</h2>
        </div>
        <div class="faq-list" role="list">
          @for (item of faq; track item.q; let i = $index) {
            <div class="faq-item" role="listitem">
              <button
                class="faq-question"
                [attr.aria-expanded]="openFaq() === i"
                (click)="toggleFaq(i)"
              >
                <span>{{ item.q }}</span>
                <span class="faq-chevron" [class.open]="openFaq() === i" aria-hidden="true">▾</span>
              </button>
              @if (openFaq() === i) {
                <div class="faq-answer" role="region">{{ item.a }}</div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* --- Hero --- */
    .hero {
      position: relative; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920') center/cover;
    }
    .hero-overlay {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(
        135deg,
        rgb(17 24 39 / 0.8) 0%,
        rgb(37 80 245 / 0.4) 100%
      );
    }
    .hero-content {
      position: relative; z-index: 2;
      text-align: center; color: white;
      padding-block: 6rem;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: rgb(245 200 66 / 0.2); border: 1px solid rgb(245 200 66 / 0.4);
      color: var(--color-gold-400); font-size: var(--text-sm); font-weight: 600;
      padding: 0.375rem 1rem; border-radius: 9999px;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 7vw, 5rem);
      font-weight: 700; line-height: 1.1;
      margin-bottom: 1.5rem;
      text-shadow: 0 2px 8px rgb(0 0 0 / 0.3);
    }
    .hero-accent {
      background: linear-gradient(135deg, var(--color-gold-400), #ff8c42);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      opacity: 0.9; max-width: 560px; margin: 0 auto 2.5rem;
      line-height: 1.7;
    }
    .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }
    .hero-stats {
      display: flex; align-items: center; justify-content: center;
      gap: 2rem; flex-wrap: wrap;
    }
    .stat { text-align: center; }
    .stat-num { display: block; font-size: 1.75rem; font-weight: 700; font-family: var(--font-display); }
    .stat-label { font-size: var(--text-xs); opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; }
    .stat-divider { width: 1px; height: 40px; background: rgb(255 255 255 / 0.3); }
    .scroll-cue {
      position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
      z-index: 2; color: white; opacity: 0.7;
      animation: bounce 2s ease-in-out infinite;
      font-size: 1.5rem;
    }
    @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }

    /* --- Section headers --- */
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700; color: var(--text-primary);
      margin-top: 0.75rem; margin-bottom: 0.75rem;
    }
    .section-subtitle {
      font-size: var(--text-lg); color: var(--text-secondary);
      max-width: 560px; margin: 0 auto; line-height: 1.7;
    }
    .section-dark {
      background: var(--bg-surface-2);
    }

    /* --- Room cards --- */
    .grid-rooms {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .room-card {
      background: var(--bg-surface); border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-card); border: 1px solid var(--border-color);
      overflow: hidden; cursor: pointer;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-card-hover);
        .room-img { transform: scale(1.05); }
      }
    }
    .room-img-wrap { position: relative; overflow: hidden; height: 220px; }
    .room-img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
    .room-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgb(0 0 0 / 0.3), transparent);
    }
    .room-price-badge {
      position: absolute; bottom: 1rem; left: 1rem;
      background: rgb(0 0 0 / 0.7); backdrop-filter: blur(8px);
      color: white; padding: 0.375rem 0.875rem; border-radius: 9999px;
      display: flex; align-items: baseline; gap: 3px;
    }
    .price-amount { font-weight: 700; font-size: 1.125rem; }
    .price-per { font-size: var(--text-xs); opacity: 0.8; }
    .room-status-badge { position: absolute; top: 1rem; right: 1rem; }
    .room-card-body { padding: 1.25rem; }
    .room-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .room-capacity { font-size: var(--text-sm); color: var(--text-secondary); }
    .room-name { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
    .room-code { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 1rem; }
    .room-footer { display: flex; align-items: center; justify-content: space-between; }
    .stars { color: var(--color-gold-500); font-size: 0.875rem; letter-spacing: 1px; }
    .see-all { text-align: center; margin-top: 3rem; }
    .empty-rooms { text-align: center; padding: 3rem; color: var(--text-secondary); font-size: 1.125rem; }

    /* --- Services --- */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .service-card {
      background: var(--bg-surface); border-radius: var(--radius-xl);
      padding: 2rem 1.5rem; text-align: center;
      box-shadow: var(--shadow-card); border: 1px solid var(--border-color);
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-card-hover); }
    }
    .service-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .service-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
    .service-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }

    /* --- Testimonials --- */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .testimonial-card {
      background: var(--bg-surface); border-radius: var(--radius-xl);
      padding: 1.75rem; box-shadow: var(--shadow-card);
      border: 1px solid var(--border-color);
    }
    .review-stars { color: var(--color-gold-500); font-size: 1rem; letter-spacing: 2px; margin-bottom: 1rem; }
    .review-text { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
    .review-author { display: flex; align-items: center; gap: 0.75rem; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600));
      color: white; font-weight: 700; display: flex; align-items: center; justify-content: center;
    }
    .author-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
    .author-location { font-size: var(--text-xs); color: var(--text-muted); }

    /* --- Gallery --- */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
    }
    .gallery-item {
      position: relative; overflow: hidden; border-radius: var(--radius-lg);
      aspect-ratio: 4/3; cursor: pointer;
    }
    .gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
    .gallery-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgb(0 0 0 / 0.6), transparent);
      opacity: 0; transition: opacity var(--transition-base);
      display: flex; align-items: flex-end; padding: 1rem;
      color: white; font-size: var(--text-sm); font-weight: 500;
    }
    .gallery-item:hover {
      .gallery-img { transform: scale(1.08); }
      .gallery-overlay { opacity: 1; }
    }

    /* --- CTA --- */
    .cta-card {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900));
      border-radius: var(--radius-2xl); padding: 4rem 3rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap; color: white;
    }
    .cta-title { font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 700; margin-bottom: 0.5rem; }
    .cta-subtitle { opacity: 0.85; font-size: var(--text-lg); }
    .cta-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

    /* --- Contact --- */
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .contact-info { display: flex; flex-direction: column; gap: 1.5rem; }
    .contact-item { display: flex; align-items: flex-start; gap: 1rem; }
    .contact-icon { font-size: 1.5rem; flex-shrink: 0; }
    .contact-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.25rem; }
    .contact-value { color: var(--text-primary); font-weight: 500; }
    .contact-map { background: var(--bg-surface-2); border-radius: var(--radius-xl); border: 1px solid var(--border-color); overflow: hidden; }
    .map-placeholder { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; font-size: 3rem; p { font-size: var(--text-sm); color: var(--text-secondary); text-align: center; padding: 0 1rem; } }

    /* --- FAQ --- */
    .faq-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .faq-item { background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; }
    .faq-question {
      width: 100%; background: none; border: none; padding: 1.25rem 1.5rem;
      display: flex; justify-content: space-between; align-items: center;
      font-size: var(--text-base); font-weight: 600; color: var(--text-primary);
      cursor: pointer; text-align: left; gap: 1rem;
      &:hover { background: var(--bg-surface-2); }
    }
    .faq-chevron { transition: transform var(--transition-fast); flex-shrink: 0; &.open { transform: rotate(180deg); } }
    .faq-answer { padding: 0 1.5rem 1.25rem; color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.7; }
  `],
})
export class LandingComponent implements OnInit {
  private readonly sobaService = inject(SobaService);

  readonly rooms = signal<SobaDto[]>([]);
  readonly loadingRooms = signal(true);
  readonly openFaq = signal<number | null>(null);

  readonly services = [
    { icon: '🍽️', title: 'Fine Dining', desc: 'Award-winning restaurant with international cuisine crafted by world-class chefs.' },
    { icon: '♾️', title: 'Infinity Pool', desc: 'Relax in our stunning rooftop infinity pool overlooking the city skyline.' },
    { icon: '💆', title: 'Luxury Spa', desc: 'Rejuvenate your body and mind with our full-service spa and wellness center.' },
    { icon: '🏋️', title: 'Fitness Center', desc: '24/7 state-of-the-art gym with personal trainers available on request.' },
    { icon: '🏎️', title: 'Valet Parking', desc: 'Complimentary valet parking and chauffeur service for all guests.' },
    { icon: '🛎️', title: '24/7 Concierge', desc: 'Our dedicated concierge team is always available to make your stay perfect.' },
    { icon: '🌐', title: 'High-Speed WiFi', desc: 'Blazing-fast fiber internet throughout the hotel with no data limits.' },
    { icon: '✈️', title: 'Airport Transfer', desc: 'Seamless airport pickup and drop-off in our luxury fleet.' },
  ];

  readonly testimonials = [
    { name: 'Sarah Mitchell', location: 'New York, USA', text: 'Absolutely breathtaking! The attention to detail in every room is remarkable. The staff made us feel like royalty from check-in to check-out.' },
    { name: 'James Worthington', location: 'London, UK', text: 'Best hotel experience I have ever had. The spa is incredible and the room views at sunset were simply stunning. Will definitely return.' },
    { name: 'Amina Hassan', location: 'Dubai, UAE', text: 'The service here is unmatched. Every request was fulfilled within minutes. The restaurant alone is worth the visit — five stars all around.' },
    { name: 'Marco Bellini', location: 'Milan, Italy', text: 'Stayed in the penthouse suite for our anniversary. SmartHotel exceeded every expectation. Pure luxury, exceptional value for money.' },
    { name: 'Yuki Tanaka', location: 'Tokyo, Japan', text: 'From the moment we arrived, we knew this was special. The pool, the food, the beds — everything is world-class. Absolutely magical stay.' },
    { name: 'Elena Novak', location: 'Vienna, Austria', text: 'A hidden gem. The architecture is stunning, rooms are immaculate, and the personalized service is something you rarely find today.' },
  ];

  readonly gallery = [
    { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600', alt: 'Hotel exterior at sunset' },
    { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', alt: 'Luxury bedroom suite' },
    { src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', alt: 'Infinity pool' },
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', alt: 'Fine dining restaurant' },
    { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600', alt: 'Luxury spa' },
    { src: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', alt: 'Modern bathroom' },
  ];

  readonly contactInfo = [
    { icon: '📍', label: 'Address', value: '123 Luxury Avenue, Sarajevo 71000, Bosnia & Herzegovina' },
    { icon: '📞', label: 'Phone', value: '+387 33 123 456' },
    { icon: '✉️', label: 'Email', value: 'hello@smarthotel.ba' },
    { icon: '🕒', label: 'Check-in / Check-out', value: 'Check-in: 3:00 PM · Check-out: 12:00 PM' },
  ];

  readonly faq = [
    { q: 'What are the check-in and check-out times?', a: 'Standard check-in is at 3:00 PM and check-out is at 12:00 PM. Early check-in and late check-out may be available upon request, subject to availability.' },
    { q: 'Is breakfast included?', a: 'Continental breakfast is complimentary for all guests. Our full buffet breakfast can be added for a small additional fee.' },
    { q: 'Do you allow pets?', a: 'We welcome well-behaved pets in select rooms. Please contact us in advance to arrange pet-friendly accommodation. A small cleaning fee may apply.' },
    { q: 'Is parking available?', a: 'Yes, complimentary valet parking is available for all hotel guests. Secure underground parking is also available.' },
    { q: 'How do I modify or cancel a reservation?', a: 'Reservations can be modified or cancelled through your account dashboard up to 24 hours before check-in. For assistance, contact our concierge team.' },
  ];

  ngOnInit(): void {
    this.sobaService.getAll({ status: true }).subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loadingRooms.set(false);
      },
      error: () => this.loadingRooms.set(false),
    });
  }

  getRoomImage(room: SobaDto): string {
    const name = room.vrstaNaziv?.toLowerCase() ?? '';
    if (name.includes('suite')) return ROOM_IMAGES['suite'];
    if (name.includes('deluxe')) return ROOM_IMAGES['deluxe'];
    if (name.includes('standard')) return ROOM_IMAGES['standard'];
    return ROOM_IMAGES['default'];
  }

  toggleFaq(index: number): void {
    this.openFaq.set(this.openFaq() === index ? null : index);
  }
}
