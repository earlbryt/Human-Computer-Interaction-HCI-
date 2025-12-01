# Deploying the HCI Frontend to Vercel

This repository contains two main parts:

- `HCI/` – Next.js 15 frontend (the voice/Avatar UI)
- `livekit-voice-agent/` – Python LiveKit Agent (runs separately, **not** on Vercel)

This guide explains how to deploy **only the `HCI/` frontend** to Vercel.

---

## 1. Prerequisites

- A GitHub repository containing this project (already set up).
- A Vercel account linked to GitHub.
- Working LiveKit project (Cloud or self‑hosted) with:
  - `LIVEKIT_URL`
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`

The Python agent (`livekit-voice-agent/`) should be running separately (e.g. LiveKit Cloud worker, Docker, or your own infra).

---

## 2. Create a new Vercel project

1. Go to **https://vercel.com** and click **Add New → Project**.
2. Choose the GitHub repo that contains this code.
3. When Vercel analyzes the repo, click **Edit** to customize the project settings.

You’ll configure it as a **monorepo** project, with `HCI/` as the app root.

---

## 3. Configure project settings for the frontend

In the Vercel project settings (either during import or afterwards under **Settings → General**):

### Root Directory

Set **Root Directory** to:

```text
HCI
```

This tells Vercel to treat `HCI/` as the Next.js app directory.

### Framework Preset

Vercel should automatically detect **Next.js**. If not, set:

- **Framework Preset:** `Next.js`

### Build & Install Commands

The `HCI/package.json` uses **pnpm** with standard Next.js scripts:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start"
}
```

Recommended Vercel settings:

- **Install Command:**

  ```bash
  pnpm install
  ```

- **Build Command:**

  ```bash
  pnpm build
  ```

- **Output Directory:** (leave as default for Next.js, Vercel handles `.next` automatically.)

Vercel will use its own Node version compatible with Next.js 15; no extra config is usually needed.

---

## 4. Configure environment variables

The frontend needs to be able to mint LiveKit tokens via the Next.js API route:

`HCI/app/api/connection-details/route.ts`

This route reads the following environment variables:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

### Set env vars in Vercel

In your Vercel dashboard, open the project → **Settings → Environment Variables** and add:

- `LIVEKIT_URL` → e.g. `wss://YOUR_SUBDOMAIN.livekit.cloud`
- `LIVEKIT_API_KEY` → your LiveKit API key
- `LIVEKIT_API_SECRET` → your LiveKit API secret

Recommended:

- Set them for **Production**, and optionally **Preview** and **Development**, depending on how you work.

> You do **not** need to commit `.env.local` to Git; Vercel will inject these at build/runtime.

### Optional: custom connection endpoint

By default, the frontend calls:

```ts
TokenSource.endpoint('/api/connection-details');
```

If you set `NEXT_PUBLIC_CONN_DETAILS_ENDPOINT`, the frontend will call that instead. For a simple setup where Vercel hosts the frontend and the built‑in Next.js API route, you can **omit** this variable.

---

## 5. Trigger the first deploy

Once:

- Root directory is set to `HCI`
- Framework is `Next.js`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Env vars (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`) are configured

Then:

1. Click **Deploy** in Vercel, or
2. Push to `main` (or the branch Vercel is watching).

Vercel will:

- Install dependencies in `HCI/`
- Run `pnpm build`
- Host the app at a `*.vercel.app` URL

---

## 6. Verifying the deployment

After deploy:

1. Open the Vercel URL in your browser.
2. You should see the HCI voice agent UI.
3. Click the **“Talk to agent”** button.
   - The frontend will call `/api/connection-details` on Vercel.
   - That function will use your LiveKit credentials to create a room + participant token.
   - The browser connects to LiveKit, and LiveKit attaches your Python agent to the room.

If the call fails, check:

- **Vercel Logs → Function Logs** (for `/api/connection-details` errors)
- That `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` match the project where your agent is registered.

---

## 7. Notes about the backend agent

- The Python agent in `livekit-voice-agent/` is **not deployed on Vercel**.
- You should run it in one of these ways:
  - As a **LiveKit Cloud Agent worker**, using `livekit.toml`.
  - In a container (e.g. Docker) using the provided `Dockerfile`.
  - On your own server, as long as it can connect to the same LiveKit project.

As long as the agent is running and registered in the same LiveKit project the frontend uses, users connecting via your Vercel‑hosted frontend will be able to talk to it.
