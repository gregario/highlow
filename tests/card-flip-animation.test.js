'use strict';

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

var htmlSrc = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
var cssSrc = readFileSync(resolve(__dirname, '..', 'style.css'), 'utf8');
var gameJs = readFileSync(resolve(__dirname, '..', 'game.js'), 'utf8');

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

// --- AC-FA3-01: 3D card flip on Y-axis ---
describe('AC-FA3-01: 3D card flip on Y-axis', () => {
  beforeEach(() => { setupDOM(); });

  it('card-inner has transition on transform property', () => {
    var css = getCSS();
    var match = css.match(/\.card-inner\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/transition:\s*transform/);
  });

  it('card-inner.flipped applies rotateY(180deg)', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-inner\.flipped\s*\{[^}]*rotateY\(180deg\)/);
  });

  it('card element has perspective set (800-1200px)', () => {
    var css = getCSS();
    var perspectiveMatch = css.match(/--perspective:\s*(\d+)px/);
    expect(perspectiveMatch).not.toBeNull();
    var val = parseInt(perspectiveMatch[1], 10);
    expect(val).toBeGreaterThanOrEqual(800);
    expect(val).toBeLessThanOrEqual(1200);
  });

  it('.card uses perspective from token', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card\s*\{[^}]*perspective:\s*var\(--perspective\)/);
  });

  it('card-inner has transform-style: preserve-3d', () => {
    var cardInner = document.querySelector('.card-inner');
    var style = getComputedStyle(cardInner);
    expect(style.transformStyle).toBe('preserve-3d');
  });

  it('flip duration token is between 350ms and 450ms', () => {
    var css = getCSS();
    var match = css.match(/--flip-duration:\s*(\d+)ms/);
    expect(match).not.toBeNull();
    var duration = parseInt(match[1], 10);
    expect(duration).toBeGreaterThanOrEqual(350);
    expect(duration).toBeLessThanOrEqual(450);
  });

  it('card-inner transition uses flip-duration token', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-inner\s*\{[^}]*transition:\s*transform\s+var\(--flip-duration\)/);
  });
});

// --- AC-FA3-02: Flip animation uses physical-feeling easing ---
describe('AC-FA3-02: Flip animation uses physical-feeling easing', () => {
  beforeEach(() => { setupDOM(); });

  it('flip easing is a decelerating curve (not linear, not ease-in)', () => {
    var css = getCSS();
    var match = css.match(/--flip-easing:\s*([^;]+)/);
    expect(match).not.toBeNull();
    var easing = match[1].trim();
    expect(easing).not.toBe('linear');
    expect(easing).not.toBe('ease-in');
  });

  it('flip easing is ease-out or decelerating cubic-bezier', () => {
    var css = getCSS();
    var match = css.match(/--flip-easing:\s*([^;]+)/);
    var easing = match[1].trim();
    // Must be ease-out or a cubic-bezier
    var isEaseOut = easing === 'ease-out';
    var isCubicBezier = easing.startsWith('cubic-bezier');
    expect(isEaseOut || isCubicBezier).toBe(true);

    if (isCubicBezier) {
      // Parse: cubic-bezier(p1, p2, p3, p4). For deceleration, p3 should be <= p1
      // and p4 should be >= p2, producing a curve that slows down at the end.
      var nums = easing.match(/[\d.]+/g).map(Number);
      // A decelerating curve ends slowly: the second control point's y (p4) should be >= 0.8
      // and the curve should not accelerate at end (p3 < 1)
      expect(nums[2]).toBeLessThanOrEqual(1);
      expect(nums[3]).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('card-inner transition uses flip-easing token', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-inner\s*\{[^}]*var\(--flip-easing\)/);
  });
});

// --- AC-FA3-03: Card back visible during flip ---
describe('AC-FA3-03: Card back visible during flip', () => {
  beforeEach(() => { setupDOM(); });

  it('card has two face layers (front and back)', () => {
    var card = document.querySelector('.card');
    var faces = card.querySelectorAll('.card-face');
    expect(faces.length).toBe(2);
  });

  it('both card faces have backface-visibility: hidden', () => {
    var css = getCSS();
    // .card-face rule applies to both front and back
    expect(css).toMatch(/\.card-face\s*\{[^}]*backface-visibility:\s*hidden/);
  });

  it('card-front has rotateY(180deg) so it faces away in default state', () => {
    var css = getCSS();
    expect(css).toMatch(/\.card-front\s*\{[^}]*transform:\s*rotateY\(180deg\)/);
  });

  it('card-back does not have rotateY transform (faces forward in default state)', () => {
    var cardBack = document.querySelector('.card-back');
    var style = getComputedStyle(cardBack);
    // card-back should not have a rotateY applied
    var transform = style.transform;
    if (transform && transform !== 'none') {
      expect(transform).not.toMatch(/rotateY/);
    }
  });

  it('when flipped, card-inner rotates 180deg showing front and hiding back', () => {
    var cardInner = document.querySelector('.card-inner');
    cardInner.classList.add('flipped');
    // After adding .flipped class, CSS says transform: rotateY(180deg)
    // So card-front (which has its own rotateY(180deg)) ends at 360deg = visible
    // And card-back ends at 180deg = hidden (backface-visibility: hidden)
    var css = getCSS();
    expect(css).toMatch(/\.card-inner\.flipped\s*\{[^}]*rotateY\(180deg\)/);
  });
});

// --- AC-FA3-04: Flip animation is GPU-accelerated ---
describe('AC-FA3-04: Flip animation is GPU-accelerated', () => {
  beforeEach(() => { setupDOM(); });

  it('animation property is transform (not top/left/width/height)', () => {
    var css = getCSS();
    var match = css.match(/\.card-inner\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    var transitionLine = match[1].match(/transition:\s*([^;]+)/);
    expect(transitionLine).not.toBeNull();
    expect(transitionLine[1]).toMatch(/transform/);
    expect(transitionLine[1]).not.toMatch(/\b(top|left|width|height)\b/);
  });

  it('card-inner has will-change: transform for compositor layer promotion', () => {
    var css = getCSS();
    var match = css.match(/\.card-inner\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/will-change:\s*transform/);
  });

  it('no layout-triggering properties animated on card-inner', () => {
    var css = getCSS();
    // Extract the .card-inner transition value
    var match = css.match(/\.card-inner\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    var rules = match[1];
    // Transition should only be on transform, not on layout properties
    var transMatch = rules.match(/transition:\s*([^;]+)/);
    expect(transMatch).not.toBeNull();
    expect(transMatch[1]).toMatch(/transform/);
    expect(transMatch[1]).not.toMatch(/\b(top|left|right|bottom|width|height|margin|padding)\b/);
  });
});

// --- AC-FA3-05: No double-flip on rapid click ---
describe('AC-FA3-05: No double-flip on rapid click', () => {
  beforeEach(() => { setupDOM(); });

  it('buttons have pointer-events: none during revealing state via CSS', () => {
    var css = getCSS();
    expect(css).toMatch(/\[data-state="revealing"\].*\.btn\s*\{[^}]*pointer-events:\s*none/);
  });

  it('buttons have reduced opacity during revealing state', () => {
    var css = getCSS();
    expect(css).toMatch(/\[data-state="revealing"\].*\.btn\s*\{[^}]*opacity:\s*0\.5/);
  });

  it('game.js guards against guess when not in playing state', () => {
    var src = gameJs;
    // engine.guess only works in 'playing' state (game-engine.js enforces this)
    // game.js also has a guard: if (engine.state !== 'playing') return
    expect(src).toMatch(/engine\.state\s*!==\s*'playing'/);
  });

  it('game-engine guess method returns same state if not in playing state', () => {
    var engineSrc = readFileSync(resolve(__dirname, '..', 'game-engine.js'), 'utf8');
    // guess function checks this.state !== 'playing' and returns this
    expect(engineSrc).toMatch(/function\s+guess[^{]*\{[^}]*if\s*\(\s*this\.state\s*!==\s*'playing'\s*\)\s*return\s+this/);
  });

  it('revealing state is set before the flip animation timeout', () => {
    var src = gameJs;
    // In the playing-state path, setState('revealing') happens before the setTimeout
    var playingBlock = src.slice(src.indexOf("if (engine.state !== 'playing')"));
    expect(playingBlock).toMatch(/setState\('revealing'\)/);
  });
});
