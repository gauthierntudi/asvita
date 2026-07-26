/**
 * Prépare la base avant `prisma db push` (colonnes requises sur tables existantes).
 *
 * Usage: node scripts/prepare-schema-push.mjs
 */
import './load-env.mjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function tableExists(table) {
  const rows = await prisma.$queryRaw`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ${table}
    LIMIT 1
  `;

  return rows.length > 0;
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRaw`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;

  return rows.length > 0;
}

async function ensureInvoiceUpdatedAt() {
  // DB fraîche : prisma db push créera les tables — rien à préparer.
  if (!(await tableExists('invoices'))) {
    return;
  }

  if (await columnExists('invoices', 'updated_at')) {
    return;
  }

  await prisma.$executeRaw`
    ALTER TABLE invoices
    ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  `;

  await prisma.$executeRaw`
    UPDATE invoices
    SET updated_at = created_at
  `;

  console.log('Préparation: colonne invoices.updated_at ajoutée.');
}

async function main() {
  await ensureInvoiceUpdatedAt();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
