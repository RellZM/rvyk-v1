# RVYK

Personal portfolio of Afrel Zharif Muflih (RVYK), web developer and cybersecurity enthusiast.

Live: [rvyk.dev](https://rvyk.dev)

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- WebGL: [ogl](https://github.com/oframe/ogl) for the work carousel, [three.js](https://threejs.org) for the about-page lanyard (from [React Bits](https://reactbits.dev))

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

- `app/` – pages (`/`, `/work`, `/now`, `/about`, `/writing`), metadata, sitemap, robots, OG image
- `app/work/page.tsx` – project list shown in the carousel
- `app/now/page.tsx` – "now" log entries, newest first
- `components/` – navbar, footer, mascot, loading intro, carousel, lanyard
- `public/` – images and mascot assets
