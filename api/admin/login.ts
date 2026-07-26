export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    await import('../_lib/setup.js');
    const { loginAdmin } = await import('../_dist/services/admin-auth.service.js');
    const password = String((req.body as { password?: string })?.password ?? '');
    const result = await loginAdmin(password);
    res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
