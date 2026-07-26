import { useCallback, useEffect, useState } from 'react';
import { Bounce, ToastContainer } from 'react-toastify';
import { AppNavigationProvider } from './context/AppNavigationContext';
import {
  ADMIN_LOGIN_PATH,
  ADMIN_PATH,
  HOME_PATH,
  isAdminPath,
  isCardDownloadPath,
  isCardVerifyPath,
  isTermsPath,
  readCardDownloadToken,
  TERMS_PATH,
} from './config/routes';
import { adminMe, clearAdminToken, getAdminToken } from './api/admin';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CardDownloadPage } from './pages/CardDownloadPage';
import { CardVerifyPage } from './pages/CardVerifyPage';
import { MemberCardLookupPage } from './pages/MemberCardLookupPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { TermsPage } from './pages/TermsPage';
import { WelcomePage } from './pages/WelcomePage';
import { parsePaymentReturnFromUrl } from './utils/paymentReturn';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

type ActiveFlow = 'welcome' | 'registration';

function resolveInitialFlow(): ActiveFlow {
  return parsePaymentReturnFromUrl() ? 'registration' : 'welcome';
}

function App() {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(resolveInitialFlow);
  const [showTerms, setShowTerms] = useState(() => isTermsPath(window.location.pathname));
  const [adminAuthed, setAdminAuthed] = useState<boolean | null>(null);
  const [adminPath, setAdminPath] = useState(() => isAdminPath(window.location.pathname));
  const cardDownloadToken = isCardDownloadPath(window.location.pathname)
    ? readCardDownloadToken(window.location.search)
    : null;
  const cardVerifyToken = isCardVerifyPath(window.location.pathname)
    ? readCardDownloadToken(window.location.search)
    : null;

  useEffect(() => {
    const syncRouteState = () => {
      setShowTerms(isTermsPath(window.location.pathname));
      setAdminPath(isAdminPath(window.location.pathname));
    };

    window.addEventListener('popstate', syncRouteState);
    return () => window.removeEventListener('popstate', syncRouteState);
  }, []);

  useEffect(() => {
    if (parsePaymentReturnFromUrl()) {
      setActiveFlow('registration');
    }
  }, []);

  useEffect(() => {
    if (!adminPath) {
      setAdminAuthed(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      if (!getAdminToken()) {
        if (!cancelled) setAdminAuthed(false);
        return;
      }
      const ok = await adminMe();
      if (!cancelled) setAdminAuthed(ok);
    })();

    return () => {
      cancelled = true;
    };
  }, [adminPath]);

  const openTerms = useCallback(() => {
    if (!isTermsPath(window.location.pathname)) {
      history.pushState({ showTerms: true }, '', TERMS_PATH);
    }
    setShowTerms(true);
  }, []);

  const closeTerms = useCallback(() => {
    if (isTermsPath(window.location.pathname)) {
      history.back();
      requestAnimationFrame(() => {
        if (isTermsPath(window.location.pathname)) {
          history.replaceState({}, '', HOME_PATH);
          setShowTerms(false);
        }
      });
      return;
    }

    setShowTerms(false);
  }, []);

  const enterAdmin = useCallback(() => {
    history.replaceState({}, '', ADMIN_PATH);
    setAdminPath(true);
    setAdminAuthed(true);
  }, []);

  const leaveAdmin = useCallback(() => {
    clearAdminToken();
    history.replaceState({}, '', ADMIN_LOGIN_PATH);
    setAdminAuthed(false);
    setAdminPath(true);
  }, []);

  const renderMainScreen = () => {
    if (adminPath) {
      if (adminAuthed === null) {
        return <div className="admin-login">Chargement…</div>;
      }

      if (!adminAuthed) {
        if (window.location.pathname !== ADMIN_LOGIN_PATH && window.location.pathname !== `${ADMIN_LOGIN_PATH}/`) {
          history.replaceState({}, '', ADMIN_LOGIN_PATH);
        }
        return <AdminLoginPage onSuccess={enterAdmin} />;
      }

      if (window.location.pathname === ADMIN_LOGIN_PATH || window.location.pathname === `${ADMIN_LOGIN_PATH}/`) {
        history.replaceState({}, '', ADMIN_PATH);
      }

      return <AdminDashboardPage onLogout={leaveAdmin} />;
    }

    if (isCardVerifyPath(window.location.pathname)) {
      return <CardVerifyPage token={cardVerifyToken ?? ''} />;
    }

    if (isCardDownloadPath(window.location.pathname)) {
      if (cardDownloadToken) {
        return <CardDownloadPage token={cardDownloadToken} />;
      }

      return <MemberCardLookupPage />;
    }

    if (activeFlow === 'welcome') {
      return <WelcomePage onStart={() => setActiveFlow('registration')} />;
    }

    return <RegistrationPage />;
  };

  return (
    <AppNavigationProvider openTerms={openTerms} closeTerms={closeTerms}>
      {renderMainScreen()}
      {showTerms && <TermsPage />}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
        limit={3}
      />
    </AppNavigationProvider>
  );
}

export default App;
