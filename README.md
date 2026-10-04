# Scoop Manager Web

A separate responsive web client for Scoop Manager. It uses the same Supabase project and role model as the Expo mobile app, but it is an independent frontend project: mobile source, mobile build settings, and mobile database logic are not modified by this repository.

## Roles

- **Manager** — overview, freezer valuation, team controls, supplier and item operations, and Stats & Trends with server-side Spend, Earned, and highlighted Profit.
- **Data Entry** — daily operational workspace and restricted stock workspace. It never requests cash, prices, financial totals, or management tables. Local stock-issue drafts survive browser restarts.

The UI is not the security boundary. Supabase sessions, profile role checks, RLS policies, and existing role-aware RPCs remain authoritative.

## Local setup

```bash
pnpm install
# Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
pnpm run dev
```

The local app runs at `http://localhost:3000` by default.

## Validation

```bash
pnpm run check
pnpm vitest run client/src/lib/supabase.config.test.ts
pnpm run build
```

## Vercel setup

The repository is configured as a Vite static app with output in `dist/public`. Set these environment variables for **Production**, **Preview**, and **Development** in the Vercel project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Use only the browser-safe Supabase publishable key. Never put a service-role key in frontend environment variables.

The Vercel project should be connected to `huzayfahshoaib/ScoopManager` with the repository root as the root directory. The mobile Expo project remains a separate codebase.
