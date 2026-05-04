import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

const root = resolve(__dirname, '..');

describe('f-scaffold: Framework initialized with correct config', () => {
  it('vitest.config.js exists and configures jsdom environment', () => {
    const config = readFileSync(resolve(root, 'vitest.config.js'), 'utf-8');
    expect(config).toContain("environment: 'jsdom'");
    expect(config).toContain('tests/**/*.test.js');
  });

  it('package.json has test script pointing to vitest', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    expect(pkg.scripts.test).toBe('vitest run');
  });

  it('package.json has dev script for local serving', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.dev).toContain('serve');
  });

  it('uses no framework (vanilla HTML/CSS/JS)', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    const frameworks = ['react', 'vue', 'svelte', 'next', 'angular', 'vite'];
    for (const fw of frameworks) {
      expect(allDeps).not.toHaveProperty(fw);
    }
  });
});

describe('f-scaffold: All dependencies installed', () => {
  it('node_modules directory exists', () => {
    expect(existsSync(resolve(root, 'node_modules'))).toBe(true);
  });

  it('vitest is importable', async () => {
    const vitest = await import('vitest');
    expect(vitest.describe).toBeDefined();
    expect(vitest.it).toBeDefined();
    expect(vitest.expect).toBeDefined();
  });

  it('jsdom is importable', async () => {
    const jsdom = await import('jsdom');
    expect(jsdom.JSDOM).toBeDefined();
  });
});

describe('f-scaffold: Dev server starts without errors (static files valid)', () => {
  it('index.html is valid HTML5 with DOCTYPE', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
    expect(html).toMatch(/^<!DOCTYPE html>/i);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
  });

  it('index.html parses without JSDOM errors', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
    const dom = new JSDOM(html);
    expect(dom.window.document.body).not.toBeNull();
    expect(dom.window.document.getElementById('game')).not.toBeNull();
  });

  it('style.css is loadable and non-empty', () => {
    const css = readFileSync(resolve(root, 'style.css'), 'utf-8');
    expect(css.length).toBeGreaterThan(100);
    expect(css).toContain(':root');
  });

  it('game.js is loadable and non-empty', () => {
    const js = readFileSync(resolve(root, 'game.js'), 'utf-8');
    expect(js.length).toBeGreaterThan(50);
    expect(js).toContain("'use strict'");
  });

  it('game.js initializes without throwing in jsdom', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
    const js = readFileSync(resolve(root, 'game.js'), 'utf-8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = js;
    expect(() => {
      dom.window.document.body.appendChild(scriptEl);
    }).not.toThrow();
    expect(dom.window.document.getElementById('game').getAttribute('data-state')).toBe('ready');
  });
});

describe('f-scaffold: Production build succeeds (static output valid)', () => {
  it('all production files exist at root (flat structure)', () => {
    const required = ['index.html', 'style.css', 'game.js', '.nojekyll'];
    for (const file of required) {
      expect(existsSync(resolve(root, file))).toBe(true);
    }
  });

  it('total source weight is under 100KB budget', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
    const css = readFileSync(resolve(root, 'style.css'), 'utf-8');
    const js = readFileSync(resolve(root, 'game.js'), 'utf-8');
    const totalBytes = Buffer.byteLength(html) + Buffer.byteLength(css) + Buffer.byteLength(js);
    expect(totalBytes).toBeLessThan(100 * 1024);
  });

  it('.gitignore excludes node_modules from deployment', () => {
    const gitignore = readFileSync(resolve(root, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('node_modules');
  });

  it('.nojekyll exists to prevent Jekyll processing on GitHub Pages', () => {
    expect(existsSync(resolve(root, '.nojekyll'))).toBe(true);
  });
});
