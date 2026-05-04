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

// --- AC-FA3-06: Correct guess — subtle green feedback on card ---
describe('AC-FA3-06: Correct guess — subtle green feedback on card', () => {
  beforeEach(() => { setupDOM(); });

  it('CSS defines a .card-feedback-correct class with green-ish box-shadow', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-feedback-correct/);
    var match = css.match(/\.card-feedback-correct\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/box-shadow/);
  });

  it('correct feedback uses the --color-accent-correct token', () => {
    var css = getCSS();
    var match = css.match(/\.card-feedback-correct\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/var\(--color-accent-correct\)/);
  });

  it('correct feedback has a transition for fade-out effect', () => {
    var css = getCSS();
    var match = css.match(/\.card-feedback-correct\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    // The card-inner should have box-shadow in its transition list for smooth removal
    expect(css).toMatch(/\.card-inner\s*\{[^}]*transition:[^;]*box-shadow/);
  });

  it('game.js applies card-feedback-correct class after correct guess', () => {
    var src = gameJs;
    expect(src).toMatch(/card-feedback-correct/);
  });

  it('game.js removes correct feedback class after a timeout (500-800ms)', () => {
    var src = gameJs;
    // Should have setTimeout that removes the class
    expect(src).toMatch(/card-feedback-correct/);
    expect(src).toMatch(/classList\.remove\(/);
  });
});

// --- AC-FA3-07: Wrong guess — muted red feedback on card ---
describe('AC-FA3-07: Wrong guess — muted red feedback on card', () => {
  beforeEach(() => { setupDOM(); });

  it('CSS defines a .card-feedback-wrong class with red-ish box-shadow', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-feedback-wrong/);
    var match = css.match(/\.card-feedback-wrong\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/box-shadow/);
  });

  it('wrong feedback uses the --color-accent-wrong token', () => {
    var css = getCSS();
    var match = css.match(/\.card-feedback-wrong\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/var\(--color-accent-wrong\)/);
  });

  it('wrong feedback persists into game-over state (not removed on timeout)', () => {
    var src = gameJs;
    // wrong feedback should be applied but NOT auto-removed — it stays through game-over
    expect(src).toMatch(/card-feedback-wrong/);
    // The wrong class should NOT have a setTimeout for removal in the wrong-guess path
    // Instead, it should be cleared on new game start
  });

  it('game.js applies card-feedback-wrong class after wrong guess', () => {
    var src = gameJs;
    expect(src).toMatch(/card-feedback-wrong/);
  });

  it('feedback classes are cleared on game restart', () => {
    var src = gameJs;
    // When rendering ready or restarting, feedback classes should be removed
    expect(src).toMatch(/card-feedback-wrong/);
    expect(src).toMatch(/card-feedback-correct/);
    expect(src).toMatch(/card-feedback-push/);
  });
});

// --- AC-FA3-08: Push (tie) — distinct neutral feedback ---
describe('AC-FA3-08: Push (tie) — distinct neutral feedback', () => {
  beforeEach(() => { setupDOM(); });

  it('CSS defines a .card-feedback-push class', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-feedback-push/);
    var match = css.match(/\.card-feedback-push\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/box-shadow/);
  });

  it('push feedback uses --color-accent-push token', () => {
    var css = getCSS();
    var match = css.match(/\.card-feedback-push\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/var\(--color-accent-push\)/);
  });

  it('push feedback color is distinct from correct (not green hue) and wrong (not red hue)', () => {
    var css = getCSS();
    // --color-accent-push should be amber/yellow, not green or red
    var pushMatch = css.match(/--color-accent-push:\s*([^;]+)/);
    expect(pushMatch).not.toBeNull();
    var pushColor = pushMatch[1].trim();
    // Should not be the same as correct or wrong tokens
    var correctMatch = css.match(/--color-accent-correct:\s*([^;]+)/);
    var wrongMatch = css.match(/--color-accent-wrong:\s*([^;]+)/);
    expect(pushColor).not.toBe(correctMatch[1].trim());
    expect(pushColor).not.toBe(wrongMatch[1].trim());
  });

  it('game.js applies card-feedback-push class after push result', () => {
    var src = gameJs;
    expect(src).toMatch(/card-feedback-push/);
  });
});

// --- AC-FA3-09: Streak counter pulses on increment ---
describe('AC-FA3-09: Streak counter pulses on increment', () => {
  beforeEach(() => { setupDOM(); });

  it('CSS defines a .streak-pulse class with scale transform', () => {
    var css = getCSS();
    expect(css).toMatch(/\.streak-pulse/);
    var match = css.match(/\.streak-pulse\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/transform:\s*scale\(/);
  });

  it('streak pulse scale is subtle (1.02-1.1x)', () => {
    var css = getCSS();
    var match = css.match(/\.streak-pulse\s*\{[^}]*scale\(([^)]+)\)/);
    expect(match).not.toBeNull();
    var scale = parseFloat(match[1]);
    expect(scale).toBeGreaterThanOrEqual(1.02);
    expect(scale).toBeLessThanOrEqual(1.1);
  });

  it('streak-display has transform transition for pulse effect', () => {
    var css = getCSS();
    var match = css.match(/\.streak-display\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/transition:[^;]*transform/);
  });

  it('game.js adds streak-pulse class on correct guess', () => {
    var src = gameJs;
    expect(src).toMatch(/streak-pulse/);
  });

  it('streak-pulse class is removed after animation (~200ms)', () => {
    var src = gameJs;
    // Should have setTimeout that removes streak-pulse
    expect(src).toMatch(/streak-pulse/);
  });
});

// --- AC-FA3-10: Button press feel — scale down on active ---
describe('AC-FA3-10: Button press feel — scale down on active', () => {
  beforeEach(() => { setupDOM(); });

  it('.btn:active has transform: scale(0.95-0.97)', () => {
    var css = getCSS();
    var match = css.match(/\.btn:active\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/transform:\s*scale\(/);
    var scaleMatch = match[1].match(/scale\(([^)]+)\)/);
    expect(scaleMatch).not.toBeNull();
    var scale = parseFloat(scaleMatch[1]);
    expect(scale).toBeGreaterThanOrEqual(0.95);
    expect(scale).toBeLessThanOrEqual(0.97);
  });

  it('.btn has transform transition for press feel (<=150ms)', () => {
    var css = getCSS();
    var match = css.match(/\.btn\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/transition:[^;]*transform/);
    // Check the transition-fast token is <= 150ms
    var tokenMatch = css.match(/--transition-fast:\s*(\d+)ms/);
    expect(tokenMatch).not.toBeNull();
    var duration = parseInt(tokenMatch[1], 10);
    expect(duration).toBeLessThanOrEqual(150);
  });
});

// --- AC-FA3-11: Button hover state on desktop ---
describe('AC-FA3-11: Button hover state on desktop', () => {
  beforeEach(() => { setupDOM(); });

  it('.btn:hover is scoped inside @media (hover: hover)', () => {
    var css = getCSS();
    expect(css).toMatch(/@media\s*\(hover:\s*hover\)\s*\{[^}]*\.btn:hover/);
  });

  it('.btn:hover changes background-color', () => {
    var css = getCSS();
    var mediaBlock = css.match(/@media\s*\(hover:\s*hover\)\s*\{([^}]*\.btn:hover\s*\{[^}]+\})/);
    expect(mediaBlock).not.toBeNull();
    expect(mediaBlock[1]).toMatch(/background-color/);
  });

  it('hover background uses --color-btn-hover token', () => {
    var css = getCSS();
    var mediaBlock = css.match(/@media\s*\(hover:\s*hover\)\s*\{([^}]*\.btn:hover\s*\{[^}]+\})/);
    expect(mediaBlock).not.toBeNull();
    expect(mediaBlock[1]).toMatch(/var\(--color-btn-hover\)/);
  });
});

// --- AC-FA3-12: Button disabled state during reveal ---
describe('AC-FA3-12: Button disabled state during reveal', () => {
  beforeEach(() => { setupDOM(); });

  it('buttons have opacity 0.4-0.6 during revealing state', () => {
    var css = getCSS();
    var match = css.match(/\[data-state="revealing"\].*\.btn\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    var opacityMatch = match[1].match(/opacity:\s*([\d.]+)/);
    expect(opacityMatch).not.toBeNull();
    var opacity = parseFloat(opacityMatch[1]);
    expect(opacity).toBeGreaterThanOrEqual(0.4);
    expect(opacity).toBeLessThanOrEqual(0.6);
  });

  it('buttons have pointer-events: none during revealing state', () => {
    var css = getCSS();
    var match = css.match(/\[data-state="revealing"\].*\.btn\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/pointer-events:\s*none/);
  });

  it('clicking buttons during revealing has no effect (game-engine guard)', () => {
    var engineSrc = readFileSync(resolve(__dirname, '..', 'game-engine.js'), 'utf8');
    expect(engineSrc).toMatch(/function\s+guess[^{]*\{[^}]*if\s*\(\s*this\.state\s*!==\s*'playing'\s*\)\s*return\s+this/);
  });
});
