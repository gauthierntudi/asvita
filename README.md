# asvita

Migration **AS Vita** (inscription supporter) vers **React + Node + PostgreSQL (Neon)** avec **Prisma**.

Sous-projet React du dossier **ASVITA** (remplace progressivement le frontend PHP/HTML).

## Structure

```
asvita/
├── client/          # React (Vite + TypeScript)
├── server/          # API Express + Prisma Client
├── prisma/          # Schéma PostgreSQL (Neon)
└── package.json     # Monorepo npm workspaces
```

## Prérequis

- Node.js 20+
- Compte [Neon](https://neon.tech) (PostgreSQL)

## Installation

```bash
cd asvita
cp .env.example .env
cp client/.env.example client/.env

# Renseigner DATABASE_URL Neon dans .env
npm install
npm run db:generate
npm run db:push
```

## Développement

```bash
# API (4000) + React (5173)
npm run dev
```

- Frontend : http://localhost:5173
- API health : http://localhost:4000/api/health

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance client + server |
| `npm run dev:client` | React seul |
| `npm run dev:server` | API seule |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Pousse le schéma vers Neon |
| `npm run db:migrate` | Migration Prisma (prod) |
| `npm run db:studio` | Prisma Studio |

## Schéma Prisma

Tables migrées depuis ASVITA :

- `supporters` — profil supporter
- `invoices` — factures / paiements FlexPay

## Prochaines étapes

1. Porter les 5 étapes du formulaire (`index.html` → composants React)
2. Implémenter les routes API : drafts, check-phone, payments, callback
3. Brancher FlexPay + Twilio
4. Admin : `/admin` (login JWT + liste supporters)
5. Brancher FlexPay + Twilio

## Variables d'environnement

Voir `.env.example` (Neon, FlexPay, Twilio, JWT admin).

### Accès admin

1. Renseigner `ADMIN_PASSWORD_HASH` (bcrypt) et `JWT_SECRET` dans `.env`
2. Ouvrir `/admin` (ou `/admin/login`)
3. Se connecter avec le mot de passe admin
