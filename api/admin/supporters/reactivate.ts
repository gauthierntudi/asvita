export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../../_lib/setup.js');
    const { assertAdmin } = await import('../../_lib/adminGuard.js');
    if (!assertAdmin(req, res)) return;
    const { reactivateAdminSupporter } = await import('../../_dist/services/admin.service.js');

    const idFromQuery = Number((req.query as { id?: string })?.id);
    const idFromBody = Number((req.body as { id?: number })?.id);
    const id = Number.isFinite(idFromQuery) && idFromQuery > 0 ? idFromQuery : idFromBody;

    if (!Number.isFinite(id) || id < 1) {
      res.status(400).json({ success: false, message: 'Identifiant invalide.' });
      return;
    }

    const result = await reactivateAdminSupporter(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
