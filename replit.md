# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-stack admin panel (لوحة التحكم) for Travel Valet Düsseldorf — a travel valet booking service. The admin panel allows complete control over the WordPress-powered website content without changing its design.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Language/RTL**: Arabic (RTL), Cairo font

## Artifacts

- **admin-panel** (`/`) — Arabic admin dashboard for Travel Valet Düsseldorf
  - `/` — Dashboard overview with live WordPress stats
  - `/wp-settings` — Edit WordPress site title, tagline, admin email (live WP API)
  - `/wp-pages` — Create/edit/delete WordPress pages (live WP API)
  - `/wp-posts` — Create/edit/delete WordPress blog posts (live WP API)
  - `/settings` — Edit all site text stored in local DB (hero, about, booking, footer, meta)
  - `/sections` — Manage and reorder website sections with drag-and-drop
  - `/contact` — WhatsApp, email, phone, address, social links, booking URL
  - `/colors` — Visual color picker for all site theme colors

- **api-server** (`/api`) — Express REST API backend
  - `/api/wp/settings` — WordPress settings proxy (GET/PATCH)
  - `/api/wp/pages` — WordPress pages proxy (GET/POST/PATCH/DELETE)
  - `/api/wp/posts` — WordPress posts proxy (GET/POST/PATCH/DELETE)
  - `/api/wp/media` — WordPress media proxy
  - `/api/wp/categories` — WordPress categories proxy

## WordPress Integration

- **Site URL**: `https://traveldüsseldorf.de` (IDN: `xn--traveldsseldorf-5vb.de`)
- **WP_SITE_URL** env var — WordPress site URL
- **WP_USERNAME** env var — WordPress admin username
- **WP_APP_PASSWORD** secret — WordPress Application Password
- All WP requests use HTTP Basic Auth with base64-encoded `username:app_password`
- WordPress REST API proxied at `/api/wp/*` — frontend calls these, never calls WP directly

## Database Tables

- `site_settings` — All text content of the website
- `sections` — Website sections with visibility and sort order
- `contact_info` — WhatsApp, email, phone, address, booking URLs
- `color_theme` — Color palette for the entire site

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
