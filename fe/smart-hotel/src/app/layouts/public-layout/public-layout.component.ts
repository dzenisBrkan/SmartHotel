import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicNavbarComponent } from './public-navbar.component';
import { ToastOutletComponent } from '../../shared/ui/toast/toast-outlet.component';

@Component({
  selector: 'sh-public-layout',
  standalone: true,
  imports: [RouterModule, PublicNavbarComponent, ToastOutletComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-public-navbar></sh-public-navbar>
    <main id="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="footer-logo" aria-hidden="true">🏨</span>
          <span class="footer-name">SmartHotel</span>
          <p class="footer-tagline">Luxury redefined. Comfort elevated.</p>
        </div>
        <div class="footer-links">
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a routerLink="/rooms">Rooms & Suites</a></li>
              <li><a routerLink="/" fragment="services">Services</a></li>
              <li><a routerLink="/" fragment="gallery">Gallery</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a routerLink="/" fragment="contact">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><a routerLink="/auth/login">Sign In</a></li>
              <li><a routerLink="/auth/register">Register</a></li>
              <li><a routerLink="/dashboard">Dashboard</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>© {{ year }} SmartHotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <sh-toast-outlet></sh-toast-outlet>
  `,
  styles: [`
    main { min-height: 100vh; }
    .site-footer {
      background: var(--color-neutral-900);
      color: var(--color-neutral-400);
    }
    [data-theme='dark'] .site-footer {
      background: #0d1117;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 3rem;
      padding-block: 4rem;
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
    .footer-brand {
      .footer-logo { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
      .footer-name {
        display: block;
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
      }
      .footer-tagline { font-size: var(--text-sm); line-height: 1.6; }
    }
    .footer-links {
      display: contents;
      h4 {
        font-size: var(--text-sm);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: white;
        margin-bottom: 1rem;
      }
      ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
      a {
        font-size: var(--text-sm);
        color: var(--color-neutral-400);
        text-decoration: none;
        transition: color var(--transition-fast);
        &:hover { color: white; }
      }
    }
    .footer-bottom {
      border-top: 1px solid rgb(255 255 255 / 0.1);
      padding-block: 1.25rem;
      p { font-size: var(--text-sm); }
    }
  `],
})
export class PublicLayoutComponent {
  readonly year = new Date().getFullYear();
}
