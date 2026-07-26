import { useEffect, useState } from 'react';
import { Check, LoaderCircle, ShieldCheck } from 'lucide-react';
import { CardDownloadShell } from '../components/card/CardDownloadShell';
import { verifyCard, type VerifiedCard } from '../api/cards';

type CardVerifyPageProps = {
  token: string;
};

function formatMemberType(memberType: VerifiedCard['memberType']): string {
  return memberType === 'premium' ? 'Premium' : 'Standard';
}

function formatFullName(card: VerifiedCard): string {
  return [card.firstname, card.middlename, card.lastname]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}

export function CardVerifyPage({ token }: CardVerifyPageProps) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [card, setCard] = useState<VerifiedCard | null>(null);
  const [message, setMessage] = useState('Vérification de la carte en cours...');

  useEffect(() => {
    if (!token.trim()) {
      setStatus('invalid');
      setMessage('Lien de vérification invalide.');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const result = await verifyCard(token);
        if (!cancelled) {
          setCard(result);
          setStatus('valid');
          setMessage(
            'Cette carte de supporter AS Vita Club est valide, authentique et en règle pour la saison 2025-2026.',
          );
        }
      } catch (caught) {
        if (!cancelled) {
          setStatus('invalid');
          setMessage(
            caught instanceof Error
              ? caught.message
              : 'Cette carte n’a pas pu être authentifiée.',
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <CardDownloadShell backHref="/">
      <div className="card-download-status">
        <div
          className={`card-download-status__icon${
            status === 'invalid' ? ' card-download-status__icon--error' : ''
          }`}
          aria-hidden="true"
        >
          {status === 'loading' ? (
            <LoaderCircle className="card-download-status__glyph card-download-status__glyph--spin" />
          ) : status === 'valid' ? (
            <ShieldCheck className="card-download-status__glyph" strokeWidth={2.2} />
          ) : (
            <span className="card-download-status__glyph card-download-status__glyph--error">!</span>
          )}
        </div>

        <h1 className="reg-mobile__title">
          {status === 'loading'
            ? 'Vérification...'
            : status === 'valid'
              ? 'Carte authentique'
              : 'Carte non valide'}
        </h1>

        <p
          className={`reg-mobile__subtitle card-download-status__message${
            status === 'invalid' ? ' card-download-status__message--error' : ''
          }`}
        >
          {message}
        </p>

        {status === 'valid' && card ? (
          <div className="card-verify-details">
            <div className="card-verify-details__badge" aria-hidden="true">
              <Check size={18} strokeWidth={3} />
              <span>Authentifiée</span>
            </div>

            <dl className="card-verify-details__list">
              <div className="card-verify-details__row">
                <dt>Nom complet</dt>
                <dd>{formatFullName(card) || '—'}</dd>
              </div>
              <div className="card-verify-details__row">
                <dt>FAN ID</dt>
                <dd>{card.memberNumber}</dd>
              </div>
              <div className="card-verify-details__row">
                <dt>Section</dt>
                <dd>{card.section?.trim() || '—'}</dd>
              </div>
              <div className="card-verify-details__row">
                <dt>Type</dt>
                <dd>{formatMemberType(card.memberType)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </CardDownloadShell>
  );
}
