import { extractBearerToken } from '../_dist/middleware/adminAuth.js';
import { verifyAdminToken } from '../_dist/services/admin-auth.service.js';

export function assertAdmin(req: { headers?: { authorization?: string } }, res: {
  status: (code: number) => { json: (body: unknown) => void };
}): boolean {
  const token = extractBearerToken(req.headers?.authorization);
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ success: false, message: 'Authentification requise.' });
    return false;
  }
  return true;
}
