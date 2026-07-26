import { useEffect } from 'react';
import { DesktopStepNav } from '../components/layout/DesktopStepNav';
import { RegistrationFooter, RegistrationNav } from '../components/registration/RegistrationNav';
import { RegistrationLoadingOverlay } from '../components/registration/RegistrationLoadingOverlay';
import { RegistrationStepForm } from '../components/registration/RegistrationStepForm';
import { RegistrationStepHeader } from '../components/registration/RegistrationStepHeader';
import type { RegistrationFlow } from '../hooks/useRegistrationFlow';
import '../styles/registration-mobile.css';
import '../styles/registration-desktop.css';

type RegistrationDesktopPageProps = {
  flow: RegistrationFlow;
};

export function RegistrationDesktopPage({ flow }: RegistrationDesktopPageProps) {
  useEffect(() => {
    document.body.classList.add('reg-desktop-active');
    return () => document.body.classList.remove('reg-desktop-active');
  }, []);

  return (
    <div className="reg-desktop-screen">
      <aside className="reg-desktop-aside" aria-hidden="false">
        <div className="reg-desktop-aside__bg">
          <div className="reg-desktop-aside__photo" aria-hidden="true" />
          <div className="reg-desktop-aside__veil" aria-hidden="true" />
          <img
            className="reg-desktop-aside__lion"
            src="/img/Pattern_lion_as_vita.svg"
            alt=""
            aria-hidden="true"
          />
        </div>

        <div className="reg-desktop-aside__content">
          <img className="reg-desktop-aside__logo" src="/img/logo-new.png" alt="AS Vita" />
          <p className="reg-desktop-aside__brand">AS VITA Club</p>
          <p className="reg-desktop-aside__tagline">Rejoignez la famille</p>
          <DesktopStepNav currentStep={flow.currentStep} />
        </div>
      </aside>

      <div className="reg-desktop-main">
        <div className="reg-desktop-main__bg" aria-hidden="true">
          <img
            className="reg-desktop-main__pattern"
            src="/img/pattern.png"
            alt=""
          />
        </div>

        <div
          className={`reg-desktop-panel${flow.isContactStep ? ' reg-desktop-panel--contact' : ''}${flow.isBusy ? ' reg-desktop-panel--busy' : ''}`}
        >
          <header className="reg-desktop-panel__header">
            <RegistrationStepHeader
              currentStep={flow.currentStep}
              titleClassName="reg-desktop-panel__title"
              subtitleClassName="reg-desktop-panel__subtitle"
            />
          </header>

          <RegistrationStepForm {...flow} />

          <div className="reg-desktop-panel__bottom">
            <RegistrationNav {...flow} />
            <RegistrationFooter />
          </div>
        </div>
      </div>

      {flow.loading && (
        <RegistrationLoadingOverlay
          loading={flow.loading}
          onCancelPayment={flow.handleCancelPayment}
          onDismiss={flow.dismissLoading}
        />
      )}
    </div>
  );
}
