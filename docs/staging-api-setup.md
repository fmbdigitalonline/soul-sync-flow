# Soul Sync Staging API (Step 1)

This guide creates an isolated staging API stack:

```text
[ External Tester ]
        ↓
    Hosted API Server (NEW)
        ↓
   Existing Core Engine (imported)
        ↓
   Staging Database (NEW)
```

## 1) Duplicate the environment safely

1. Create a dedicated branch (or private clone) for staging work:
   - `soul-sync-api-staging`
2. Create a separate database:
   - **Supabase:** create project `soulsync-staging`
   - **Postgres:** create a fresh instance on Railway/Render
3. Never reuse production DB credentials in staging.

## 2) Lightweight API server

A standalone TypeScript Fastify server is provided under `api-server/`.

### Folder layout

```text
api-server/
  server.ts
  routes/
  services/
```

### Endpoints

- `GET /health`
- `POST /pipeline/process-message` → `unifiedBrainService.processMessage()`
- `POST /pipeline/create-persona` → `personalityFusionService.generatePersonalityFusion()`
- `POST /pipeline/resolve-conflicts` → `conflictNavigationResolution.resolveConflicts()`
- `POST /pipeline/update-weights` → `personalityFusionService.updateWeightsFromFeedback()`

### Local run

```bash
cd api-server
npm install
npm run dev
```

## 3) Render deployment (easiest)

1. Create a Render Web Service from this repository/branch.
2. Set root directory to `api-server`.
3. Build command: `npm install`
4. Start command: `npm run start`
5. Add environment variables:
   - `DATABASE_URL`
   - `OPENAI_KEY`
   - `API_SECRET`
   - (and any Supabase keys your imported core services require)
6. Deploy.

## 4) Isolation checklist

- [ ] staging API URL is separate from production
- [ ] staging DB URL is separate from production
- [ ] all staging secrets are unique
- [ ] test data only exists in staging
