import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { TermsFooterLink } from '../components/legal/TermsFooterLink';
import '../styles/welcome-desktop.css';

type WelcomeDesktopPageProps = {
  onStart: () => void;
};

export function WelcomeDesktopPage({ onStart }: WelcomeDesktopPageProps) {
  useEffect(() => {
    document.body.classList.add('welcome-desktop-active');
    return () => document.body.classList.remove('welcome-desktop-active');
  }, []);

  return (
    <div className="welcome-desktop-screen">
      <aside className="welcome-desktop-aside">
        <div className="welcome-desktop-aside__bg">
          <div className="welcome-desktop-aside__photo" aria-hidden="true" />
          <div className="welcome-desktop-aside__veil" aria-hidden="true" />
        </div>

        <div className="welcome-desktop-aside__content">
          <img className="welcome-desktop-aside__logo" src="/img/logo-new.png" alt="AS Vita" />
          <h1 className="welcome-desktop-aside__title">
            AS VITA
            <br />
            Club
          </h1>
          <p className="welcome-desktop-aside__founded">Fondée en 1935</p>
          <p className="welcome-desktop-aside__tagline">Rejoignez la famille</p>
        </div>
      </aside>

      <main className="welcome-desktop-main">
        <div className="welcome-desktop-main__bg" aria-hidden="true">
          <img
            className="welcome-desktop-main__pattern"
            src="/img/pattern.png"
            alt=""
          />
        </div>

        <section className="welcome-desktop-card" aria-label="La communauté">
          <div className="welcome-desktop-card__stats">
            <p className="welcome-desktop-card__label">La communauté</p>
            <p className="welcome-desktop-card__count">+2K Supporters</p>
            <p className="welcome-desktop-card__caption">
              Une communauté de passionnés qui grandit chaque saison.
            </p>
          </div>

          <div className="welcome-desktop-card__visual">
            <img src="/img/img01.jpg" alt="Supporters AS Vita" />
          </div>

          <div className="welcome-desktop-card__actions">
            <button type="button" className="welcome-desktop-cta" onClick={onStart}>
              Demarrer l&apos;inscription
            </button>
            <button
              type="button"
              className="welcome-desktop-cta-icon"
              onClick={onStart}
              aria-label="Continuer"
            >
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          <footer className="welcome-desktop-footer">
            <TermsFooterLink className="welcome-desktop-footer__link" />
            <span className="welcome-desktop-footer__credit">Powered by Aksys Digital</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
