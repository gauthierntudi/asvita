import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  parseSupporterPayload,
  toSupporterData,
  type SupporterInput,
} from '../utils/payload.js';
import { normalizeStoragePhone, phoneLookupVariants } from '../utils/phone.js';
import { isAdminBypassPhone } from '../config/admin-phones.js';

export async function upsertSupporter(
  input: SupporterInput,
  options: { includeMemberType?: boolean } = {},
): Promise<number> {
  const includeMemberType = options.includeMemberType ?? false;
  const normalizedPhone = normalizeStoragePhone(input.phone);
  const existing = await prisma.supporter.findFirst({
    where: { phone: { in: phoneLookupVariants(input.phone) } },
    select: { id: true },
  });

  const data = toSupporterData(
    { ...input, phone: normalizedPhone },
    includeMemberType,
  ) as Prisma.SupporterUpdateInput;

  if (existing) {
    await prisma.supporter.update({
      where: { id: existing.id },
      data: {
        ...data,
        phone: normalizedPhone,
        deletedAt: null,
      },
    });
    return existing.id;
  }

  const created = await prisma.supporter.create({
    data: {
      ...(data as Prisma.SupporterCreateInput),
      phone: normalizedPhone,
    },
  });

  return created.id;
}

export function parseBodyToSupporter(body: Record<string, unknown>): SupporterInput {
  return parseSupporterPayload(body);
}

export async function checkPhone(phone: string) {
  if (isAdminBypassPhone(phone)) {
    return { success: true as const, exists: false as const };
  }

  const supporter = await prisma.supporter.findFirst({
    where: {
      phone: { in: phoneLookupVariants(phone) },
      deletedAt: null,
    },
  });

  if (!supporter) {
    return { success: true as const, exists: false as const };
  }

  const paidInvoice = await prisma.invoice.findUnique({
    where: { supporterId: supporter.id },
    select: { id: true, status: true },
  });

  if (paidInvoice?.status === 'paid') {
    return {
      success: true as const,
      exists: true as const,
      is_paid: true as const,
      message: 'Ce numéro est déjà utilisé.',
      member_number: supporter.memberNumber,
    };
  }

  return {
    success: true as const,
    exists: true as const,
    is_paid: false as const,
    data: {
      firstname: supporter.firstname,
      lastname: supporter.lastname,
      middlename: supporter.middlename,
      gender: supporter.gender,
      age: supporter.ageRange,
      age_range: supporter.ageRange,
      country_status: supporter.countryStatus,
      province: supporter.province,
      city: supporter.city,
      town: supporter.town,
      section: supporter.section,
      occupation: supporter.occupation,
      contribution: supporter.contribution,
      merch: supporter.merch,
      years: supporter.years,
      training_freq: supporter.trainingFreq,
      match_freq: supporter.matchFreq,
      follow_method: supporter.followMethod,
      social_fb: supporter.socialFb,
      social_x: supporter.socialX,
      social_ig: supporter.socialIg,
      social_tt: supporter.socialTt,
      member_type: supporter.memberType,
    },
  };
}
