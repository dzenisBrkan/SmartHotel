import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'sh-not-found',
  standalone: true,
  imports: [RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="not-found-number" aria-hidden="true">404</div>
        <div class="not-found-icon" aria-hidden="true">🏨</div>
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-message">
          The page you're looking for doesn't exist or has been moved.<br>
          Let's get you back to comfort.
        </p>
        <div class="not-found-actions">
          <sh-button variant="primary" size="lg" routerLink="/">Back to Home</sh-button>
          <sh-button variant="secondary" size="lg" routerLink="/rooms">Browse Rooms</sh-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--bg-base); padding: 2rem;
    }
    .not-found-content { text-align: center; max-width: 480px; }
    .not-found-number {
      font-family: var(--font-display); font-size: clamp(6rem, 20vw, 10rem);
      font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, var(--color-primary-400), var(--color-gold-400));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin-bottom: -0.5rem;
    }
    .not-found-icon { font-size: 3rem; margin-bottom: 1rem; }
    .not-found-title {
      font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 700;
      color: var(--text-primary); margin-bottom: 1rem;
    }
    .not-found-message {
      font-size: var(--text-base); color: var(--text-secondary); line-height: 1.7;
      margin-bottom: 2rem;
    }
    .not-found-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  `],
})
export class NotFoundComponent {}
