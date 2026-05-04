# High Low — Design Document

## The Problem

There is no shortage of higher-or-lower card games on the internet. But nearly all of them fall into two categories: ugly tutorial projects with default browser styling, or over-produced casino-themed games dripping with skeuomorphic felt and gold trim. Neither says anything about the person who made it.

For a developer or designer who wants a small, self-contained project on their GitHub Pages that signals craft and taste, the options are: build something from scratch and make every detail count, or don't bother. The existing landscape of card games is a sea of mediocrity — which is exactly what makes a well-executed version stand out.

The problem isn't "the world needs another card game." The problem is: a portfolio needs an artifact that demonstrates judgment, restraint, and attention to detail in a format anyone can immediately engage with. A card game is the perfect vehicle — universally understood, small enough to be complete, rich enough to reward craft.

## The User

**Portfolio visitors**: developers, recruiters, hiring managers, and design-curious people who land on a GitHub Pages link. They are assessing the maker's craft within seconds.

- **Who they are**: Technical or semi-technical people evaluating someone's work. They've seen hundreds of GitHub projects. They click, scan for 5–10 seconds, and form a judgment.
- **What they care about**: Signals of intentionality. Does this person sweat the details? Do they know when to stop adding features? Can they make something that *feels* good, not just works?
- **When they encounter this**: Browsing a portfolio, clicking through GitHub repos, following a link from a resume or social profile.
- **What they've tried**: They've seen countless portfolio projects — todo apps, weather apps, calculator clones. Most are functionally correct and aesthetically forgettable. The bar for "this is different" is low — but the bar for "this is actually good" is high.

## The Emotional North Star

From "another GitHub project" to "this person has taste" — visitors play for 30 seconds and recognize intentional craft in every detail.

## The 10-Star Experience

**1-star**: A plain HTML page. Text says "Higher or Lower." Two buttons. A number changes. It works.

**3-star**: Basic card visuals (maybe images), the game functions correctly, there's a score counter. Looks like a coding bootcamp project.

**5-star**: Decent card design, smooth-ish transitions, responsive layout. Competent but unremarkable. You'd say "nice project" and move on.

**7-star**: CSS-rendered cards with refined typography and suit colors. Satisfying 3D flip animation. Considered color palette. Physical-feeling button interactions. Streak counter with localStorage best. Every element has breathing room. You'd pause and think "this feels good."

**8-star**: Everything at 7, plus: the first card deal has a moment of ceremony. Correct/wrong feedback is subtle but unmistakable. The game-over transition is seamless — no modal, no jarring state change. The cards-remaining indicator adds quiet tension. A perfect run (all 51) gets a moment of acknowledgment. You'd share the link.

**9-star**: Everything at 8, plus: ambient sound design (subtle card flip sounds, a gentle background tone), haptic feedback on mobile, a dark/light mode toggle that remembers preference, an "about this project" Easter egg.

**10-star**: Everything at 9, plus: generative card art that's unique per session, procedural animation that responds to streak length (the longer your streak, the more fluid the transitions), sharable replay GIFs, accessibility narration that makes the game playable eyes-free.

**Sweet spot: 8 stars.** The 7-star version demonstrates competence; the 8-star version demonstrates *judgment* — knowing which small details (ceremony on first deal, seamless game-over, deck tension) compound into the feeling of a crafted artifact. Stars 9+ add complexity and dependencies (audio, haptics, dark mode) that don't proportionally increase the portfolio signal and risk the "overbuilt" read.

## Feature Areas

### 1. Core Game Loop

**Baseline**: Standard 52-card deck, shuffled. One card face-up, player guesses Higher or Lower for the next card. Correct guess continues the streak; wrong guess ends the game.

**Our version**: Baseline is correct here — the mechanic is solved and universally understood. The only design decision is tie handling: **ties push** (don't count, draw again). This is the fairest rule and avoids the frustrating experience of losing to something that feels like a coin flip. Aces are low (1), Kings are high (13). Suits displayed for visual richness but don't affect gameplay.

**User journey**:
1. A card is face-up, center screen — player assesses the value — *calculating, engaged*
2. Player taps Higher or Lower — *committed, slight tension*
3. Next card flips with a 3D animation (~400ms) — *anticipation peaks during the flip*
4. Result revealed: correct (streak increments, new decision) or wrong (game over) — *satisfaction or "one more try"*
5. On tie: card pushes aside, new card dealt — *brief surprise, then relief (not a loss)*

**Edge cases**:
- **Tie (equal value)**: Push — doesn't count as right or wrong. New card dealt. Subtle visual treatment to distinguish from a correct guess.
- **Deck exhaustion (51 correct)**: Special acknowledgment state. Extremely rare — this is a feat worth celebrating (subtly).
- **Rapid tapping**: Buttons disabled during card flip animation. No double-guess possible.
- **Very first card is a King or Ace**: Game still fair — player has a near-certain first guess. This is a feature, not a bug (easy start builds confidence).

**Competitive difference**: The mechanic itself isn't differentiated — the execution is. Every existing higher-lower game handles the core loop identically. The difference is in how it *feels*, which is handled by the animation and design areas below.

**Scope decision**: Baseline. The mechanic is right at its obvious version.

**Build estimate**: Human team: ~1 day / Rouge: included in single build cycle

---

### 2. Card Design & Rendering

**Baseline**: Card images from a free asset pack, or plain text with a colored border.

**Our version**: Fully CSS-rendered cards — no image assets. Card faces are built from HTML/CSS: large centered value in a quality typeface, geometric suit pips positioned traditionally, refined suit coloring (not pure red/black but a considered warm-red and near-black from the palette). Card backs feature a simple geometric pattern — a repeating motif or subtle texture that signals "this surface was designed too."

**User journey**:
1. Player sees the current card — *immediately reads as "this isn't a template"*
2. Card flips to reveal the next — *the back pattern is visible for ~200ms, just long enough to register as intentional*
3. Card values and suits are instantly legible at any screen size — *no squinting, no ambiguity*

**Edge cases**:
- **Small screens (320px)**: Cards scale proportionally. Value and suit remain legible down to the smallest supported viewport. Pips may simplify (fewer decorative pips, value + suit always visible).
- **High-DPI displays**: CSS rendering means cards are perfectly crisp at any pixel density — no blurry upscaled images.
- **Color vision deficiency**: Suits are distinguished by shape (always), not just color. Red suits use a warm tone distinguishable from the near-black of spades/clubs even in common CVD types.

**Competitive difference**: Nearly every browser card game uses image assets (often low-resolution or inconsistently styled). CSS-rendered cards are crisper, lighter (zero image payload), and demonstrate frontend craft. This is a portfolio-conscious choice — visitors who inspect the source will see there are no image dependencies.

**Scope decision**: Expanded. This is the visual centerpiece. The cards ARE the product.

**Build estimate**: Human team: ~3-4 days / Rouge: included in single build cycle

---

### 3. Score & Streak System

**Baseline**: A current-streak counter displayed during play. Final score shown on game over.

**Our version**: Baseline plus two additions: (1) localStorage personal best, shown after game over as "Best: N" — creates replay motivation without any backend. (2) A subtle cards-remaining indicator — a thin progress element or quiet count showing how many cards are left in the deck. As the deck thins, every correct guess carries more weight. No points, no multipliers, no combos, no leaderboard.

**User journey**:
1. During play, current streak is visible but not dominant — *player is aware of progress without being distracted from the decision*
2. Cards-remaining indicator ticks down — *subtle tension builds in later rounds*
3. On game over, final streak is prominent. If it beats personal best, a quiet "New best" indicator appears — *satisfaction, motivation to retry*
4. On return visit, personal best persists — *recognition, continuity*

**Edge cases**:
- **localStorage unavailable (private browsing)**: Game works identically, just no persistent best score. No error, no notification — graceful absence.
- **First ever game**: "Best: —" or simply not shown until there's a record to display.
- **Player clears browser data**: Best score resets. This is fine — it's a personal best for a casual card game, not a save file.

**Competitive difference**: Most higher-lower games either have no persistence or demand account creation for leaderboards. localStorage hits the sweet spot: just enough memory to create "beat my score" without any friction.

**Scope decision**: Baseline. The streak counter + localStorage best + deck indicator is already the right level. Adding more would undermine the minimalism.

**Build estimate**: Human team: ~0.5 days / Rouge: included in single build cycle

---

### 4. Visual Design Language

**Baseline**: Default browser styling, maybe a centered container with a background color.

**Our version**: A curated, restrained design system. Warm neutrals (not pure black/white — an off-white surface with a slightly warm dark text, or a warm dark background with light cards). One accent color used sparingly for interactive elements and suit reds. A single high-quality sans-serif typeface (loaded via Google Fonts or similar). Generous spacing everywhere — the card breathes, the buttons have room, nothing feels cramped. Mobile-first responsive: naturally portrait-oriented, centers gracefully on desktop with a max-width.

**User journey**:
1. Page loads — *immediately registers as "designed," not "default." The palette and spacing do this before any interaction.*
2. Player's eye goes to the card (largest, most contrasted element) — *visual hierarchy works without labels or instructions*
3. Buttons are obviously interactive but not garish — *understated affordance*
4. On mobile, thumb reaches buttons comfortably, card is large enough to read — *the layout was built for this screen first*

**Edge cases**:
- **Font loading delay (FOIT/FOUT)**: Use `font-display: swap` with a well-chosen system font fallback. The game is playable immediately; the typeface upgrade is seamless.
- **Extremely wide viewports**: Max-width container, centered. The game doesn't stretch to fill a 4K monitor — it holds its proportions like a poster.
- **Forced dark mode / high contrast OS settings**: Respect `prefers-color-scheme` if building both modes, or ensure the chosen palette has sufficient contrast to work under OS-level accessibility overrides.
- **Reduced motion preference**: Respect `prefers-reduced-motion` — disable or simplify animations for users who've requested it.

**Competitive difference**: The visual design is the product's primary competitive advantage. A considered palette with intentional typography immediately separates this from the thousands of card games using Bootstrap defaults or casino clip art.

**Scope decision**: Expanded. This is the taste signal — the palette, type, and spacing are what make visitors think "this person cares."

**Build estimate**: Human team: ~2-3 days / Rouge: included in single build cycle

---

### 5. Animations & Micro-interactions

**Baseline**: Card appears instantly, result shown, next round begins. Functional transitions.

**Our version**: Controlled, physical-feeling animations that make the game feel like a real object, not a web page. Specifically:

- **Card flip**: 3D CSS transform on the Y-axis, ~400ms, ease-out curve. The card back is visible during rotation. Should feel like flipping a physical card — weight and momentum, not a digital slide.
- **Correct guess feedback**: Brief, subtle — a gentle green tint on the card edge or a soft glow, score counter ticks up with a slight scale pulse (1.0 → 1.05 → 1.0 over ~200ms).
- **Wrong guess feedback**: Muted red tint on the card. The card settles. Game-over state fades in — no modal, no popup, the existing UI transforms in place.
- **Button interactions**: Slight scale-down on press (~0.97), quick snap back on release. Hover state on desktop (subtle background shift). Disabled state during card animation (reduced opacity, no pointer events).
- **Round transition**: The revealed card slides or cross-fades to become the new "current" card. The flow feels continuous — one long game, not a series of isolated rounds.
- **First deal ceremony**: On game start, a brief pause (~300ms), then the first card flips from its back. Sets the tone — "this experience was considered from the first moment."
- **Deck-complete celebration**: If all 51 guesses are correct, a restrained moment of acknowledgment — perhaps the card glows, the streak counter does something special. Subtle, not fireworks.

**User journey**:
1. Player taps "Deal" or the card to start — *brief pause, then the first flip. "Oh, this has weight."*
2. Player taps Higher — *button compresses on press, card begins to flip* — *anticipation*
3. Card lands face-up, correct — *green tint flashes, score ticks* — *satisfaction without interruption*
4. Flow continues seamlessly — *the game is a rhythm, not a sequence of clicks*
5. Wrong guess — *red tint, card settles, game over fades in without breaking the composition* — *"that was clean"*

**Edge cases**:
- **prefers-reduced-motion**: All animations either disabled or replaced with simple opacity fades. The game remains fully playable and still looks composed — reduced motion is a design constraint, not a degradation.
- **Low-end devices**: CSS transforms are GPU-accelerated. No JavaScript animation libraries — pure CSS transitions and keyframes for performance.
- **Rapid interaction**: Animation queue doesn't stack. Each action cancels/completes the prior animation cleanly.

**Competitive difference**: This is where "has taste" is won or lost. Most card games either have no animation (feels dead) or over-animate (particles, screen shake, sound effects on every action). The controlled, physical-feeling middle ground — where every animation has a reason and a restrained duration — is rare and immediately noticeable.

**Scope decision**: Expanded. The animations are the craft. This is where a 5-star project becomes an 8-star project.

**Build estimate**: Human team: ~3-4 days (mostly tuning timing curves) / Rouge: included in single build cycle

---

### 6. Game States & Flow

**Baseline**: Game starts immediately, game over shows score, refresh to restart.

**Our version**: Four clean states with seamless transitions between them:

- **Ready**: First visit or after a completed game when player hasn't started a new one. Single card face-down, centered. Game title in quiet type. Higher/Lower buttons present (or a "Deal" affordance). Minimal — the player understands what to do without instruction.
- **Playing**: Active game. Current card face-up, buttons active, streak visible, cards-remaining visible. This is where 95% of time is spent.
- **Revealing**: Card mid-flip (~400ms). Buttons disabled. A transient state the player feels but doesn't consciously identify.
- **Game Over**: Streak shown prominently. "Best: N" shown (updated if beaten, with "New best!" indicator). "Play again" appears where the buttons were — no modal, no overlay, the layout transforms in place. Tapping "Play again" shuffles a fresh deck and transitions back to the first-card ceremony.
- **Deck Complete**: The rare perfect run. A special moment — distinct from regular game over, but still restrained. The streak (51) is shown, the accomplishment is acknowledged.

No tutorial screen, no settings page, no about page, no navigation. The game IS the page. This restraint is a taste decision — a game this simple needs zero onboarding, and every additional screen dilutes the "single artifact" quality.

**User journey**:
1. Page loads → Ready state — *"I get it, let's go"*
2. Player starts → Playing state — *focused, deciding*
3. Player guesses → Revealing state → back to Playing (or Game Over) — *seamless rhythm*
4. Game ends → Game Over state — *no interruption, just a shift. Score is clear, retry is obvious*
5. Player retries → Ready → Playing — *fresh start, same ceremony, new deck*

**Edge cases**:
- **Page refresh during game**: Game resets. No state persistence mid-game — this is a casual card game, not a save-state RPG. Clean reset is the right behavior.
- **Browser back button**: Nothing to go back to — single page, single state. No history manipulation needed.
- **Idle / tab backgrounded**: No timer, no penalty. The card waits patiently. When the player returns, the state is exactly as they left it.

**Competitive difference**: Most card games use modals for game over and popups for scores. The in-place state transformation — where the layout itself shifts without overlays — is cleaner, faster, and signals that the developer thought about the experience as a continuous flow rather than a series of interrupts.

**Scope decision**: Baseline. The four states are already the right set. Adding more (settings, about, help) would dilute the simplicity.

**Build estimate**: Human team: ~1 day / Rouge: included in single build cycle

## What Makes This Different

This isn't a game that happens to be on a portfolio. It's a portfolio piece that happens to be a game.

Every higher-or-lower card game on the internet treats the mechanic as the product. They compete on features: more card types, multiplayer, leaderboards, achievements. They ask "what can we add?" The answer to that question is always "more stuff," and the result is always mediocre.

High Low asks a different question: "what does it feel like to use this?" The mechanic is table stakes — everyone knows higher or lower. The product is the *feeling* of playing: the weight of the card flip, the rhythm of the guessing loop, the quiet tension of a thinning deck, the clean shift from playing to game-over without a jarring modal. These are details that most developers skip because they don't appear on a feature list. But they're exactly the details that make a visitor pause and think "this person cares about craft."

The insight competitors miss isn't a feature — it's restraint. A single typeface instead of three. A muted palette instead of casino gold. localStorage instead of a leaderboard backend. No tutorial for a game that needs no tutorial. Every absence is a decision, and a visitor with taste will read those decisions correctly.

## Temporal Arc

**Day 1**: Visitor lands on the page. Within 3 seconds, the visual design registers as "intentional." Within 10 seconds, they've started playing. The first card flip feels good. They play 3-5 rounds. They think "this is nice" and either bookmark it, share it, or — if they're a recruiter — note that this person sweats the details.

**Week 1**: If the visitor returns (bookmarked it, sent themselves the link), their personal best is still there. They try to beat it. The cards-remaining indicator creates tension they didn't notice the first time. The game has a thin but real retention loop.

**Month 1**: The game lives on as a portfolio artifact. It's a link in a resume, a pinned repo, a "check this out" in a DM. Each new visitor gets the same 30-second impression. The game doesn't need to deepen because its job is to impress on first contact, and it does that every time.

**Year 1**: Still works. No backend to expire, no API keys to rotate, no dependencies to break. Static HTML/CSS/JS on GitHub Pages is as close to permanent as the web gets. The code is a time capsule of craft at the moment it was built.

## Open Questions

- **Typeface selection**: Specific font choice deferred to DESIGN discipline. Brainstorming establishes "single high-quality sans-serif" — DESIGN picks the exact one.
- **Color palette specifics**: Warm neutrals + one accent is the direction. DESIGN determines exact hex values and ensures WCAG AA contrast ratios.
- **Card back pattern**: Geometric/minimal is the direction. DESIGN determines the specific pattern.
- **Technology choice**: "Static SPA on GitHub Pages" is the constraint. INFRASTRUCTURE decides vanilla JS vs. a minimal framework, build tooling (if any), and deployment specifics.
- **Competitive landscape**: Are there any well-executed minimal card games that would change our differentiation story? COMPETITION to investigate.
- **Legal considerations**: Card games have no licensing issues (standard deck is public domain). Any open-source font or asset licensing to verify. LEGAL-PRIVACY to confirm.

## Scope Summary

| Area | Scope | Human Estimate | Rouge Estimate |
|------|-------|---------------|----------------|
| Core Game Loop | Baseline | ~1 day | ~1 cycle |
| Card Design & Rendering | Expanded | ~3-4 days | ~1 cycle |
| Score & Streak | Baseline | ~0.5 days | ~1 cycle |
| Visual Design Language | Expanded | ~2-3 days | ~1 cycle |
| Animations & Micro-interactions | Expanded | ~3-4 days | ~1 cycle |
| Game States & Flow | Baseline | ~1 day | ~1 cycle |
| **Total** | | **~1.5-2 weeks** | **~1 build cycle** |

## Classifier Signals

- entity_count: 2 (Card, Deck)
- integration_count: 0 (no external services)
- role_count: 1 (player)
- journey_count: 2 (play game, beat personal best)
- screen_count: 1 (single page with in-place state transitions)
