import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../lib/prisma.js';
import {
  createCardDownloadToken,
  parseCardDownloadToken,
  buildCardVerifyPageUrl,
} from './card-token.service.js';
import { renderSvgToPng } from './card-renderer.js';

const CARD_WIDTH = 1003;
const CARD_HEIGHT = 649;
/** Juste après la colonne des « : » alignés sur les nouveaux templates. */
const VALUE_X = 268;
const FIELD_FONT_SIZE = 28;
const STANDARD_TEXT_COLOR = '#0e611a';
const PREMIUM_TEXT_COLOR = '#ffffff';

// Calibré sur le cadre QR des templates standard/premium (1003×649).
const QR_PLACEMENT = {
  left: 782,
  top: 405,
  size: 170,
};

type CardFieldLayout = {
  x: number;
  y: number;
  size: number;
  color: string;
  maxChars: number;
};

type CardLayout = {
  template: 'standard.png' | 'premium.png';
  fields: {
    lastname: CardFieldLayout;
    postname: CardFieldLayout;
    firstname: CardFieldLayout;
    fanId: CardFieldLayout;
    section: CardFieldLayout;
  };
};

const STANDARD_LAYOUT: CardLayout = {
  template: 'standard.png',
  fields: {
    lastname: { x: VALUE_X, y: 327, size: FIELD_FONT_SIZE, color: STANDARD_TEXT_COLOR, maxChars: 22 },
    postname: { x: VALUE_X, y: 368, size: FIELD_FONT_SIZE, color: STANDARD_TEXT_COLOR, maxChars: 22 },
    firstname: { x: VALUE_X, y: 407, size: FIELD_FONT_SIZE, color: STANDARD_TEXT_COLOR, maxChars: 22 },
    fanId: { x: VALUE_X, y: 494, size: FIELD_FONT_SIZE, color: STANDARD_TEXT_COLOR, maxChars: 16 },
    section: { x: VALUE_X, y: 532, size: FIELD_FONT_SIZE, color: STANDARD_TEXT_COLOR, maxChars: 24 },
  },
};

const PREMIUM_LAYOUT: CardLayout = {
  template: 'premium.png',
  fields: {
    lastname: { x: VALUE_X, y: 315, size: FIELD_FONT_SIZE, color: PREMIUM_TEXT_COLOR, maxChars: 22 },
    postname: { x: VALUE_X, y: 356, size: FIELD_FONT_SIZE, color: PREMIUM_TEXT_COLOR, maxChars: 22 },
    firstname: { x: VALUE_X, y: 397, size: FIELD_FONT_SIZE, color: PREMIUM_TEXT_COLOR, maxChars: 22 },
    fanId: { x: VALUE_X, y: 475, size: FIELD_FONT_SIZE, color: PREMIUM_TEXT_COLOR, maxChars: 16 },
    section: { x: VALUE_X, y: 516, size: FIELD_FONT_SIZE, color: PREMIUM_TEXT_COLOR, maxChars: 24 },
  },
};

function resolveAssetsDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, '../../assets/cards'),
    path.resolve(process.cwd(), 'server/assets/cards'),
    path.resolve(process.cwd(), 'assets/cards'),
    path.resolve(process.cwd(), 'api/assets/cards'),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'standard.png'))) {
      return candidate;
    }
  }

  throw new Error('Card templates introuvables.');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(value: string, maxChars: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars - 1)}…`;
}

function buildCardSvg(
  layout: CardLayout,
  templateBase64: string,
  qrBase64: string,
  values: {
    lastname: string;
    postname: string;
    firstname: string;
    fanId: string;
    section: string;
  },
): string {
  const textNodes = Object.entries(layout.fields)
    .map(([key, field]) => {
      const raw = values[key as keyof typeof values] ?? '';
      const text = escapeXml(truncate(raw, field.maxChars).toUpperCase());

      return `<text x="${field.x}" y="${field.y}" dominant-baseline="middle" font-family="Roboto, sans-serif" font-size="${field.size}" font-weight="700" fill="${field.color}">${text}</text>`;
    })
    .join('');

  return `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image href="data:image/png;base64,${templateBase64}" x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" /><g>${textNodes}</g><image href="data:image/png;base64,${qrBase64}" x="${QR_PLACEMENT.left}" y="${QR_PLACEMENT.top}" width="${QR_PLACEMENT.size}" height="${QR_PLACEMENT.size}" /></svg>`;
}

function buildQrPayload(supporter: {
  id?: number;
  memberNumber: string;
}): string {
  if (supporter.id != null) {
    return buildCardVerifyPageUrl(
      createCardDownloadToken(supporter.id, supporter.memberNumber),
    );
  }

  return supporter.memberNumber;
}

async function buildQrCodePng(value: string): Promise<Buffer> {
  const { default: QRCode } = await import('qrcode');

  return QRCode.toBuffer(value, {
    type: 'png',
    width: QR_PLACEMENT.size,
    margin: 0,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

async function loadPaidSupporterByToken(token: string) {
  const parsed = parseCardDownloadToken(token);
  if (!parsed) {
    return null;
  }

  const supporter = await prisma.supporter.findFirst({
    where: {
      id: parsed.supporterId,
      memberNumber: parsed.memberNumber,
      invoice: { status: 'paid' },
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      middlename: true,
      section: true,
      memberNumber: true,
      memberType: true,
    },
  });

  return supporter;
}

async function loadPaidSupporterByOrder(paymentKey: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ flexpayReference: paymentKey }, { reference: paymentKey }],
      status: 'paid',
    },
    select: {
      supporter: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          middlename: true,
          section: true,
          memberNumber: true,
          memberType: true,
        },
      },
    },
  });

  return invoice?.supporter ?? null;
}

async function loadPaidSupporterByFanId(fanId: string) {
  const digits = fanId.replace(/\D/g, '').trim();
  if (!digits) {
    return null;
  }

  const candidates = Array.from(new Set([digits, digits.padStart(8, '0')]));

  return prisma.supporter.findFirst({
    where: {
      memberNumber: { in: candidates },
      invoice: { status: 'paid' },
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      middlename: true,
      section: true,
      memberNumber: true,
      memberType: true,
    },
  });
}

function pickLayout(memberType: string | null | undefined): CardLayout {
  return memberType === 'premium' ? PREMIUM_LAYOUT : STANDARD_LAYOUT;
}

export async function generateSupporterCardPng(supporter: {
  id?: number;
  firstname: string | null;
  lastname: string | null;
  middlename: string | null;
  section: string | null;
  memberNumber: string | null;
  memberType: string | null;
}): Promise<Buffer> {
  if (!supporter.memberNumber) {
    throw new Error('Numéro de membre manquant.');
  }

  const layout = pickLayout(supporter.memberType);
  const templatePath = path.join(resolveAssetsDir(), layout.template);
  const templateBase64 = (await readFile(templatePath)).toString('base64');
  const values = {
    lastname: supporter.lastname ?? '',
    postname: supporter.middlename ?? '',
    firstname: supporter.firstname ?? '',
    fanId: supporter.memberNumber,
    section: supporter.section ?? '',
  };
  const qrCode = await buildQrCodePng(
    buildQrPayload({ id: supporter.id, memberNumber: supporter.memberNumber }),
  );
  const svg = buildCardSvg(layout, templateBase64, qrCode.toString('base64'), values);

  return renderSvgToPng(svg, CARD_WIDTH);
}

export async function verifyCardByToken(token: string) {
  const supporter = await loadPaidSupporterByToken(token);
  if (!supporter?.memberNumber) {
    return null;
  }

  return {
    valid: true as const,
    memberNumber: supporter.memberNumber,
    firstname: supporter.firstname,
    lastname: supporter.lastname,
    middlename: supporter.middlename,
    section: supporter.section,
    memberType: supporter.memberType === 'premium' ? 'premium' : 'standard',
  };
}

export async function getCardDownloadByToken(token: string) {
  const supporter = await loadPaidSupporterByToken(token);
  if (!supporter?.memberNumber) {
    return null;
  }

  const buffer = await generateSupporterCardPng(supporter);

  return {
    buffer,
    filename: `carte-vita-${supporter.memberNumber}.png`,
    memberNumber: supporter.memberNumber,
  };
}

export async function getCardDownloadByOrder(paymentKey: string) {
  const supporter = await loadPaidSupporterByOrder(paymentKey);
  if (!supporter?.memberNumber) {
    return null;
  }

  const buffer = await generateSupporterCardPng(supporter);

  return {
    buffer,
    filename: `carte-vita-${supporter.memberNumber}.png`,
    memberNumber: supporter.memberNumber,
    token: createCardDownloadToken(supporter.id, supporter.memberNumber),
  };
}

export async function getCardDownloadByFanId(fanId: string) {
  const supporter = await loadPaidSupporterByFanId(fanId);
  if (!supporter?.memberNumber) {
    return null;
  }

  const buffer = await generateSupporterCardPng(supporter);

  return {
    buffer,
    filename: `carte-vita-${supporter.memberNumber}.png`,
    memberNumber: supporter.memberNumber,
  };
}
