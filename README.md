# mohammadzayed.com

Source for my portfolio, live at [mohammadzayed.com](https://mohammadzayed.com).

The home page is a chat: you ask an AI version of me about my work, under a
portrait of me that is redrawn live in text characters. Projects, About and a
page per project sit behind it.

## How it works

- **Pages**: static HTML on Netlify. The home page is React 18 loaded from a
  CDN, with each `.jsx` file compiled by esbuild. Projects, About and the
  project pages are generated at build time from `data.jsx`.
- **Chat**: a Netlify Function at `/api/ask` streams answers from a language
  model. It has per-visitor and site-wide daily limits, and written fallback
  answers for the suggested questions if the model is unavailable.
- **Portrait**: two short muted video loops (idle and talking) sampled into a
  grid of characters on a canvas. Visitors who prefer reduced motion get a
  still frame.
- **Visit tracking**: first-party, no cookies.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:8000, chat uses canned replies without an API key
npm run build    # compiles the JSX and generates the pages and sitemap
```

## Layout

```
index.html, ask.jsx, app.jsx   home page and chat
data.jsx                       project data
generate-pages.mjs             builds Projects, About and project pages
netlify/functions/ask/         the chat function and database schema
styles.css, pages.css          styles
assets/, images/               media
```
