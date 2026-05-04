'use strict';

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sampleCards, makeCard } from './fixtures.js';

var cssSrc = readFileSync(resolve(__dirname, '..', 'style.css'), 'utf8');
var htmlSrc = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
var gameJs = readFileSync(resolve(__dirname, '..', 'game.js'), 'utf8');
var indexHtml = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

function setupDOM() {
  document.documentElement.innerHTML = '';
  document.write(htmlSrc);
  var style = document.createElement('style');
  style.textContent = cssSrc;
  document.head.appendChild(style);
}

// --- AC-FA3-19: prefers-reduced-motion disables animations ---
describe('AC-FA3-19: prefers-reduced-motion disables animations', () => {
  it('CSS contains @media (prefers-reduced-motion: reduce) rule', () => {
    expect(cssSrc).toMatch(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/);
  });

  it('reduced-motion rule disables all animation-duration', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    expect(reducedBlock).not.toBeNull();
    var content = reducedBlock[1];
    expect(content).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
  });

  it('reduced-motion rule sets animation-iteration-count to 1', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    var content = reducedBlock[1];
    expect(content).toMatch(/animation-iteration-count:\s*1\s*!important/);
  });

  it('reduced-motion rule disables all transition-duration', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    var content = reducedBlock[1];
    expect(content).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });

  it('reduced-motion rule applies to all elements via wildcard selector', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    var content = reducedBlock[1];
    expect(content).toMatch(/\*[\s,]/);
  });

  it('card-inner transition is explicitly disabled under reduced-motion', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    var content = reducedBlock[1];
    expect(content).toMatch(/\.card-inner\s*\{[^}]*transition:\s*none/);
  });

  it('scroll-behavior is set to auto under reduced-motion', () => {
    var reducedBlock = cssSrc.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/);
    var content = reducedBlock[1];
    expect(content).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });
});

// --- AC-FA3-20: Keyboard-only gameplay ---
describe('AC-FA3-20: Keyboard-only gameplay', () => {
  beforeEach(() => { setupDOM(); });

  it('Higher button is a native <button> element (keyboard-activatable)', () => {
    var btn = document.querySelector('.btn-higher');
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('Lower button is a native <button> element', () => {
    var btn = document.querySelector('.btn-lower');
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('Play Again button is a native <button> element', () => {
    var btn = document.querySelector('.btn-play-again');
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('buttons have type="button" (prevents form submission)', () => {
    var buttons = document.querySelectorAll('.btn');
    buttons.forEach(function (btn) {
      expect(btn.getAttribute('type')).toBe('button');
    });
  });

  it('CSS defines :focus-visible styling for buttons', () => {
    expect(cssSrc).toMatch(/\.btn:focus-visible\s*\{/);
  });

  it('focus-visible uses outline (not just color change)', () => {
    var focusBlock = cssSrc.match(/\.btn:focus-visible\s*\{([^}]+)\}/);
    expect(focusBlock).not.toBeNull();
    expect(focusBlock[1]).toMatch(/outline:/);
  });

  it('focus-visible has outline-offset for visibility', () => {
    var focusBlock = cssSrc.match(/\.btn:focus-visible\s*\{([^}]+)\}/);
    expect(focusBlock[1]).toMatch(/outline-offset:/);
  });

  it('no outline:none or outline:0 on buttons (focus is preserved)', () => {
    var outlineRemoval = cssSrc.match(/\.btn[^{]*\{[^}]*outline:\s*(none|0)[^}]*\}/);
    if (outlineRemoval) {
      expect(outlineRemoval[0]).toMatch(/focus-visible/);
    }
  });

  it('buttons are Tab-reachable (no negative tabindex)', () => {
    var buttons = document.querySelectorAll('.btn');
    buttons.forEach(function (btn) {
      var tabindex = btn.getAttribute('tabindex');
      if (tabindex !== null) {
        expect(parseInt(tabindex, 10)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

// --- AC-FA3-21: Screen reader announces game state changes ---
describe('AC-FA3-21: Screen reader announces game state changes', () => {
  beforeEach(() => { setupDOM(); });

  it('aria-live region exists in the DOM', () => {
    var liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).not.toBeNull();
  });

  it('aria-live region has role="status"', () => {
    var liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion.getAttribute('role')).toBe('status');
  });

  it('aria-live is set to polite', () => {
    var liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('aria-atomic is true for complete announcements', () => {
    var liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
  });

  it('live region is visually hidden but screen-reader accessible', () => {
    expect(cssSrc).toMatch(/\.sr-announcer\s*\{[^}]*position:\s*absolute/);
    expect(cssSrc).toMatch(/\.sr-announcer\s*\{[^}]*clip:\s*rect\(0/);
  });

  it('game.js contains an announce function that updates the live region', () => {
    expect(gameJs).toMatch(/function\s+announce\s*\(/);
    expect(gameJs).toMatch(/announcer/);
  });

  it('announce is called with card displayName on card reveal', () => {
    expect(gameJs).toMatch(/announce\([^)]*displayName/);
  });

  it('announce is called with result (correct/wrong/push)', () => {
    expect(gameJs).toMatch(/announce\([^)]*[Cc]orrect/);
    expect(gameJs).toMatch(/announce\([^)]*[Ww]rong/);
    expect(gameJs).toMatch(/announce\([^)]*[Pp]ush/);
  });

  it('announce is called with streak on game over', () => {
    expect(gameJs).toMatch(/announce\([^)]*[Gg]ame over[^)]*streak/i);
  });

  it('announce is called on game start', () => {
    expect(gameJs).toMatch(/announce\([^)]*[Hh]igh\s*[Ll]ow/);
  });

  it('card display names use full names (Ace of Spades, not A♠)', () => {
    var { makeCard: mkCard } = require('./fixtures.js');
    var card = mkCard(1, 0);
    expect(card.displayName).toMatch(/Ace of/);
    var jack = mkCard(11, 2);
    expect(jack.displayName).toMatch(/Jack of/);
  });

  it('card-area has aria-label', () => {
    var card = document.querySelector('.card');
    expect(card.getAttribute('aria-label')).toBeTruthy();
  });

  it('streak display has aria-label', () => {
    var streak = document.querySelector('.streak-display');
    expect(streak.getAttribute('aria-label')).toBeTruthy();
  });
});

// --- AC-FA3-22: Color is not the only differentiator for suits ---
describe('AC-FA3-22: Color is not the only differentiator for suits', () => {
  var renderCardFace;

  beforeEach(async () => {
    setupDOM();
    var mod = await import('../card-renderer.js');
    renderCardFace = mod.renderCardFace;
  });

  it('heart card renders ♥ symbol as text', () => {
    var card = makeCard(7, 0);
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.textContent).toContain('♥');
  });

  it('diamond card renders ♦ symbol as text', () => {
    var card = makeCard(7, 1);
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.textContent).toContain('♦');
  });

  it('club card renders ♣ symbol as text', () => {
    var card = makeCard(7, 2);
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.textContent).toContain('♣');
  });

  it('spade card renders ♠ symbol as text', () => {
    var card = makeCard(7, 3);
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.textContent).toContain('♠');
  });

  it('corner labels include suit symbol for all four suits', () => {
    var suits = ['♥', '♦', '♣', '♠'];
    for (var i = 0; i < suits.length; i++) {
      var card = makeCard(5, i);
      var el = document.querySelector('.card-front');
      renderCardFace(el, card);
      var corners = el.querySelectorAll('.card-corner-suit');
      expect(corners.length).toBe(2);
      corners.forEach(function (corner) {
        expect(corner.textContent).toBe(suits[i]);
      });
    }
  });

  it('face cards (J, Q, K) also show suit symbols', () => {
    var faceValues = [11, 12, 13];
    faceValues.forEach(function (val) {
      var card = makeCard(val, 0);
      var el = document.querySelector('.card-front');
      renderCardFace(el, card);
      expect(el.textContent).toContain('♥');
    });
  });

  it('Ace shows suit symbol', () => {
    var card = makeCard(1, 3);
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.textContent).toContain('♠');
  });
});

// --- AC-FA3-23: No horizontal scroll on any supported viewport ---
describe('AC-FA3-23: No horizontal scroll on any supported viewport', () => {
  it('game container uses max-width constraint', () => {
    expect(cssSrc).toMatch(/\.game\s*\{[^}]*max-width:\s*480px/);
  });

  it('game container is centered with margin auto', () => {
    expect(cssSrc).toMatch(/\.game\s*\{[^}]*margin:\s*0\s+auto/);
  });

  it('card uses min() for responsive width', () => {
    expect(cssSrc).toMatch(/--card-max-w:\s*200px/);
    expect(cssSrc).toMatch(/min\(\s*var\(--card-max-w\)/);
  });

  it('no fixed widths larger than 320px on any element (max-width excluded)', () => {
    var lines = cssSrc.split('\n');
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (trimmed.match(/^width:\s*(\d+)px/) && !trimmed.match(/max-width/)) {
        var px = parseInt(trimmed.match(/(\d+)px/)[1], 10);
        expect(px).toBeLessThanOrEqual(320);
      }
    });
  });

  it('box-sizing border-box is applied globally', () => {
    expect(cssSrc).toMatch(/\*[\s,][^{]*\{[^}]*box-sizing:\s*border-box/s);
  });

  it('button container uses max-width 320px', () => {
    expect(cssSrc).toMatch(/\.button-stage\s*\{[^}]*max-width:\s*320px/);
  });

  it('no element uses overflow-x: visible with a width > viewport', () => {
    expect(cssSrc).not.toMatch(/overflow-x:\s*visible/);
  });
});

// --- AC-FA3-24: Page loads under 2 seconds on 3G ---
describe('AC-FA3-24: Page loads and becomes interactive under 2 seconds on 3G', () => {
  it('total HTML file size is under 5KB', () => {
    var htmlSize = Buffer.byteLength(indexHtml, 'utf8');
    expect(htmlSize).toBeLessThan(5 * 1024);
  });

  it('total CSS file size is under 15KB', () => {
    var cssSize = Buffer.byteLength(cssSrc, 'utf8');
    expect(cssSize).toBeLessThan(15 * 1024);
  });

  it('total JS file size is under 30KB (all JS modules combined)', () => {
    var gameJsSize = Buffer.byteLength(gameJs, 'utf8');
    var deckJs = readFileSync(resolve(__dirname, '..', 'deck.js'), 'utf8');
    var engineJs = readFileSync(resolve(__dirname, '..', 'game-engine.js'), 'utf8');
    var rendererJs = readFileSync(resolve(__dirname, '..', 'card-renderer.js'), 'utf8');
    var totalJs = gameJsSize + Buffer.byteLength(deckJs, 'utf8') +
      Buffer.byteLength(engineJs, 'utf8') + Buffer.byteLength(rendererJs, 'utf8');
    expect(totalJs).toBeLessThan(30 * 1024);
  });

  it('total page weight (HTML + CSS + JS) is under 100KB excluding font', () => {
    var deckJs = readFileSync(resolve(__dirname, '..', 'deck.js'), 'utf8');
    var engineJs = readFileSync(resolve(__dirname, '..', 'game-engine.js'), 'utf8');
    var rendererJs = readFileSync(resolve(__dirname, '..', 'card-renderer.js'), 'utf8');
    var total = Buffer.byteLength(indexHtml, 'utf8') +
      Buffer.byteLength(cssSrc, 'utf8') +
      Buffer.byteLength(gameJs, 'utf8') +
      Buffer.byteLength(deckJs, 'utf8') +
      Buffer.byteLength(engineJs, 'utf8') +
      Buffer.byteLength(rendererJs, 'utf8');
    expect(total).toBeLessThan(100 * 1024);
  });

  it('script tag uses type="module" (deferred by default, non-blocking)', () => {
    expect(indexHtml).toMatch(/<script\s+type="module"/);
  });

  it('no render-blocking scripts in <head>', () => {
    var headContent = indexHtml.match(/<head>([\s\S]*?)<\/head>/);
    if (headContent) {
      expect(headContent[1]).not.toMatch(/<script(?!\s+type="module")/);
    }
  });

  it('font uses font-display: swap to prevent FOIT', () => {
    expect(indexHtml).toMatch(/display=swap/);
  });

  it('preconnect hints for Google Fonts', () => {
    expect(indexHtml).toMatch(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"/);
    expect(indexHtml).toMatch(/<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"/);
  });

  it('no external JavaScript dependencies (zero deps)', () => {
    var scriptTags = indexHtml.match(/<script[^>]*src="[^"]*"/g) || [];
    scriptTags.forEach(function (tag) {
      expect(tag).not.toMatch(/https?:\/\//);
    });
  });

  it('no images or heavy assets referenced', () => {
    expect(indexHtml).not.toMatch(/<img\s/);
    expect(indexHtml).not.toMatch(/<video\s/);
    expect(indexHtml).not.toMatch(/<iframe\s/);
  });
});

// --- AC-FA3-25: Tab backgrounding preserves game state ---
describe('AC-FA3-25: Tab backgrounding preserves game state', () => {
  it('game.js does not use setInterval (no ticking timers that could drift)', () => {
    expect(gameJs).not.toMatch(/setInterval\s*\(/);
  });

  it('game.js does not use requestAnimationFrame loop', () => {
    var rafLoop = gameJs.match(/requestAnimationFrame\s*\(\s*\w+\s*\)/g);
    if (rafLoop) {
      expect(rafLoop.length).toBeLessThanOrEqual(1);
    }
  });

  it('game state is held in JS memory (no server polling)', () => {
    expect(gameJs).not.toMatch(/fetch\s*\(/);
    expect(gameJs).not.toMatch(/XMLHttpRequest/);
    expect(gameJs).not.toMatch(/WebSocket/);
  });

  it('setTimeout calls are short-duration animations only (all under 1000ms)', () => {
    var timeouts = gameJs.match(/setTimeout\s*\([^,]+,\s*(\d+)\s*\)/g) || [];
    timeouts.forEach(function (match) {
      var ms = parseInt(match.match(/,\s*(\d+)\s*\)/)[1], 10);
      expect(ms).toBeLessThanOrEqual(1000);
    });
  });

  it('no visibilitychange listeners that reset state', () => {
    expect(gameJs).not.toMatch(/visibilitychange/);
  });

  it('no beforeunload listeners', () => {
    expect(gameJs).not.toMatch(/beforeunload/);
  });
});

// --- AC-FA3-26: Page refresh cleanly resets game ---
describe('AC-FA3-26: Page refresh cleanly resets game', () => {
  beforeEach(() => { setupDOM(); });

  it('game initializes to ready state on page load', () => {
    var game = document.getElementById('game');
    expect(game.getAttribute('data-state')).toBe('ready');
  });

  it('game.js calls render() on load to set initial state', () => {
    expect(gameJs).toMatch(/render\(\)\s*;/);
  });

  it('game.js announces initial state on load', () => {
    expect(gameJs).toMatch(/announce\([^)]*[Hh]igh\s*[Ll]ow/);
  });

  it('createGame() produces a fresh shuffled deck (no carryover state)', () => {
    var { createGame } = require('../game-engine.js');
    var game1 = createGame();
    expect(game1.state).toBe('ready');
    expect(game1.streak).toBe(0);
    expect(game1.currentCard).toBeNull();
    expect(game1.cardsRemaining).toBe(52);
  });

  it('localStorage best score is read but not cleared on init', () => {
    expect(gameJs).toMatch(/readBestScore/);
    expect(gameJs).not.toMatch(/localStorage\.removeItem\s*\(\s*['"]highlow-best['"]\s*\)/);
    expect(gameJs).not.toMatch(/localStorage\.clear\s*\(\s*\)/);
  });

  it('no sessionStorage usage that would be lost on refresh', () => {
    expect(gameJs).not.toMatch(/sessionStorage/);
  });
});
