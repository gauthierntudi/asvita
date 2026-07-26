import crypto from 'node:crypto';
import { env } from '../config/env.js';

function signingSecret(): string {
  return (
    process.env.CARD_DOWNLOAD_SECRET?.trim() ||
    env.flexpay.token ||
    'asvita-card-dev-secret'
  );
}

export function createCardDownloadToken(supporterId: number, memberNumber: string): string {
  const signature = crypto
    .createHmac('sha256', signingSecret())
    .update(`${supporterId}:${memberNumber}`)
    .digest('base64url');

  return `${supporterId}.${memberNumber}.${signature}`;
}

export function parseCardDownloadToken(
  token: string,
): { supporterId: number; memberNumber: string } | null {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [supporterIdRaw, memberNumber, signature] = parts;
  const supporterId = Number(supporterIdRaw);

  if (!Number.isInteger(supporterId) || supporterId <= 0 || !memberNumber || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac('sha256', signingSecret())
    .update(`${supporterId}:${memberNumber}`)
    .digest('base64url');

  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    provided.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(provided, expectedBuffer)
  ) {
    return null;
  }

  return { supporterId, memberNumber };
}

export function buildCardDownloadPageUrl(token: string): string {
  return `${env.webUrl}/telecharger-carte?token=${encodeURIComponent(token)}`;
}

export function buildCardVerifyPageUrl(token: string): string {
  return `${env.webUrl}/verifier-carte?token=${encodeURIComponent(token)}`;
}

export function buildCardDownloadApiUrl(token: string): string {
  return `${env.appUrl}/api/cards/download?token=${encodeURIComponent(token)}`;
}

export function buildCardLinksForSupporter(supporterId: number, memberNumber: string) {
  const token = createCardDownloadToken(supporterId, memberNumber);

  return {
    token,
    cardDownloadUrl: buildCardDownloadApiUrl(token),
    cardDownloadPageUrl: buildCardDownloadPageUrl(token),
    cardVerifyPageUrl: buildCardVerifyPageUrl(token),
  };
}
