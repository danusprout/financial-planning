# Financial Planning

Personal financial planning web app — replaces a Google Sheets workflow.

Built with Next.js, Supabase, Tailwind CSS v4, and shadcn/ui.

## Features

- 📥 Pemasukan (Income tracking per month)
- 💸 Pengeluaran Harian (Daily expense log)
- 🏦 Tabungan (Multi-goal savings)
- 🔄 Cicilan / Hutang (Installment tracking with hybrid payment model)
- 📊 Dashboard ringkasan bulanan

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Email**: Nodemailer + React Email
- **Deployment**: Vercel

## Getting Started

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill in `.env.local` with your Supabase credentials and SMTP config.

3. Install dependencies:

```bash
pnpm install
```

4. Run migrations on Supabase, then start dev server:

```bash
pnpm dev
```

## Environment Variables

See `.env.example` for all required variables.
