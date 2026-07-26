export const HOME_PATH = '/';
export const TERMS_PATH = '/conditions-d-utilisation';
export const CARD_DOWNLOAD_PATH = '/telecharger-carte';
export const CARD_VERIFY_PATH = '/verifier-carte';
export const ADMIN_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';

export function isTermsPath(pathname = window.location.pathname): boolean {
  return pathname === TERMS_PATH || pathname === `${TERMS_PATH}/`;
}

export function isCardDownloadPath(pathname = window.location.pathname): boolean {
  return pathname === CARD_DOWNLOAD_PATH || pathname === `${CARD_DOWNLOAD_PATH}/`;
}

export function isCardVerifyPath(pathname = window.location.pathname): boolean {
  return pathname === CARD_VERIFY_PATH || pathname === `${CARD_VERIFY_PATH}/`;
}

export function isAdminPath(pathname = window.location.pathname): boolean {
  return (
    pathname === ADMIN_PATH ||
    pathname === `${ADMIN_PATH}/` ||
    pathname === ADMIN_LOGIN_PATH ||
    pathname === `${ADMIN_LOGIN_PATH}/` ||
    pathname.startsWith(`${ADMIN_PATH}/`)
  );
}

export function isAdminLoginPath(pathname = window.location.pathname): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`;
}

export function readCardDownloadToken(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  const token = params.get('token')?.trim();
  return token || null;
}
