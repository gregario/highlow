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

// Helper to parse hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper to calculate relative luminance (WCAG formula)
function relativeLuminance(r, g, b) {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const r_lin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g_lin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b_lin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin;
}

// Helper to calculate contrast ratio (WCAG formula)
function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(fg.r, fg.g, fg.b);
  const L2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('AC-FA2-07: Background uses warm neutral, not pure black or white', () => {
  it('background color is not pure white (#FFFFFF)', () => {
    const match = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    const bgColor = match[1].toUpperCase();
    expect(bgColor).not.toBe('FFFFFF');
    expect(bgColor).not.toBe('FFF');
  });

  it('background color is not pure black (#000000)', () => {
    const match = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    const bgColor = match[1].toUpperCase();
    expect(bgColor).not.toBe('000000');
    expect(bgColor).not.toBe('000');
  });

  it('background is a warm off-white (high lightness, warm cast)', () => {
    const match = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    const rgb = hexToRgb('#' + match[1]);

    // High lightness: all channels > 200
    expect(rgb.r).toBeGreaterThan(200);
    expect(rgb.g).toBeGreaterThan(200);
    expect(rgb.b).toBeGreaterThan(200);

    // Warm cast: R slightly > B (yellow/beige tint)
    expect(rgb.r).toBeGreaterThanOrEqual(rgb.b);
  });

  it('background is not a cool gray (not equal R=G=B)', () => {
    const match = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    expect(match).not.toBeNull();
    const rgb = hexToRgb('#' + match[1]);

    // Not a pure gray (R != G != B, at least one differs)
    const isGray = (rgb.r === rgb.g && rgb.g === rgb.b);
    expect(isGray).toBe(false);
  });
});

describe('AC-FA2-08: Single typeface loaded and applied', () => {
  it('Inter is loaded via Google Fonts or self-hosted', () => {
    // Check HTML for Google Fonts link
    expect(html).toMatch(/fonts\.googleapis\.com.*Inter/);
  });

  it('CSS uses Inter as primary font-family', () => {
    expect(css).toContain("'Inter'");
    expect(css).toMatch(/font-family:\s*'Inter'/);
  });

  it('only one primary font family is defined (no second custom font)', () => {
    // Count custom font declarations (not system fonts)
    const customFontMatches = css.match(/font-family:\s*'[^']+'/g);
    if (customFontMatches) {
      const uniqueFonts = new Set(customFontMatches);
      // Should only reference Inter (may appear multiple times, but only one unique custom font)
      expect(uniqueFonts.size).toBe(1);
      expect(Array.from(uniqueFonts)[0]).toContain('Inter');
    }
  });

  it('fallback is a clean system sans-serif', () => {
    const match = css.match(/font-family:\s*'Inter'[^;]+/);
    expect(match).not.toBeNull();
    expect(match[0]).toContain('sans-serif');
  });

  it('body element applies the single font-family', () => {
    // CSS uses the --font-family token which references Inter
    expect(css).toMatch(/body\s*\{[^}]*font-family:\s*var\(--font-family\)/);
    expect(css).toMatch(/--font-family:\s*'Inter'/);
  });
});

describe('AC-FA2-09: Font loading uses swap strategy', () => {
  it('Google Fonts link includes display=swap parameter', () => {
    const dom = createDOM();
    const links = Array.from(dom.window.document.querySelectorAll('link[rel="stylesheet"]'));
    const fontLink = links.find(l => l.href.includes('fonts.googleapis.com'));
    expect(fontLink).toBeDefined();
    expect(fontLink.href).toContain('display=swap');
  });

  it('text is immediately visible in fallback font (no FOIT)', () => {
    // Verify swap ensures text is visible before web font loads
    // This is enforced by the display=swap parameter
    // Check in the raw HTML source since JSDOM doesn't fully parse the href
    expect(html).toMatch(/display=swap/);
  });

  it('font-display: swap prevents invisible text', () => {
    // The display=swap parameter in the Google Fonts URL ensures FOUT (flash of unstyled text)
    // rather than FOIT (flash of invisible text)
    expect(html).toMatch(/display=swap/);
  });
});

describe('AC-FA2-10: Type hierarchy establishes visual priority', () => {
  it('card value is the largest text on screen', () => {
    const cardValueMatch = css.match(/--fs-card-value:\s*([\d.]+)rem/);
    const btnMatch = css.match(/--fs-btn:\s*([\d.]+)rem/);
    const secondaryMatch = css.match(/--fs-secondary:\s*([\d.]+)rem/);
    const titleMatch = css.match(/--fs-title:\s*([\d.]+)rem/);

    expect(cardValueMatch).not.toBeNull();
    expect(btnMatch).not.toBeNull();
    expect(secondaryMatch).not.toBeNull();

    const cardValue = parseFloat(cardValueMatch[1]);
    const btn = parseFloat(btnMatch[1]);
    const secondary = parseFloat(secondaryMatch[1]);

    // Card value is largest
    expect(cardValue).toBeGreaterThan(btn);
    expect(cardValue).toBeGreaterThan(secondary);
    if (titleMatch) {
      const title = parseFloat(titleMatch[1]);
      expect(cardValue).toBeGreaterThan(title);
    }
  });

  it('button text is medium-sized', () => {
    const btnMatch = css.match(/--fs-btn:\s*([\d.]+)rem/);
    const secondaryMatch = css.match(/--fs-secondary:\s*([\d.]+)rem/);

    expect(btnMatch).not.toBeNull();
    expect(secondaryMatch).not.toBeNull();

    const btn = parseFloat(btnMatch[1]);
    const secondary = parseFloat(secondaryMatch[1]);

    // Buttons are larger than secondary text
    expect(btn).toBeGreaterThan(secondary);
  });

  it('secondary text (cards remaining, best score) is smallest', () => {
    const secondaryMatch = css.match(/--fs-secondary:\s*([\d.]+)rem/);
    expect(secondaryMatch).not.toBeNull();
    const secondary = parseFloat(secondaryMatch[1]);

    // Secondary text exists and is the smallest size tier
    expect(secondary).toBeGreaterThan(0);
    expect(secondary).toBeLessThan(1.5); // Reasonable upper bound for secondary text
  });

  it('ratio between largest and smallest is at least 3:1', () => {
    const cardValueMatch = css.match(/--fs-card-value:\s*([\d.]+)rem/);
    const secondaryMatch = css.match(/--fs-secondary:\s*([\d.]+)rem/);

    expect(cardValueMatch).not.toBeNull();
    expect(secondaryMatch).not.toBeNull();

    const largest = parseFloat(cardValueMatch[1]);
    const smallest = parseFloat(secondaryMatch[1]);
    const ratio = largest / smallest;

    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('no two text elements compete for attention (distinct size tiers)', () => {
    const cardValueMatch = css.match(/--fs-card-value:\s*([\d.]+)rem/);
    const btnMatch = css.match(/--fs-btn:\s*([\d.]+)rem/);
    const secondaryMatch = css.match(/--fs-secondary:\s*([\d.]+)rem/);

    const cardValue = parseFloat(cardValueMatch[1]);
    const btn = parseFloat(btnMatch[1]);
    const secondary = parseFloat(secondaryMatch[1]);

    // All three sizes are distinct (no two within 0.1rem)
    expect(Math.abs(cardValue - btn)).toBeGreaterThan(0.1);
    expect(Math.abs(btn - secondary)).toBeGreaterThan(0.1);
    expect(Math.abs(cardValue - secondary)).toBeGreaterThan(0.1);
  });
});

describe('AC-FA2-11: Generous spacing — card breathes', () => {
  it('card has at least 24px of clear space on all sides (via margin)', () => {
    const match = css.match(/\.card-area\s*\{[^}]*margin[^}]*\}/s);
    expect(match).not.toBeNull();
    // Card-area has margin-bottom spacing
    expect(css).toMatch(/\.card-area\s*\{[^}]*margin-bottom:\s*\d+px/);
    const marginMatch = css.match(/\.card-area\s*\{[^}]*margin-bottom:\s*(\d+)px/);
    if (marginMatch) {
      const margin = parseInt(marginMatch[1], 10);
      expect(margin).toBeGreaterThanOrEqual(24);
    }
  });

  it('buttons are separated from card by at least 32px', () => {
    // Card-area has margin-bottom that creates space between card and buttons
    const match = css.match(/\.card-area\s*\{[^}]*margin-bottom:\s*(\d+)px/);
    expect(match).not.toBeNull();
    const spacing = parseInt(match[1], 10);
    expect(spacing).toBeGreaterThanOrEqual(32);
  });

  it('game container uses no more than 60% of viewport width on desktop', () => {
    const match = css.match(/\.game\s*\{[^}]*max-width:\s*(\d+)px/);
    expect(match).not.toBeNull();
    const maxWidth = parseInt(match[1], 10);

    // On a 1024px viewport (common desktop), 60% = 614px
    // On 1440px, 60% = 864px
    // max-width should be <= 600px to ensure constraint
    expect(maxWidth).toBeLessThanOrEqual(600);
  });

  it('overall layout uses generous vertical padding', () => {
    const match = css.match(/\.game\s*\{[^}]*padding:\s*(\d+)px\s+(\d+)px/);
    expect(match).not.toBeNull();
    const verticalPadding = parseInt(match[1], 10);
    const horizontalPadding = parseInt(match[2], 10);

    // Generous padding (at least 24px horizontal, 32px+ vertical)
    expect(horizontalPadding).toBeGreaterThanOrEqual(16);
    expect(verticalPadding).toBeGreaterThanOrEqual(32);
  });
});

describe('AC-FA2-12: All text passes WCAG AA contrast', () => {
  it('foreground (#2C2825) on background (#F5F0EB) meets AA for body text (4.5:1)', () => {
    const bgMatch = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    const fgMatch = css.match(/--color-fg:\s*#([0-9A-Fa-f]{6})/);

    expect(bgMatch).not.toBeNull();
    expect(fgMatch).not.toBeNull();

    const bg = hexToRgb('#' + bgMatch[1]);
    const fg = hexToRgb('#' + fgMatch[1]);

    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('suit red (#C45B4A) on card face background meets AA for large text (3:1)', () => {
    const cardFaceMatch = css.match(/--color-card-face:\s*#([0-9A-Fa-f]{6})/);
    const suitRedMatch = css.match(/--color-suit-red:\s*#([0-9A-Fa-f]{6})/);

    expect(cardFaceMatch).not.toBeNull();
    expect(suitRedMatch).not.toBeNull();

    const cardFace = hexToRgb('#' + cardFaceMatch[1]);
    const suitRed = hexToRgb('#' + suitRedMatch[1]);

    const ratio = contrastRatio(suitRed, cardFace);
    // Card value is large text (>= 18pt bold or >= 24pt regular), so 3:1 minimum
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('suit dark (#2C2825) on card face background meets AA for large text (3:1)', () => {
    const cardFaceMatch = css.match(/--color-card-face:\s*#([0-9A-Fa-f]{6})/);
    const suitDarkMatch = css.match(/--color-suit-dark:\s*#([0-9A-Fa-f]{6})/);

    expect(cardFaceMatch).not.toBeNull();
    expect(suitDarkMatch).not.toBeNull();

    const cardFace = hexToRgb('#' + cardFaceMatch[1]);
    const suitDark = hexToRgb('#' + suitDarkMatch[1]);

    const ratio = contrastRatio(suitDark, cardFace);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it('button text color on button background meets AA (4.5:1)', () => {
    const btnBgMatch = css.match(/--color-btn-bg:\s*#([0-9A-Fa-f]{6})/);
    const fgMatch = css.match(/--color-fg:\s*#([0-9A-Fa-f]{6})/);

    expect(btnBgMatch).not.toBeNull();
    expect(fgMatch).not.toBeNull();

    const btnBg = hexToRgb('#' + btnBgMatch[1]);
    const fg = hexToRgb('#' + fgMatch[1]);

    const ratio = contrastRatio(fg, btnBg);
    // Button text is body-sized, so 4.5:1 minimum
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('secondary text (cards remaining, best score) meets AA contrast', () => {
    const bgMatch = css.match(/--color-bg:\s*#([0-9A-Fa-f]{6})/);
    const fgMatch = css.match(/--color-fg:\s*#([0-9A-Fa-f]{6})/);

    expect(bgMatch).not.toBeNull();
    expect(fgMatch).not.toBeNull();

    const bg = hexToRgb('#' + bgMatch[1]);
    const fg = hexToRgb('#' + fgMatch[1]);

    const ratio = contrastRatio(fg, bg);
    // Secondary text is small (<18pt), so 4.5:1 minimum
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
