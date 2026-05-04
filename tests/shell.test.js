import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

describe('HTML shell', () => {
  let dom, doc;

  beforeEach(() => {
    dom = new JSDOM(html);
    doc = dom.window.document;
  });

  it('has a game container with data-state attribute', () => {
    const game = doc.getElementById('game');
    expect(game).not.toBeNull();
    expect(game.hasAttribute('data-state')).toBe(true);
  });

  it('has a card with front and back faces', () => {
    const front = doc.querySelector('.card-front');
    const back = doc.querySelector('.card-back');
    expect(front).not.toBeNull();
    expect(back).not.toBeNull();
  });

  it('has Higher and Lower buttons', () => {
    const higher = doc.querySelector('.btn-higher');
    const lower = doc.querySelector('.btn-lower');
    expect(higher).not.toBeNull();
    expect(lower).not.toBeNull();
    expect(higher.textContent).toBe('Higher');
    expect(lower.textContent).toBe('Lower');
  });

  it('has a Play Again button', () => {
    const btn = doc.querySelector('.btn-play-again');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Play again');
  });

  it('has an aria-live announcer for screen readers', () => {
    const announcer = doc.querySelector('[role="status"][aria-live="polite"]');
    expect(announcer).not.toBeNull();
  });

  it('has streak, cards-remaining, and best-score regions', () => {
    expect(doc.querySelector('.streak-display')).not.toBeNull();
    expect(doc.querySelector('.cards-remaining')).not.toBeNull();
    expect(doc.querySelector('.best-score')).not.toBeNull();
  });

  it('loads Inter font from Google Fonts with display=swap', () => {
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    const fontLink = links.find((l) => l.href.includes('fonts.googleapis.com'));
    expect(fontLink).toBeDefined();
    expect(fontLink.href).toContain('Inter');
    expect(fontLink.href).toContain('display=swap');
  });

  it('includes viewport meta for responsive', () => {
    const viewport = doc.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.content).toContain('width=device-width');
  });

  it('loads style.css and game.js', () => {
    const css = doc.querySelector('link[href="style.css"]');
    const js = doc.querySelector('script[src="game.js"]');
    expect(css).not.toBeNull();
    expect(js).not.toBeNull();
  });
});
