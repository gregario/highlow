'use strict';

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sampleCards, makeCard } from './fixtures.js';

var htmlSrc = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
var cssSrc = readFileSync(resolve(__dirname, '..', 'style.css'), 'utf8');

function setupDOM() {
  document.documentElement.innerHTML = '';
  document.write(htmlSrc);
  var style = document.createElement('style');
  style.textContent = cssSrc;
  document.head.appendChild(style);
}

// Helper: render a card into the card-front element using the renderer module
var renderCardFace;

beforeEach(async () => {
  setupDOM();
  var mod = await import('../card-renderer.js');
  renderCardFace = mod.renderCardFace;
});

// --- AC-FA2-01: Card face renders value and suit in CSS/HTML only ---
describe('AC-FA2-01: Card face renders value and suit in CSS/HTML only', () => {
  it('displays the value label in the card', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var text = el.textContent;
    expect(text).toContain(card.label);
  });

  it('displays the suit symbol', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var text = el.textContent;
    expect(text).toContain(card.symbol);
  });

  it('does not use any <img> elements', () => {
    var card = sampleCards.kingOfDiamonds;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var imgs = el.querySelectorAll('img');
    expect(imgs.length).toBe(0);
  });

  it('does not use CSS background-image for card content', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var children = el.querySelectorAll('*');
    children.forEach(function (child) {
      var bg = getComputedStyle(child).backgroundImage;
      // Allow 'none' or empty
      if (bg && bg !== 'none') {
        // Card-back pattern is fine on .card-back, but not on card-front children
        expect(bg).toBe('none');
      }
    });
  });

  it('applies warm red color for hearts', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    // The element or its children should have the suit-red color applied
    var hasRedColor = el.style.color.includes('--color-suit-red') ||
      el.querySelector('[class*="red"]') !== null ||
      el.getAttribute('data-suit-color') === 'red';
    expect(hasRedColor).toBe(true);
  });

  it('applies warm red color for diamonds', () => {
    var card = sampleCards.kingOfDiamonds;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var hasRedColor = el.style.color.includes('--color-suit-red') ||
      el.querySelector('[class*="red"]') !== null ||
      el.getAttribute('data-suit-color') === 'red';
    expect(hasRedColor).toBe(true);
  });

  it('applies near-black color for clubs', () => {
    var card = sampleCards.threeOfClubs;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var hasDarkColor = el.style.color.includes('--color-suit-dark') ||
      el.querySelector('[class*="dark"]') !== null ||
      el.getAttribute('data-suit-color') === 'dark';
    expect(hasDarkColor).toBe(true);
  });

  it('applies near-black color for spades', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var hasDarkColor = el.style.color.includes('--color-suit-dark') ||
      el.querySelector('[class*="dark"]') !== null ||
      el.getAttribute('data-suit-color') === 'dark';
    expect(hasDarkColor).toBe(true);
  });
});

// --- AC-FA2-02: Card face includes pip layout for number cards ---
describe('AC-FA2-02: Card face includes pip layout for number cards', () => {
  it('renders 2 pips for a 2-value card', () => {
    var card = makeCard(2, 0); // 2 of hearts
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(2);
  });

  it('renders 3 pips for a 3-value card', () => {
    var card = sampleCards.threeOfClubs;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(3);
  });

  it('renders 7 pips for a 7-value card', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(7);
  });

  it('renders 10 pips for a 10-value card', () => {
    var card = sampleCards.tenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(10);
  });

  it('pip text content is the suit symbol', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    pips.forEach(function (pip) {
      expect(pip.textContent).toBe('♥');
    });
  });

  it('pips are HTML elements, not images', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    pips.forEach(function (pip) {
      expect(pip.tagName).not.toBe('IMG');
      expect(pip.tagName).not.toBe('SVG');
    });
  });

  it('does not render pips for face cards', () => {
    var card = sampleCards.kingOfDiamonds;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(0);
  });

  it('does not render pips for Ace', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var pips = el.querySelectorAll('.pip');
    expect(pips.length).toBe(0);
  });
});

// --- AC-FA2-03: Face cards display letter and suit without illustration ---
describe('AC-FA2-03: Face cards display letter and suit without illustration', () => {
  it('Jack shows "J" prominently', () => {
    var card = makeCard(11, 2); // Jack of clubs
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var valueEl = el.querySelector('.card-value');
    expect(valueEl).not.toBeNull();
    expect(valueEl.textContent).toBe('J');
  });

  it('Queen shows "Q" prominently', () => {
    var card = sampleCards.queenOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var valueEl = el.querySelector('.card-value');
    expect(valueEl).not.toBeNull();
    expect(valueEl.textContent).toBe('Q');
  });

  it('King shows "K" prominently', () => {
    var card = sampleCards.kingOfDiamonds;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var valueEl = el.querySelector('.card-value');
    expect(valueEl).not.toBeNull();
    expect(valueEl.textContent).toBe('K');
  });

  it('Ace shows "A" prominently', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var valueEl = el.querySelector('.card-value');
    expect(valueEl).not.toBeNull();
    expect(valueEl.textContent).toBe('A');
  });

  it('face card shows suit symbol', () => {
    var card = sampleCards.kingOfDiamonds;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var suitEl = el.querySelector('.card-suit');
    expect(suitEl).not.toBeNull();
    expect(suitEl.textContent).toBe('♦');
  });

  it('face card contains no <img> or <svg> illustrations', () => {
    var card = sampleCards.queenOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.querySelectorAll('img').length).toBe(0);
    expect(el.querySelectorAll('svg').length).toBe(0);
  });

  it('Ace shows a large centered suit symbol', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var centerSuit = el.querySelector('.card-center-suit');
    expect(centerSuit).not.toBeNull();
    expect(centerSuit.textContent).toBe('♠');
  });
});

// --- AC-FA2-04: Card back displays geometric pattern ---
describe('AC-FA2-04: Card back displays geometric pattern', () => {
  it('card-back element exists', () => {
    var el = document.querySelector('.card-back');
    expect(el).not.toBeNull();
  });

  it('card-back has no <img> tags', () => {
    var el = document.querySelector('.card-back');
    expect(el.querySelectorAll('img').length).toBe(0);
  });

  it('CSS contains repeating-linear-gradient for card-back', () => {
    expect(cssSrc).toContain('repeating-linear-gradient');
    expect(cssSrc).toContain('.card-back');
  });

  it('card-back background color is the dark token', () => {
    // The CSS should use --color-card-back
    expect(cssSrc).toMatch(/\.card-back[\s\S]*?background-color:\s*var\(--color-card-back\)/);
  });
});

// --- AC-FA2-05: Card dimensions maintain playing card aspect ratio ---
describe('AC-FA2-05: Card dimensions maintain playing card aspect ratio', () => {
  it('CSS defines aspect-ratio 5/7 on .card', () => {
    expect(cssSrc).toMatch(/\.card[\s\S]*?aspect-ratio:\s*(var\(--card-aspect\)|5\s*\/\s*7)/);
  });

  it('card aspect ratio token is 5 / 7', () => {
    expect(cssSrc).toContain('--card-aspect: 5 / 7');
  });
});

// --- AC-FA2-06: Suit colors use refined palette ---
describe('AC-FA2-06: Suit colors use refined palette', () => {
  it('suit red is NOT pure #FF0000', () => {
    // --color-suit-red should not be pure red
    var match = cssSrc.match(/--color-suit-red:\s*([^;]+)/);
    expect(match).not.toBeNull();
    var val = match[1].trim().toUpperCase();
    expect(val).not.toBe('#FF0000');
    expect(val).not.toBe('#F00');
    expect(val).not.toBe('RED');
  });

  it('suit dark is NOT pure #000000', () => {
    var match = cssSrc.match(/--color-suit-dark:\s*([^;]+)/);
    expect(match).not.toBeNull();
    var val = match[1].trim().toUpperCase();
    expect(val).not.toBe('#000000');
    expect(val).not.toBe('#000');
    expect(val).not.toBe('BLACK');
  });

  it('suit red token is a warm muted red', () => {
    var match = cssSrc.match(/--color-suit-red:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    var hex = match[1];
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    // Warm red: R is dominant, not pure, G and B present
    expect(r).toBeGreaterThan(150);
    expect(r).toBeLessThan(255);
    expect(g).toBeGreaterThan(30);
    expect(b).toBeGreaterThan(30);
  });

  it('suit dark token is a warm near-black', () => {
    var match = cssSrc.match(/--color-suit-dark:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    var hex = match[1];
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    // Near-black but warm: R > G > B or R >= G, all dark
    expect(r).toBeLessThan(80);
    expect(g).toBeLessThan(80);
    expect(b).toBeLessThan(80);
    expect(r + g + b).toBeGreaterThan(50); // not pure black
  });

  it('hearts card uses suit-red color class', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.getAttribute('data-suit-color')).toBe('red');
  });

  it('spades card uses suit-dark color class', () => {
    var card = sampleCards.aceOfSpades;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.getAttribute('data-suit-color')).toBe('dark');
  });
});

// --- Number card: corner labels ---
describe('Number cards have corner value and suit labels', () => {
  it('number card has top-left corner with value and suit', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var corner = el.querySelector('.card-corner-tl');
    expect(corner).not.toBeNull();
    expect(corner.textContent).toContain('7');
    expect(corner.textContent).toContain('♥');
  });

  it('number card has bottom-right corner with value and suit', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    var corner = el.querySelector('.card-corner-br');
    expect(corner).not.toBeNull();
    expect(corner.textContent).toContain('7');
    expect(corner.textContent).toContain('♥');
  });
});

// --- renderCardFace(null) clears the card ---
describe('renderCardFace clears when given null', () => {
  it('clears all children when card is null', () => {
    var card = sampleCards.sevenOfHearts;
    var el = document.querySelector('.card-front');
    renderCardFace(el, card);
    expect(el.children.length).toBeGreaterThan(0);
    renderCardFace(el, null);
    expect(el.children.length).toBe(0);
    expect(el.textContent).toBe('');
  });
});
