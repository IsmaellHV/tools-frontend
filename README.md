# DevTools

> Free, in-browser developer utilities.
> Base64, QR, JSON, AES, JWT and more — everything runs locally in your browser.

🔗 **Live:** [ismaelhv.com/tools](https://ismaelhv.com/tools/)

---

## What it does

A small set of fast, private dev utilities. Each tool runs 100% in the browser
— your data never leaves the page, nothing is uploaded.

- **Base64 — text** — encode / decode UTF-8 text
- **Image ⇄ Base64** — image to data URL and back
- **QR reader** — decode a QR from an uploaded image
- **QR generator** — generate a QR for any text or URL, download as PNG
- **JSON viewer** — validate, format, minify, collapsible tree
- **JSON → Excel** — paste an array of objects, download as `.xlsx` / `.csv`
- **AES encrypt / decrypt** — AES-256 with a passphrase (CryptoJS, OpenSSL-compatible)
- **JWT decoder** — inspect header, payload and expiration (signature is not verified)

---

## Why it feels fast

- The landing and every tool page are **fully server-rendered HTML** at build time.
  The browser receives a finished page and starts painting immediately.
- Each tool is a **small interactive island**, hydrated only when needed.
- Static hashed assets, gzip on the proxy, prefetch on internal nav.

---

## Privacy by default

- **Everything runs in your browser.** Nothing is uploaded. No backend stores
  your input.
- **No cookies are written by the app itself.** Only `localStorage` for theme
  preference (`tools_theme`) and a `sessionStorage` flag for the captcha gate.
- **No tracking pixels, no analytics SDKs, no third-party fonts.**
- **Captcha gate** — Cloudflare Turnstile is solved once per session to keep
  bots / mass scrapers out, then unlocks all tools.

---

## Local development

```bash
cp .env.example .env       # fill in real values
npm install
npm run dev                # http://localhost:4321/tools
```

### Environment

| Variable                    | Notes                                          |
| --------------------------- | ---------------------------------------------- |
| `PUBLIC_SITE_URL`           | Canonical / OG / sitemap base URL              |
| `PUBLIC_BASE_PATH`          | URL prefix when served on a subpath (`/tools`) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key                  |

`PUBLIC_*` values are inlined into the client bundle at **build time**.

### Useful scripts

```bash
npm run dev          # dev server with HMR
npm run build        # type-check + production build
npm run preview      # preview the production build
npm run lint         # eslint
npm run format       # prettier
npm run typecheck    # astro check
```

---

## Production build & deploy

```bash
npm install
npm run build                 # generates dist/ with PUBLIC_* baked in
docker build -t tools .
docker run -p 80:80 tools
```

The image is plain `nginx:alpine` serving the static `dist/` under `/tools/`.
Place it behind your existing reverse proxy.

CI (GitHub Actions, `ci-production.yml`) handles format → lint → typecheck →
build → Docker image push when commits land on the `production` branch.

---

## Tech

- TypeScript end to end (`strict`)
- Server-rendered HTML at build time, with small React islands per tool
- Tailwind CSS for styling, mono-typography branding
- Cloudflare Turnstile for the session-level abuse gate
- Containerized as static `nginx` for portable deployment

---

## License

MIT © [ismaelhv](https://ismaelhv.com)
