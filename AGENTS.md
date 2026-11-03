# AGENTS.md

> Guidance for AI coding agents working in this repo. Read this first.
> **Before building, changing, or debugging anything: verify live state** (read the actual
> code, schema, config, and deployed branch). Do not act on stale assumptions.

## What this is

YouTube Audio Plus is a Chrome Manifest V3 extension that adds in-player audio controls to YouTube.

The product lives on `youtube.com`. The popup is a small control surface (enable/disable, open YouTube). The equalizer and related audio UI inject into the YouTube player.

## Stack

- TypeScript, React 19, Vite 7, `@crxjs/vite-plugin`
    - TypeScript with strict mode enabled
- Tailwind CSS v3 for the in-player UI; plain CSS for the popup
- Framer Motion for panel transitions; Lucide for icons
- Web Audio API for DSP (page main world only)
- Package manager: `npm`

## Commands

- Install: `npm install`
- Dev: `npm run dev` (Vite on port 5173, `strictPort`)
- Build: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`

Prefer `npm run lint` and a typecheck via `npm run build` after meaningful changes.

Load the unpacked build from `dist/` in `chrome://extensions` to verify player injection and popup behavior.

## Runtime surfaces

Keep these layers separate. Do not collapse them.

| Surface | Location | World | Role |
|---|---|---|---|
| Popup | `src/App.tsx`, `src/components/popup/`, `src/popup.css` | Extension | Enable/disable, branding, links |
| Content script | `src/content/` | Isolated | Mount UI, inject the engine, bridge storage ↔ page |
| Injected script | `src/injected/` | Page main world | Attach Web Audio to `<video>` and apply settings |
| In-player UI | `src/components/` (except `popup/`) | Isolated, Shadow DOM | Button + settings panel inside the player |

Shared state keys live in Chrome `storage.sync` (`ytAudioEnabled`, `ytAudioSettings`). The content script is the only layer that should talk to `chrome.*` APIs and then forward state into the page with `window.postMessage`. The injected script must not call `chrome.*`.

## Architecture rules

- Web Audio must run in the page main world. Isolated content scripts cannot attach to YouTube’s `<video>`.
- A media element can have only one `MediaElementSourceNode` for its lifetime. Attach once and reconnect; never create a second source for the same element.
- In-player UI mounts in open Shadow DOM with inlined styles so YouTube CSS and extension CSS do not leak into each other.
- Tailwind `preflight` is off for that reason. Do not turn it on.
- YouTube is an SPA. Player chrome and `<video>` nodes come and go. Mounting, unmounting, and audio attach must survive navigation, ads, and Picture-in-Picture.
- Prefer matching YouTube’s existing player selectors and overlay patterns over inventing a parallel UI chrome.
- Path alias: `@/` → `src/`.

## UI conventions

Two visual systems:

- **In-player panel** — dark, YouTube-token colors (`yt-*` in Tailwind), Roboto, sits in the player. This is where audio controls belong.
- **Toolbar popup** — light, standalone CSS in `popup.css`, enable switch and outbound links only. Do not put the equalizer here.

## Constraints

- TypeScript strict. Avoid new `any`
- Do not expand `permissions` or `host_permissions` without asking
- Do not restyle or break YouTube’s player, controls, or playback
- Do not add dependencies unless the task requires it
- Leave `dist/` as build output. Do not hand-edit it.