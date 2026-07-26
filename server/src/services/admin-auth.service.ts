import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const TOKEN_TTL = '7d';

export type AdminTokenPayload = {
  role: 'admin';
};

function normalizeBcryptHash(hash: string): string {
  // Compat PHP ($2y$) / Python ($2b$) → forme acceptée par bcryptjs
  return hash.replace(/^\$2y\$/, '$2a$').replace(/^\$2b\$/, '$2a$');
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(env.admin.passwordHash && env.admin.jwtSecret !== 'change-me-in-production');
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = env.admin.passwordHash;
  if (!hash || !password) {
    return false;
  }

  return bcrypt.compare(password, normalizeBcryptHash(hash));
}

export function signAdminToken(): string {
  const payload: AdminTokenPayload = { role: 'admin' };
  return jwt.sign(payload, env.admin.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.admin.jwtSecret) as AdminTokenPayload;
    if (decoded?.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function loginAdmin(password: string): Promise<
  | { success: true; token: string }
  | { success: false; message: string }
> {
  if (!env.admin.passwordHash) {
    return {
      success: false,
      message: 'Admin non configuré (ADMIN_PASSWORD_HASH manquant).',
    };
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return { success: false, message: 'Mot de passe incorrect.' };
  }

  return { success: true, token: signAdminToken() };
}
