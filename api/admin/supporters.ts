export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { assertAdmin } = await import('../_lib/adminGuard.js');
    if (!assertAdmin(req, res)) return;
    const { listAdminSupporters } = await import('../_dist/services/admin.service.js');
    const page = Number((req.query as { page?: string })?.page ?? 1);
    const perPage = Number((req.query as { perPage?: string })?.perPage ?? 15);
    const q = String((req.query as { q?: string })?.q ?? '');
    const status = String((req.query as { status?: string })?.status ?? 'all');
    const memberType = String((req.query as { memberType?: string })?.memberType ?? 'all');
    const activity = String((req.query as { activity?: string })?.activity ?? 'active');
    const data = await listAdminSupporters({ page, perPage, q, status, memberType, activity });
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
