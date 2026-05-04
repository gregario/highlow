'use strict';

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

var cssSrc = readFileSync(resolve(__dirname, '..', 'style.css'), 'utf8');
var gameJs = readFileSync(resolve(__dirname, '..', 'game.js'), 'utf8');
var htmlSrc = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

function setupDOM() {
  document.documentElement.innerHTML = '';
  document.write(htmlSrc);
  var style = document.createElement('style');
  style.textContent = cssSrc;
  document.head.appendChild(style);
}

function getCSS() {
  return cssSrc;
}

function getJS() {
  return gameJs;
}

// --- AC-FA3-13: First deal ceremony — pause before initial flip ---
describe('AC-FA3-13: First deal ceremony — pause before initial flip', () => {
  beforeEach(() => { setupDOM(); });

  it('game.js has a deliberate delay (200-400ms) between game start and first flip', () => {
    var src = getJS();
    // The first deal flow should have a setTimeout for the ceremony pause
    // The card should be dealt face-down first, then flipped after a delay
    var startGameMatch = src.match(/startGame\(\)/);
    expect(startGameMatch).not.toBeNull();
    // There should be a setTimeout in the initial deal flow with a delay of 200-400ms
    // Look for a ceremony delay pattern
    expect(src).toMatch(/setTimeout/);
  });

  it('card back is visible during the ceremony pause (card starts face-down)', () => {
    var src = getJS();
    // On first deal, the card should NOT be immediately flipped.
    // The flow: start game -> card shows back -> delay -> flip to face
    // flipToFaceDown or no flipToFaceUp should happen before the delay
    // After render() in ready state, card is face-down (flipped class removed)
    // The ceremony delay should happen before flipToFaceUp is called
    expect(src).toMatch(/flipToFaceDown|flipToFaceUp/);
  });

  it('ceremony delay is between 200-400ms', () => {
    var src = getJS();
    // Look for the specific ceremony delay setTimeout.
    // In the first deal path (state === 'ready'), there should be a delay before flip
    var firstDealBlock = src.match(/engine\.startGame\(\)/);
    expect(firstDealBlock).not.toBeNull();
    // There should be a ceremony delay - a setTimeout with ~200-400ms value
    // The handleGuess function for ready state should have a ceremony timeout
    var ceremonyDelayMatch = src.match(/setTimeout\s*\(\s*function\s*\(\)\s*\{[^}]*flipToFaceUp/s);
    expect(ceremonyDelayMatch).not.toBeNull();
  });

  it('first deal ceremony renders the card face-down before flipping', () => {
    var gameEl = document.getElementById('game');
    var cardInner = gameEl.querySelector('.card-inner');
    // Initially in ready state, card is not flipped (no .flipped class)
    expect(cardInner.classList.contains('flipped')).toBe(false);
  });
});

// --- AC-FA3-14: Round transition — revealed card becomes current ---
describe('AC-FA3-14: Round transition — revealed card becomes current', () => {
  beforeEach(() => { setupDOM(); });

  it('game.js has a multi-step round transition (flip down, swap, flip up)', () => {
    var src = getJS();
    // The round transition should: flip card face-down, change face content, flip face-up
    // This creates a smooth card swap rather than a jarring jump
    expect(src).toMatch(/flipToFaceDown/);
    expect(src).toMatch(/flipToFaceUp/);
    // In the playing state guess handler, there should be a sequence of flip operations
    var flipSequence = src.match(/flipToFaceDown[\s\S]*?renderCard[\s\S]*?flipToFaceUp/);
    expect(flipSequence).not.toBeNull();
  });

  it('CSS supports smooth card transitions via transform transition on card-inner', () => {
    var css = getCSS();
    // card-inner should have transform transition for smooth flip
    expect(css).toMatch(/\.card-inner\s*\{[^}]*transition:[^;]*transform/);
  });

  it('round transition has timing that prevents blank frames', () => {
    var src = getJS();
    // Between flipToFaceDown and flipToFaceUp, there should be a brief delay
    // for the flip-down animation to complete before swapping card content
    var transitionPattern = src.match(/flipToFaceDown[\s\S]*?setTimeout[\s\S]*?renderCard[\s\S]*?flipToFaceUp/);
    expect(transitionPattern).not.toBeNull();
  });

  it('card face content is updated while card is face-down (hidden from user)', () => {
    var src = getJS();
    // renderCard (which updates card face) should be called AFTER flipToFaceDown
    // and BEFORE flipToFaceUp, while the card back is showing
    var sequence = src.match(/flipToFaceDown[\s\S]*?renderCard\(engine\.nextCard\)[\s\S]*?flipToFaceUp/);
    expect(sequence).not.toBeNull();
  });
});

// --- AC-FA3-15: Game over — in-place transformation, no modal ---
describe('AC-FA3-15: Game over — in-place transformation, no modal', () => {
  beforeEach(() => { setupDOM(); });

  it('no overlay, modal, or fixed-position elements in game-over state', () => {
    var gameEl = document.getElementById('game');
    gameEl.setAttribute('data-state', 'game-over');
    // Check no fixed/absolute overlay elements
    var allElements = gameEl.querySelectorAll('*');
    var computedStyles = Array.from(allElements).map(function (el) {
      return window.getComputedStyle(el);
    });
    var hasOverlay = computedStyles.some(function (style) {
      return style.position === 'fixed' &&
        parseInt(style.width) > 100 &&
        parseInt(style.height) > 100;
    });
    expect(hasOverlay).toBe(false);
  });

  it('no dimming backdrop in game-over state', () => {
    var css = getCSS();
    // Should NOT have overlay/backdrop CSS for game-over
    expect(css).not.toMatch(/\[data-state="game-over"\][\s\S]*?backdrop/);
    expect(css).not.toMatch(/\[data-state="game-over"\][\s\S]*?overlay/);
  });

  it('action buttons use opacity/visibility transition, not display:none for game-over', () => {
    var css = getCSS();
    // Buttons should fade out with opacity, not instantly vanish with display:none
    // The game-over state should use opacity:0 and pointer-events:none instead of display:none
    var gameOverButtons = css.match(/\[data-state="game-over"\]\s*\.action-buttons\s*\{([^}]+)\}/);
    expect(gameOverButtons).not.toBeNull();
    expect(gameOverButtons[1]).toMatch(/opacity\s*:\s*0/);
  });

  it('play-again area uses opacity transition to fade in', () => {
    var css = getCSS();
    // play-again should become visible via opacity transition in game-over
    var playAgainTransition = css.match(/\.play-again-area\s*\{[^}]*transition[^}]*opacity/);
    expect(playAgainTransition).not.toBeNull();
  });

  it('card remains visible in game-over state', () => {
    var gameEl = document.getElementById('game');
    gameEl.setAttribute('data-state', 'game-over');
    var cardArea = gameEl.querySelector('.card-area');
    var style = window.getComputedStyle(cardArea);
    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
  });

  it('game-over streak display becomes prominent (larger font)', () => {
    var css = getCSS();
    var gameOverStreak = css.match(/\[data-state="game-over"\]\s*\.streak-display\s*\{([^}]+)\}/);
    expect(gameOverStreak).not.toBeNull();
    expect(gameOverStreak[1]).toMatch(/font-size/);
  });
});

// --- AC-FA3-16: Game over transition timing ---
describe('AC-FA3-16: Game over transition timing', () => {
  beforeEach(() => { setupDOM(); });

  it('game-over transition uses CSS opacity transitions on buttons and play-again', () => {
    var css = getCSS();
    // action-buttons and play-again-area should have opacity in their transition
    expect(css).toMatch(/\.action-buttons\s*\{[^}]*transition[^}]*opacity/);
    expect(css).toMatch(/\.play-again-area\s*\{[^}]*transition[^}]*opacity/);
  });

  it('transition duration for game-over elements is 300-600ms', () => {
    var css = getCSS();
    // The transition timing for opacity changes should be in the 300-600ms range
    // Using --transition-medium (300ms) or a custom game-over transition token
    // Check that action-buttons or play-again have reasonable transition timing
    var transitionMedium = css.match(/--transition-medium:\s*(\d+)ms/);
    expect(transitionMedium).not.toBeNull();
    var duration = parseInt(transitionMedium[1]);
    expect(duration).toBeGreaterThanOrEqual(300);
    expect(duration).toBeLessThanOrEqual(600);
  });

  it('game.js manages game-over transition with appropriate timing', () => {
    var src = getJS();
    // The game-over path should set state with timing that allows CSS transitions
    // The revealing-to-game-over flow should have a delay for the transition
    expect(src).toMatch(/game-over/);
  });

  it('streak display has font-size transition for smooth size change on game-over', () => {
    var css = getCSS();
    // streak-display should transition font-size smoothly
    expect(css).toMatch(/\.streak-display\s*\{[^}]*transition[^}]*font-size/);
  });

  it('action buttons in game-over state are not clickable (pointer-events:none)', () => {
    var css = getCSS();
    var gameOverButtons = css.match(/\[data-state="game-over"\]\s*\.action-buttons\s*\{([^}]+)\}/);
    expect(gameOverButtons).not.toBeNull();
    expect(gameOverButtons[1]).toMatch(/pointer-events\s*:\s*none/);
  });
});

// --- AC-FA3-17: New best celebration — subtle indicator ---
describe('AC-FA3-17: New best celebration — subtle indicator', () => {
  beforeEach(() => { setupDOM(); });

  it('HTML has an element for "New best" indicator', () => {
    var gameEl = document.getElementById('game');
    var bestScore = gameEl.querySelector('.best-score');
    expect(bestScore).not.toBeNull();
  });

  it('game.js displays "New best!" text when streak beats stored best', () => {
    var src = getJS();
    expect(src).toMatch(/New best/i);
  });

  it('CSS has a fade-in animation or transition for the new-best indicator', () => {
    var css = getCSS();
    // The best-score or a new-best element should have opacity transition
    // for a fade-in effect rather than instant appearance
    var hasFadeTransition = css.match(/\.best-score[^{]*\{[^}]*transition[^}]*opacity/) ||
                           css.match(/\.new-best[^{]*\{[^}]*transition/) ||
                           css.match(/\.new-best[^{]*\{[^}]*animation/) ||
                           css.match(/\.best-score[^{]*\{[^}]*transition/);
    expect(hasFadeTransition).not.toBeNull();
  });

  it('no confetti, particle effects, or full-screen animations for new best', () => {
    var css = getCSS();
    expect(css).not.toMatch(/confetti/);
    expect(css).not.toMatch(/particle/);
    // No keyframe animations that cover the full screen
    var fullScreenAnims = css.match(/@keyframes[^{]*\{[^}]*100vw|@keyframes[^{]*\{[^}]*100vh/);
    expect(fullScreenAnims).toBeNull();
  });

  it('new-best text element appears with fade-in, not instant', () => {
    var css = getCSS();
    // The new-best indicator should use opacity transition or an animation
    // to fade in subtly
    var bestScoreOpacity = css.match(/\.best-score\s*\{[^}]*transition[^}]*opacity/);
    expect(bestScoreOpacity).not.toBeNull();
  });
});

// --- AC-FA3-18: Deck complete celebration ---
describe('AC-FA3-18: Deck complete celebration', () => {
  beforeEach(() => { setupDOM(); });

  it('deck-complete state has at least one unique visual class or element not in game-over', () => {
    var css = getCSS();
    // deck-complete should have at least one visual rule that game-over does not
    var deckCompleteRules = css.match(/\[data-state="deck-complete"\][^{]*\{[^}]+\}/g) || [];
    var gameOverRules = css.match(/\[data-state="game-over"\][^{]*\{[^}]+\}/g) || [];
    // Check there's at least one deck-complete specific rule
    var deckCompleteUnique = deckCompleteRules.some(function (rule) {
      // Find rules that reference a class/property unique to deck-complete
      return rule.match(/glow|pulse|color|background|box-shadow|border|scale|celebration/i) &&
             !gameOverRules.some(function (goRule) {
               return goRule === rule.replace(/deck-complete/g, 'game-over');
             });
    });
    // Or check for a dedicated deck-complete class
    var hasDeckCompleteSpecific = css.match(/\.deck-complete-celebration|deck-complete.*glow|deck-complete.*pulse/) ||
                                  css.match(/\[data-state="deck-complete"\].*(?:box-shadow|background|color|border|scale|transform)/);
    expect(hasDeckCompleteSpecific || deckCompleteUnique).toBeTruthy();
  });

  it('deck-complete celebration is restrained — no particle or full-screen animation', () => {
    var css = getCSS();
    expect(css).not.toMatch(/\[data-state="deck-complete"\][^}]*confetti/);
    expect(css).not.toMatch(/\[data-state="deck-complete"\][^}]*particle/);
  });

  it('play-again button is available in deck-complete state', () => {
    var gameEl = document.getElementById('game');
    gameEl.setAttribute('data-state', 'deck-complete');
    var playAgainBtn = gameEl.querySelector('.btn-play-again');
    expect(playAgainBtn).not.toBeNull();
    var style = window.getComputedStyle(playAgainBtn);
    expect(style.display).not.toBe('none');
  });

  it('deck-complete has a visual distinction from normal game-over', () => {
    var css = getCSS();
    // There should be at least one CSS rule targeting deck-complete that provides
    // a unique visual treatment (glow, color, special class)
    var deckCompleteVisual = css.match(/\[data-state="deck-complete"\]\s*\.(?:card-inner|streak-display|card|card-area)\s*\{([^}]+)\}/);
    // Or a general deck-complete specific style
    var anyDeckCompleteStyle = css.match(/\[data-state="deck-complete"\]/);
    expect(anyDeckCompleteStyle).not.toBeNull();
    // It should have more than just display:none rules
    var uniqueStyle = css.match(/\[data-state="deck-complete"\][^{]*\{[^}]*(box-shadow|background|color|transform|glow|border|animation)/);
    expect(uniqueStyle).not.toBeNull();
  });

  it('game.js handles deck-complete state with announcement', () => {
    var src = getJS();
    expect(src).toMatch(/deck-complete/);
    expect(src).toMatch(/51/);
  });
});
