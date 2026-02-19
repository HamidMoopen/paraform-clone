# paraform-clone

A minimal job board application (candidate and hiring manager flows).

## Setup

1. Create a [Supabase](https://supabase.com) project at supabase.com.
2. Copy `.env.example` to `.env` and fill in your Supabase connection strings (Project Settings → Database).
3. Run `npx prisma migrate dev` to create tables.
4. Run `npx prisma db seed` to populate demo data.
5. Run `npm run dev` and open http://localhost:3000.

Everything else across the phases stays the same.
