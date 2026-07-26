import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminLogin } from '../api/admin';
import '../styles/admin.css';

type AdminLoginPageProps = {
  onSuccess: () => void;
};

export function AdminLoginPage({ onSuccess }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await adminLogin(password);
      toast.success('Connexion réussie');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__glow" aria-hidden="true" />
      <div className="admin-login__pattern" aria-hidden="true" />

      <form className="admin-login__card" onSubmit={handleSubmit}>
        <div className="admin-login__brand">
          <img src="/img/icon-new.png" alt="" className="admin-login__logo" />
          <p className="admin-login__eyebrow">AS Vita Club</p>
          <h1>Administration</h1>
          <p className="admin-login__lead">
            Accès réservé au suivi des inscriptions et paiements supporters.
          </p>
        </div>

        <label className="admin-login__field">
          <span>Mot de passe</span>
          <div className="admin-login__input">
            <Lock size={16} aria-hidden="true" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Saisir le mot de passe admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="admin-login__reveal"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button type="submit" className="admin-login__cta" disabled={loading || !password}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <p className="admin-login__secure">
          <ShieldCheck size={14} aria-hidden="true" />
          Espace sécurisé · usage interne uniquement
        </p>
      </form>
    </div>
  );
}
