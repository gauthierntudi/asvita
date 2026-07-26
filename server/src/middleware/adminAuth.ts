import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/admin-auth.service.js';

export type AdminRequest = Request & {
  admin?: { role: 'admin' };
};

export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentification requise.' });
    return;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: 'Session expirée ou invalide.' });
    return;
  }

  req.admin = payload;
  next();
}

export function extractBearerToken(authorization: string | undefined): string {
  const header = authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}
