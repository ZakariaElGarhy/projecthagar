# Home Decor Journal

Home Decor Journal is a photo-led editorial site for room inspiration, product guides, and small-space ideas. It includes a public journal and a login-protected publishing dashboard.

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
```

Start the API and web workflows from Replit, or run them separately:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/home-decor-journal run dev
```

The API seeds 15 sample posts and creates a demo editor account the first time it starts against an empty database.

## Demo login

- Username: `editor`
- Password: `linenandloam`

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` before the first API boot to use different credentials. Keep `SESSION_SECRET` set in the environment for signed session cookies.

## Project map

- `src/App.tsx` — route map and application providers
- `src/components/journal-ui.tsx` — shared journal shell, cards, and editorial UI
- `src/pages/` — home, category, post detail, login, and dashboard screens
- `src/index.css` — light/dark theme tokens, typography, and motion
- `../../lib/api-spec/openapi.yaml` — API contract
- `../../artifacts/api-server/src/routes/` — API implementation