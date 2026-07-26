export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { assertAdmin } = await import('../_lib/adminGuard.js');
    if (!assertAdmin(req, res)) return;
    res.status(200).json({ success: true, role: 'admin' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
