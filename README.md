# AI Website Frontend

## Setup

1. `npm install`
2. Start the API (`../Ai-Website-API`, port 3000): `npm run dev`
3. Start the frontend: `npm run dev` → http://localhost:5173

## `.env`

One file, one variable:

```env
VITE_API_BASE_URL=
```

Leave it empty locally so Vite proxies `/api` to `http://localhost:3000`. Production builds use `https://ai-website-api.vercel.app` automatically when it is empty.

To point local dev at the deployed API, set `VITE_API_BASE_URL=https://ai-website-api.vercel.app`.
