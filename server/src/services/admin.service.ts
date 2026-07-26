import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export type AdminSupporterRow = {
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

export type AdminListFilters = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: string;
  memberType?: string;
  activity?: string;
};

const activeSupporter: Prisma.SupporterWhereInput = { deletedAt: null };

function decimalToString(value: { toString(): string } | null | undefined): string | null {
  if (value == null) return null;
  return value.toString();
}

function mapSupporterRow(row: {
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
  createdAt: Date;
  deletedAt: Date | null;
  invoice: {
    status: string;
    amount: { toString(): string } | null;
    currency: string | null;
    paymentType: string | null;
    paymentPhone: string | null;
    reference: string | null;
    flexpayReference: string | null;
  } | null;
}): AdminSupporterRow {
  return {
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    middlename: row.middlename,
    gender: row.gender,
    ageRange: row.ageRange,
    phone: row.phone,
    countryStatus: row.countryStatus,
    province: row.province,
    city: row.city,
    town: row.town,
    section: row.section,
    occupation: row.occupation,
    contribution: row.contribution,
    memberNumber: row.memberNumber,
    memberType: row.memberType,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    paymentStatus: row.invoice?.status ?? null,
    paymentAmount: decimalToString(row.invoice?.amount),
    paymentCurrency: row.invoice?.currency ?? null,
    paymentType: row.invoice?.paymentType ?? null,
    paymentPhone: row.invoice?.paymentPhone ?? null,
    paymentReference: row.invoice?.reference ?? null,
    flexpayReference: row.invoice?.flexpayReference ?? null,
  };
}

function buildWhere(filters: AdminListFilters): Prisma.SupporterWhereInput {
  const where: Prisma.SupporterWhereInput = {};
  const q = filters.q?.trim();
  const activity = filters.activity || 'active';

  if (activity === 'deleted') {
    where.deletedAt = { not: null };
  } else if (activity !== 'all') {
    where.deletedAt = null;
  }

  if (q) {
    where.OR = [
      { firstname: { contains: q, mode: 'insensitive' } },
      { lastname: { contains: q, mode: 'insensitive' } },
      { middlename: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { memberNumber: { contains: q, mode: 'insensitive' } },
      { section: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (filters.memberType && filters.memberType !== 'all') {
    where.memberType = filters.memberType;
  }

  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'none') {
      where.invoice = null;
    } else {
      where.invoice = { status: filters.status };
    }
  }

  return where;
}

export async function listAdminSupporters(filters: AdminListFilters = {}): Promise<{
  items: AdminSupporterRow[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, filters.page ?? 1);
  const safePerPage = Math.min(50, Math.max(1, filters.perPage ?? 15));
  const skip = (safePage - 1) * safePerPage;
  const where = buildWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.supporter.count({ where }),
    prisma.supporter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: safePerPage,
      include: { invoice: true },
    }),
  ]);

  return {
    items: rows.map(mapSupporterRow),
    page: safePage,
    perPage: safePerPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePerPage)),
  };
}

export async function getAdminSupporter(id: number): Promise<AdminSupporterRow | null> {
  const row = await prisma.supporter.findUnique({
    where: { id },
    include: { invoice: true },
  });
  return row ? mapSupporterRow(row) : null;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [totalSupporters, paidInvoices, pendingCount, failedCount, simpleCount, premiumCount] =
    await Promise.all([
      prisma.supporter.count({ where: activeSupporter }),
      prisma.invoice.findMany({
        where: { status: 'paid', supporter: activeSupporter },
        select: { amount: true, currency: true },
      }),
      prisma.invoice.count({ where: { status: 'pending', supporter: activeSupporter } }),
      prisma.invoice.count({ where: { status: 'failed', supporter: activeSupporter } }),
      prisma.supporter.count({ where: { ...activeSupporter, memberType: 'simple' } }),
      prisma.supporter.count({ where: { ...activeSupporter, memberType: 'premium' } }),
    ]);

  let revenueUsd = 0;
  let revenueCdf = 0;

  for (const invoice of paidInvoices) {
    const amount = Number(invoice.amount ?? 0);
    if ((invoice.currency ?? '').toUpperCase() === 'USD') {
      revenueUsd += amount;
    } else {
      revenueCdf += amount;
    }
  }

  const paidCount = paidInvoices.length;
  const conversionRate =
    totalSupporters > 0 ? Math.round((paidCount / totalSupporters) * 1000) / 10 : 0;

  return {
    totalSupporters,
    paidCount,
    pendingCount,
    failedCount,
    simpleCount,
    premiumCount,
    conversionRate,
    revenueUsd: Math.round(revenueUsd * 100) / 100,
    revenueCdf: Math.round(revenueCdf * 100) / 100,
  };
}

export async function deleteAdminSupporter(
  id: number,
): Promise<{ success: true } | { success: false; message: string }> {
  const existing = await prisma.supporter.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, message: 'Supporter introuvable.' };
  }

  if (existing.deletedAt) {
    return { success: true };
  }

  await prisma.supporter.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}

export async function reactivateAdminSupporter(
  id: number,
): Promise<{ success: true } | { success: false; message: string }> {
  const existing = await prisma.supporter.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, message: 'Supporter introuvable.' };
  }

  if (!existing.deletedAt) {
    return { success: true };
  }

  await prisma.supporter.update({
    where: { id },
    data: { deletedAt: null },
  });

  return { success: true };
}
