import { Check, X } from 'lucide-react';
import { TermsFooterLink } from '../legal/TermsFooterLink';
import type { PaymentResultData } from '../../types/paymentResult';

type PaymentResultViewProps = {
  result: PaymentResultData;
  onRetry?: () => void;
  onDownloadCard?: () => void | Promise<void>;
};

const SUCCESS_MESSAGE = (
  <>
    Votre inscription a été effectuée avec succès.
    <br />
    Bienvenue dans la famille
    <br />
    AS Vita Club !
  </>
);

const DEFAULT_FAILURE_MESSAGE = (
  <>
    La transaction a été refusée, annulée
    <br />
    ou votre solde est insuffisant.
  </>
);

export function PaymentResultView({ result, onRetry, onDownloadCard }: PaymentResultViewProps) {
  const isSuccess = result.status === 'success';
  const canDownloadCard =
    isSuccess &&
    Boolean(
      result.cardDownloadToken ||
        result.cardDownloadUrl ||
        result.orderNumber ||
        result.paymentReference ||
        result.memberNumber,
    );

  const handleDownloadCard = () => {
    void onDownloadCard?.();
  };

  return (
    <>
      <main className="payment-result-main">
        <div
          className={`payment-result-icon${isSuccess ? '' : ' payment-result-icon--failed'}`}
          aria-hidden="true"
        >
          {isSuccess ? (
            <Check className="payment-result-icon__glyph" strokeWidth={3} />
          ) : (
            <X className="payment-result-icon__glyph" strokeWidth={3} />
          )}
        </div>

        <h1 className="payment-result-title">{isSuccess ? 'BIENVENUE!' : 'ÉCHEC'}</h1>

        <p className="payment-result-message">
          {isSuccess ? SUCCESS_MESSAGE : (result.message ?? DEFAULT_FAILURE_MESSAGE)}
        </p>

        {isSuccess && result.memberNumber && (
          <p className="payment-result-reference">
            FAN ID : <strong>{result.memberNumber}</strong>
          </p>
        )}

        {isSuccess && result.orderNumber && (
          <p className="payment-result-reference">
            Référence : <strong>{result.orderNumber}</strong>
          </p>
        )}
      </main>

      <div className="payment-result-actions">
        {canDownloadCard ? (
          <button type="button" className="payment-result-btn" onClick={handleDownloadCard}>
            Télécharger ma carte
          </button>
        ) : !isSuccess ? (
          <button type="button" className="payment-result-btn" onClick={onRetry}>
            Réessayer
          </button>
        ) : null}
      </div>

      <footer className="payment-result-footer">
        <TermsFooterLink className="payment-result-footer__link" />
        <span className="payment-result-footer__credit">Powered by Aksys Digital</span>
      </footer>
    </>
  );
}
