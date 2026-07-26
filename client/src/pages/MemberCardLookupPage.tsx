import { useState, type FormEvent } from 'react';
import { CtaArrow } from '../components/icons/CtaArrow';
import { CardDownloadShell } from '../components/card/CardDownloadShell';
import { fetchAndDownloadCard } from '../api/cards';

export function MemberCardLookupPage() {
  const [fanId, setFanId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = fanId.replace(/\D/g, '').trim();

    if (!normalized) {
      setError('Veuillez saisir votre FAN ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchAndDownloadCard(
        { fanId: normalized },
        `carte-vita-${normalized.padStart(8, '0')}.png`,
      );
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'Impossible de télécharger votre carte pour le moment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardDownloadShell>
      <div className="card-download-intro">
        <img
          className="card-download-intro__logo"
          src="/img/logo-new.png"
          alt="AS Vita"
        />
        <h1 className="reg-mobile__title">Télécharger ma carte</h1>
        <p className="reg-mobile__subtitle">
          Entrez votre FAN ID pour récupérer votre carte de supporter officielle.
        </p>
      </div>

      <form className="reg-mobile__form card-download-form" onSubmit={handleSubmit}>
        <label className="reg-mobile__field">
          <span className="visually-hidden">FAN ID</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="FAN ID"
            value={fanId}
            onChange={(event) => setFanId(event.target.value)}
            disabled={loading}
            required
          />
        </label>

        {error ? (
          <p className="card-download-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="reg-mobile__cta card-download-cta"
          disabled={loading}
        >
          {loading ? 'Génération...' : 'Télécharger ma carte'}
          {!loading ? <CtaArrow className="reg-mobile__cta-icon" /> : null}
        </button>
      </form>
    </CardDownloadShell>
  );
}
