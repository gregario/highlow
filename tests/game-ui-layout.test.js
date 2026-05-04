import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
const css = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');

function createDOM() {
  const dom = new JSDOM(html, { url: 'http://localhost' });
  const style = dom.window.document.createElement('style');
  style.textContent = css;
  dom.window.document.head.appendChild(style);
  return dom;
}

describe('AC-FA2-13: Single-column centered layout', () => {
  let doc;

  beforeEach(() => {
    const dom = createDOM();
    doc = dom.window.document;
  });

  it('game container uses flex column layout', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*display:\s*flex/);
    expect(css).toMatch(/\.game\s*\{[^}]*flex-direction:\s*column/);
    expect(css).toMatch(/\.game\s*\{[^}]*align-items:\s*center/);
  });

  it('all major elements are in the game container in vertical order', () => {
    const game = doc.getElementById('game');
    const children = Array.from(game.children).map((el) => el.className.split(' ')[0]);
    expect(children).toEqual([
      'game-title',
      'card-area',
      'streak-display',
      'cards-remaining',
      'action-buttons',
      'play-again-area',
      'best-score',
      'sr-announcer',
    ]);
  });

  it('Higher and Lower buttons are side-by-side in a flex row', () => {
    expect(css).toMatch(/\.action-buttons\s*\{[^}]*display:\s*flex/);
    const actionBtns = doc.querySelector('.action-buttons');
    const buttons = actionBtns.querySelectorAll('.btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].classList.contains('btn-higher')).toBe(true);
    expect(buttons[1].classList.contains('btn-lower')).toBe(true);
  });

  it('game container is horizontally centered with margin auto', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*margin:\s*0\s+auto/);
  });
});

describe('AC-FA2-14: Mobile-first at 375px viewport', () => {
  it('card has a minimum width for mobile legibility', () => {
    expect(css).toMatch(/--card-min-w:\s*140px/);
    expect(css).toContain('min-width: var(--card-min-w)');
  });

  it('buttons meet 44px minimum touch target', () => {
    expect(css).toMatch(/\.btn\s*\{[^}]*min-height:\s*48px/);
    expect(css).toMatch(/\.btn\s*\{[^}]*min-width:\s*44px/);
  });

  it('card value font size is at least 24px (3.5rem at 16px base)', () => {
    const match = css.match(/--fs-card-value:\s*([\d.]+)rem/);
    expect(match).not.toBeNull();
    const remValue = parseFloat(match[1]);
    expect(remValue * 16).toBeGreaterThanOrEqual(24);
  });

  it('game container has horizontal padding to prevent edge-to-edge overflow', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*padding:\s*\d+px\s+\d+px/);
  });

  it('card width uses min() to prevent overflow on narrow viewports', () => {
    expect(css).toContain('width: min(var(--card-max-w), 50vw)');
  });

  it('viewport meta tag is set for responsive behavior', () => {
    const dom = createDOM();
    const viewport = dom.window.document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.content).toContain('width=device-width');
    expect(viewport.content).toContain('initial-scale=1');
  });
});

describe('AC-FA2-15: Desktop centers with max-width', () => {
  it('game container has max-width between 480 and 600px', () => {
    const match = css.match(/\.game\s*\{[^}]*max-width:\s*(\d+)px/);
    expect(match).not.toBeNull();
    const maxWidth = parseInt(match[1], 10);
    expect(maxWidth).toBeGreaterThanOrEqual(480);
    expect(maxWidth).toBeLessThanOrEqual(600);
  });

  it('game container is centered via margin: 0 auto', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*margin:\s*0\s+auto/);
  });
});

describe('AC-FA2-16: Higher and Lower buttons equally sized and side-by-side', () => {
  let doc;

  beforeEach(() => {
    const dom = createDOM();
    doc = dom.window.document;
  });

  it('both buttons use flex: 1 for equal sizing', () => {
    expect(css).toMatch(/\.btn-higher[\s\S]*?flex:\s*1/);
    expect(css).toMatch(/\.btn-lower[\s\S]*?flex:\s*1/);
  });

  it('action-buttons container uses flexbox with a gap', () => {
    expect(css).toMatch(/\.action-buttons\s*\{[^}]*display:\s*flex/);
    expect(css).toMatch(/\.action-buttons\s*\{[^}]*gap:\s*\d+px/);
  });

  it('both buttons exist in the action-buttons container', () => {
    const container = doc.querySelector('.action-buttons');
    expect(container).not.toBeNull();
    const higher = container.querySelector('.btn-higher');
    const lower = container.querySelector('.btn-lower');
    expect(higher).not.toBeNull();
    expect(lower).not.toBeNull();
  });

  it('buttons share the same base styling class', () => {
    const higher = doc.querySelector('.btn-higher');
    const lower = doc.querySelector('.btn-lower');
    expect(higher.classList.contains('btn')).toBe(true);
    expect(lower.classList.contains('btn')).toBe(true);
  });
});

describe('AC-FA2-17: No scrolling required during gameplay', () => {
  it('game container uses dvh units for full viewport height', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*min-height:\s*100dvh/);
  });

  it('game container uses justify-content: center to vertically center content', () => {
    expect(css).toMatch(/\.game\s*\{[^}]*justify-content:\s*center/);
  });

  it('card-area has a fixed margin-bottom for spacing from buttons', () => {
    expect(css).toMatch(/\.card-area\s*\{[^}]*margin-bottom:\s*\d+px/);
  });

  it('game uses compact padding that fits in 600px height', () => {
    const match = css.match(/\.game\s*\{[^}]*padding:\s*(\d+)px\s+(\d+)px/);
    expect(match).not.toBeNull();
    const verticalPadding = parseInt(match[1], 10);
    expect(verticalPadding).toBeLessThanOrEqual(48);
  });

  it('body has no overflow hidden that would hide content', () => {
    expect(css).not.toMatch(/body\s*\{[^}]*overflow:\s*hidden/);
  });
});
