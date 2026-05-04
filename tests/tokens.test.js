import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');

describe('CSS design tokens', () => {
  it('defines all color tokens on :root', () => {
    const requiredTokens = [
      '--color-bg',
      '--color-fg',
      '--color-card-face',
      '--color-card-back',
      '--color-suit-red',
      '--color-suit-dark',
      '--color-accent-correct',
      '--color-accent-wrong',
      '--color-accent-push',
      '--color-btn-bg',
      '--color-btn-hover',
    ];
    for (const token of requiredTokens) {
      expect(css).toContain(token);
    }
  });

  it('uses warm off-white background, not pure white or black', () => {
    expect(css).toContain('#F5F0EB');
    expect(css).not.toMatch(/--color-bg:\s*#fff(fff)?;/i);
    expect(css).not.toMatch(/--color-bg:\s*#000(000)?;/i);
  });

  it('uses warm near-black foreground, not pure black', () => {
    expect(css).toContain('#2C2825');
  });

  it('defines Inter as the font family', () => {
    expect(css).toContain("'Inter'");
  });

  it('defines typography scale tokens', () => {
    expect(css).toContain('--fs-card-value');
    expect(css).toContain('--fs-btn');
    expect(css).toContain('--fs-secondary');
    expect(css).toContain('--fs-title');
  });

  it('defines card aspect ratio as 5/7', () => {
    expect(css).toMatch(/--card-aspect:\s*5\s*\/\s*7/);
  });

  it('defines border-radius tokens', () => {
    expect(css).toContain('--radius-card: 12px');
    expect(css).toContain('--radius-btn: 8px');
  });

  it('includes prefers-reduced-motion media query', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });

  it('defines state visibility rules for all 5 game states', () => {
    expect(css).toContain('[data-state="ready"]');
    expect(css).toContain('[data-state="playing"]');
    expect(css).toContain('[data-state="revealing"]');
    expect(css).toContain('[data-state="game-over"]');
    expect(css).toContain('[data-state="deck-complete"]');
  });

  it('has focus-visible styling for buttons', () => {
    expect(css).toContain(':focus-visible');
  });

  it('scopes hover to pointer devices', () => {
    expect(css).toContain('@media (hover: hover)');
  });
});
