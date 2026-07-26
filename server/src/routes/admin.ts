import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { loginAdmin } from '../services/admin-auth.service.js';
import {
  deleteAdminSupporter,
  getAdminMetrics,
  getAdminSupporter,
  listAdminSupporters,
  reactivateAdminSupporter,
} from '../services/admin.service.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const password = String(req.body?.password ?? '');
    const result = await loginAdmin(password);

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.json(result);
  }),
);

router.get(
  '/me',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json({ success: true, role: 'admin' });
  }),
);

router.get(
  '/metrics',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json({ success: true, metrics: await getAdminMetrics() });
  }),
);

router.get(
  '/supporters',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.perPage ?? 15);
    const q = String(req.query.q ?? '');
    const status = String(req.query.status ?? 'all');
    const memberType = String(req.query.memberType ?? 'all');
    const activity = String(req.query.activity ?? 'active');
    const data = await listAdminSupporters({ page, perPage, q, status, memberType, activity });
    res.json({ success: true, ...data });
  }),
);

router.get(
  '/supporters/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ success: false, message: 'Identifiant invalide.' });
      return;
    }

    const item = await getAdminSupporter(id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Supporter introuvable.' });
      return;
    }

    res.json({ success: true, item });
  }),
);

router.delete(
  '/supporters/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ success: false, message: 'Identifiant invalide.' });
      return;
    }

    const result = await deleteAdminSupporter(id);
    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.json(result);
  }),
);

router.post(
  '/supporters/:id/reactivate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ success: false, message: 'Identifiant invalide.' });
      return;
    }

    const result = await reactivateAdminSupporter(id);
    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.json(result);
  }),
);

export default router;
