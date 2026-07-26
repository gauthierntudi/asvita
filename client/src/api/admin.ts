import { api } from './client';

const TOKEN_KEY = 'asvita_admin_token';

export type AdminSupporter = {
  id: number;
  firstname: string | null;
  lastname: string | null;
  middlename: string | null;
  gender: string | null;
  ageRange: string | null;
  phone: string | null;
  countryStatus: string | null;
  province: string | null;
  city: string | null;
  town: string | null;
  section: string | null;
  occupation: string | null;
  contribution: string | null;
  memberNumber: string | null;
  memberType: string | null;
  createdAt: string;
  deletedAt: string | null;
  paymentStatus: string | null;
  paymentAmount: string | null;
  paymentCurrency: string | null;
  paymentType: string | null;
  paymentPhone: string | null;
  paymentReference: string | null;
  flexpayReference: string | null;
};

export type AdminMetrics = {
  totalSupporters: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  simpleCount: number;
  premiumCount: number;
  conversionRate: number;
  revenueUsd: number;
  revenueCdf: number;
};

export type AdminListQuery = {
  page?: number;
  q?: string;
  status?: string;
  memberType?: string;
  activity?: string;
};

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminLogin(password: string): Promise<{ token: string }> {
  const { data } = await api.post<{ success: boolean; token?: string; message?: string }>(
    '/admin/login',
    { password },
  );

  if (!data.success || !data.token) {
    throw new Error(data.message || 'Connexion impossible.');
  }

  setAdminToken(data.token);
  return { token: data.token };
}

export async function adminMe(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const { data } = await api.get<{ success: boolean }>('/admin/me', {
      headers: authHeaders(),
    });
    return Boolean(data.success);
  } catch {
    clearAdminToken();
    return false;
  }
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await api.get<{ success: boolean; metrics: AdminMetrics }>('/admin/metrics', {
    headers: authHeaders(),
  });
  return data.metrics;
}

export async function fetchAdminSupporters(query: AdminListQuery = {}): Promise<{
  items: AdminSupporter[];
  page: number;
  total: number;
  totalPages: number;
}> {
  const { data } = await api.get<{
    success: boolean;
    items: AdminSupporter[];
    page: number;
    total: number;
    totalPages: number;
  }>('/admin/supporters', {
    params: {
      page: query.page ?? 1,
      perPage: 15,
      q: query.q || undefined,
      status: query.status || 'all',
      memberType: query.memberType || 'all',
      activity: query.activity || 'active',
    },
    headers: authHeaders(),
  });

  return data;
}

export async function deleteAdminSupporter(id: number): Promise<void> {
  await api.delete(`/admin/supporters/${id}`, {
    headers: authHeaders(),
  });
}

export async function reactivateAdminSupporter(id: number): Promise<void> {
  await api.post(
    `/admin/supporters/${id}/reactivate`,
    {},
    {
      headers: authHeaders(),
    },
  );
}
