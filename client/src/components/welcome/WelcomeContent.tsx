import { ArrowRight } from 'lucide-react';
import { TermsFooterLink } from '../legal/TermsFooterLink';
import { WelcomeCommunityBlock } from './WelcomeCommunitySlider';

type WelcomeContentProps = {
  onStart: () => void;
};

export function WelcomeContent({ onStart }: WelcomeContentProps) {
  return (
    <>
      <div className="welcome-main">
        <div className="welcome-hero">
          <img className="welcome-logo welcome-logo--large" src="/img/logo-new.png" alt="AS Vita" />
          <h1 className="welcome-title">
            AS VITA
            <br />
            Club
          </h1>
          <p className="welcome-founded">Fondée en 1935</p>
        </div>

        <div className="welcome-tagline-group">
          <h2 className="welcome-tagline">Rejoignez la famille</h2>
          <WelcomeCommunityBlock />
        </div>
      </div>

      <div className="welcome-bottom">
        <div className="welcome-cta-row">
          <button type="button" className="welcome-cta" onClick={onStart}>
            Demarrer
          </button>
          <button
            type="button"
            className="welcome-cta-next"
            onClick={onStart}
            aria-label="Continuer"
          >
            <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <footer className="welcome-footer">
          <TermsFooterLink className="welcome-footer__link" />
          <span className="welcome-footer__credit">Powered by Aksys Digital</span>
        </footer>
      </div>
    </>
  );
}
