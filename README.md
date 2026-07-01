# AI Website Builder — Frontend

React + Vite frontend for the AI-powered website builder. Users can generate websites from prompts, edit them visually with drag-and-drop, and publish them.

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** — dev server & bundler
- **Tailwind CSS 4** — utility-first styling
- **Better Auth** (client) — email OTP + Google OAuth
- **TanStack React Query 5** — server state & caching
- **React Router 7** — client-side routing
- **@dnd-kit** — drag-and-drop editor
- **Framer Motion** — page & component animations
- **Axios** — HTTP client (credentials: include)
- **Sonner** — toast notifications

## Requirements

- Node.js >= 20
- npm or yarn

## Environment Variables

```env
VITE_API_BASE_URL=
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `""` (proxied) | Backend API URL. Empty = Vite proxies `/api` to `http://localhost:5000` |
| `VITE_PRODUCTION_API` | No | `https://ai-website-api.onrender.com` | Production API URL override |
| `VITE_PRODUCTION_FRONTEND` | No | `https://ai-website-henna-eight.vercel.app` | Production frontend URL override |

## Quick Start

> **Note:** This is the frontend only. The backend (`Ai-Website-API/`) must also be running.

### 1. Install & start the backend (separate terminal)

```bash
cd ../Ai-Website-API
npm install
npx prisma db push
npm run dev
```

### 2. Install & start the frontend

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically. No `.env` changes needed for local development.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Run TypeScript compiler + Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project Structure

```
src/
├── Pages/              # Route-level page components
│   ├── auth/           # Sign-in / sign-up pages
│   ├── Home.tsx
│   ├── Builder.tsx     # AI website builder view
│   ├── Project.tsx     # User's projects list
│   ├── editorpage.tsx  # Visual drag-and-drop editor
│   ├── Comunity.tsx    # Published community websites
│   ├── Price.tsx       # Pricing / credits
│   └── Setting.tsx     # Account settings
├── components/         # Reusable UI components
│   ├── ui/             # shadcn-style primitives
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Btn.tsx
├── config/             # Environment variables
├── configs/            # Axios instance
├── lib/                # Auth client, utils, error helpers
├── types/              # TypeScript type definitions
├── assets/             # Static assets (images, schema)
├── App.tsx             # Root component with routes
├── main.tsx            # Entry point
└── index.css           # Global styles + Tailwind
```

## Routing

| Path | Page | Auth Required |
|------|------|:---:|
| `/` | Home | |
| `/comunity` | Community websites | |
| `/price` | Pricing plans | |
| `/project` | User's projects | ✅ |
| `/project/:projectId` | AI builder for a project | ✅ |
| `/preview/:projectId` | Preview a project | ✅ |
| `/editor/:projectId` | Visual drag-and-drop editor | ✅ |
| `/auth/:pathname` | Sign-in / sign-up | |
| `/account/settings` | Account settings | ✅ |

## Authentication

Uses Better Auth with email OTP (one-time password) and optional Google OAuth.  
The auth client is configured at `src/lib/auth-client.ts` and session is checked via `authClient.useSession()`.

## Troubleshooting

- **CORS errors** — The Vite proxy handles this in development. For production, ensure the API's `TRUSTED_ORIGINS` includes your frontend URL.
- **Auth redirects to sign-in** — Make sure the backend is running and `VITE_API_BASE_URL` points to it (or leave it empty for proxying).
- **`@` path alias not working** — The `@` alias maps to `src/` via `vite.config.js`. Your editor may need TypeScript config: check `tsconfig.app.json` for the path mapping.

## Deployment

Deploy to Vercel:

1. Set root directory to `Ai-Website`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-api.com`
