# AI Website Frontend

This frontend sends a prompt to the backend and shows the generated website live inside a preview frame.

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env`:
   - `VITE_API_BASE_URL=http://localhost:3000`
3. Start dev server:
   - `npm run dev`

## How it works

- Prompt input is submitted from `Home.tsx`.
- The app calls `POST /api/generate` on the backend.
- Returned HTML is rendered in an `iframe` using `srcDoc`.
