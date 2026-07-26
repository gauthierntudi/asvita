import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { CardDownloadShell } from '../components/card/CardDownloadShell';
import { fetchCardBlob, saveCardBlob } from '../api/cards';

type CardDownloadPageProps = {
  token: string;
};

function isIosDevice(): boolean {
  return /iP(hone|od|ad)/i.test(navigator.userAgent);
}

export function CardDownloadPage({ token }: CardDownloadPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Préparation de votre carte...');
  const startedRef = useRef(false);

  const runDownload = async () => {
    setStatus('loading');
    setMessage('Préparation de votre carte...');

    try {
      const blob = await fetchCardBlob({ token });
      saveCardBlob(blob, 'carte-vita.png');
      setStatus('success');
      setMessage(
        isIosDevice()
          ? 'Votre carte est prête. Sur iPhone, elle s’ouvre dans un nouvel onglet : appuyez longuement sur l’image puis « Ajouter à Photos » ou « Enregistrer ».'
          : 'Votre carte a été téléchargée. Bienvenue dans la famille AS Vita Club !',
      );
    } catch {
      setStatus('error');
      setMessage(
        'Impossible de télécharger votre carte. Utilisez votre FAN ID ou réessayez plus tard.',
      );
    }
  };

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    void runDownload();
  }, [token]);

  return (
    <CardDownloadShell backHref="/telecharger-carte">
      <div className="card-download-status">
        <div
          className={`card-download-status__icon${
            status === 'error' ? ' card-download-status__icon--error' : ''
          }`}
          aria-hidden="true"
        >
          {status === 'loading' ? (
            <LoaderCircle className="card-download-status__glyph card-download-status__glyph--spin" />
          ) : status === 'success' ? (
            <Check className="card-download-status__glyph" strokeWidth={3} />
          ) : (
            <span className="card-download-status__glyph card-download-status__glyph--error">!</span>
          )}
        </div>

        <h1 className="reg-mobile__title">
          {status === 'loading'
            ? 'Téléchargement...'
            : status === 'success'
              ? 'Carte prête'
              : 'Échec'}
        </h1>

        <p
          className={`reg-mobile__subtitle card-download-status__message${
            status === 'error' ? ' card-download-status__message--error' : ''
          }`}
        >
          {message}
        </p>

        {status === 'error' ? (
          <button
            type="button"
            className="reg-mobile__cta card-download-cta"
            onClick={() => void runDownload()}
          >
            Réessayer
          </button>
        ) : null}

        {status === 'error' ? (
          <a href="/telecharger-carte" className="card-download-alt-link">
            Télécharger avec mon FAN ID
          </a>
        ) : null}
      </div>
    </CardDownloadShell>
  );
}
