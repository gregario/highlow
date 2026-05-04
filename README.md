<p align="center">
  <a href="https://gregario.github.io/highlow">
    <strong>Play High Low</strong>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/page%20weight-%3C100KB-blue" alt="Under 100KB">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

# High Low

A higher-or-lower card game where every detail is a decision.

Guess whether the next card is higher or lower. Build a streak. Try to beat your best. That's it — the game is intentionally simple so the craft can speak for itself.

## Why this exists

Most card games on the web fall into two categories: tutorial projects with default styling, or casino-themed games with gold trim and slot-machine sounds. Neither demonstrates taste.

High Low is a portfolio piece. The mechanic is a vehicle for showing that every surface was considered — the card rendering, the color palette, the animation timing, the things that are deliberately absent.

## What's notable

- **Zero dependencies.** Vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no node_modules. View source and you'll see clean, hand-written code.
- **CSS-rendered cards.** Every card is HTML and CSS — no image assets. Geometric pips, refined suit colors, a considered card-back pattern. Crisp at any resolution.
- **Physical-feeling interactions.** A 3D card flip with weight. Buttons that compress on press. Feedback that glows, not screams. Every animation has a reason and a duration.
- **Sub-100KB total.** The entire page — HTML, CSS, JS, and web font — loads in under 100KB. No waiting, no spinners.
- **Accessible.** Keyboard-playable. Screen-reader announced. Reduced-motion respected. Color-independent suit identification.
- **Warm palette.** Parchment off-white, terracotta suit-red, warm near-black text. Not a framework default in sight.

## How it works

Standard 52-card deck, shuffled. One card face-up — guess whether the next is higher or lower.

- **Correct:** streak increments, next card becomes current
- **Wrong:** game over, see your final streak
- **Tie:** push — doesn't count, new card dealt
- **Aces low (1), Kings high (13).** Suits displayed but don't affect value.

Your personal best is saved in localStorage. No accounts, no servers, no data collection.

## Running locally

```bash
git clone https://github.com/gregario/highlow.git
cd highlow
open index.html
```

Or just visit [gregario.github.io/highlow](https://gregario.github.io/highlow).

## Development

```bash
npm install          # install dev dependencies (vitest, jsdom)
npm test             # run tests
npm run test:watch   # run tests in watch mode
npm run dev          # serve locally at http://localhost:3000
```

## Deploying to GitHub Pages

GitHub Pages must be enabled for the repo: **Settings > Pages > Source = "Deploy from a branch" > `gh-pages`**. Pushing to the `gh-pages` branch triggers a rebuild automatically. No build step is needed — the static files are served as-is.

## Design details

| Detail | Choice | Why |
|--------|--------|-----|
| Framework | None | Restraint is the point. The absence of a framework is a portfolio signal. |
| Card rendering | CSS only | Crisp at any DPI, zero image payload, demonstrates frontend craft. |
| Palette | Warm neutrals | Signals "considered" before any interaction. Not pure black/white. |
| Typeface | Inter | Swiss-minimalist workhorse. One font, seven sizes, three weights. |
| Animations | CSS transforms | GPU-accelerated, 400ms ease-out flip. Physical, not digital. |
| Persistence | localStorage | One integer (best score). No backend, no cookies, no tracking. |
| Total weight | < 100KB | HTML + CSS + JS + font. Loads instantly on any connection. |

## License

[MIT](LICENSE)
