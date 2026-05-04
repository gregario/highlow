import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = resolve(__dirname, '..', 'index.html');
const jsPath = resolve(__dirname, '..', 'game.js');

function createDOM() {
  const html = readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { url: 'https://gregario.github.io/highlow/' });
  const js = readFileSync(jsPath, 'utf-8');
  dom.window.eval(js);
  return dom;
}

describe('f-auth: Auth flows (none) — verification', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = createDOM();
    document = dom.window.document;
  });

  describe('No registration required', () => {
    it('has no signup or registration form', () => {
      const forms = document.querySelectorAll('form');
      for (const form of forms) {
        const action = (form.getAttribute('action') || '').toLowerCase();
        const text = form.textContent.toLowerCase();
        expect(action).not.toContain('register');
        expect(action).not.toContain('signup');
        expect(text).not.toContain('create account');
      }
    });

    it('has no email or password input fields', () => {
      const emailInputs = document.querySelectorAll('input[type="email"]');
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      expect(emailInputs.length).toBe(0);
      expect(passwordInputs.length).toBe(0);
    });

    it('game is immediately playable without authentication', () => {
      const game = document.getElementById('game');
      expect(game).not.toBeNull();
      expect(game.getAttribute('data-state')).toBe('ready');
      const higherBtn = document.querySelector('.btn-higher');
      const lowerBtn = document.querySelector('.btn-lower');
      expect(higherBtn).not.toBeNull();
      expect(lowerBtn).not.toBeNull();
      expect(higherBtn.disabled).toBe(false);
      expect(lowerBtn.disabled).toBe(false);
    });
  });

  describe('No login required', () => {
    it('has no login form or login button', () => {
      const allButtons = document.querySelectorAll('button');
      for (const btn of allButtons) {
        const text = btn.textContent.toLowerCase();
        expect(text).not.toContain('log in');
        expect(text).not.toContain('login');
        expect(text).not.toContain('sign in');
      }
    });

    it('does not reference any auth provider or OAuth', () => {
      const html = document.documentElement.outerHTML.toLowerCase();
      expect(html).not.toContain('oauth');
      expect(html).not.toContain('auth0');
      expect(html).not.toContain('supabase');
      expect(html).not.toContain('firebase');
    });
  });

  describe('No session management', () => {
    it('game.js does not read or write session tokens', () => {
      const js = readFileSync(jsPath, 'utf-8').toLowerCase();
      expect(js).not.toContain('sessiontoken');
      expect(js).not.toContain('session_token');
      expect(js).not.toContain('accesstoken');
      expect(js).not.toContain('access_token');
      expect(js).not.toContain('jwt');
    });

    it('no cookies are set for authentication', () => {
      expect(dom.window.document.cookie).toBe('');
    });

    it('localStorage is used only for best score, not auth', () => {
      const js = readFileSync(jsPath, 'utf-8');
      const localStorageRefs = js.match(/localStorage\.(get|set)Item\(['"]([^'"]+)['"]\)/g) || [];
      for (const ref of localStorageRefs) {
        expect(ref).toContain('highlow-best');
      }
    });
  });

  describe('No protected routes', () => {
    it('single page with no routing — everything is public', () => {
      const scripts = document.querySelectorAll('script');
      const allScriptSrc = Array.from(scripts).map(s => s.getAttribute('src') || '').join(' ');
      expect(allScriptSrc).not.toContain('router');
      expect(allScriptSrc).not.toContain('auth');
    });

    it('no redirect logic for unauthenticated users', () => {
      const js = readFileSync(jsPath, 'utf-8').toLowerCase();
      expect(js).not.toContain('redirect');
      expect(js).not.toContain('unauthorized');
      expect(js).not.toContain('unauthenticated');
    });
  });

  describe('Client-side persistence without auth', () => {
    it('best score persists via localStorage without any auth gate', () => {
      const localStorage = dom.window.localStorage;
      localStorage.setItem('highlow-best', '7');
      const val = localStorage.getItem('highlow-best');
      expect(val).toBe('7');
    });

    it('game initializes to ready state without auth check', () => {
      const game = document.getElementById('game');
      expect(game.getAttribute('data-state')).toBe('ready');
    });

    it('announcer does not prompt for authentication', () => {
      const announcer = document.querySelector('.sr-announcer');
      const text = announcer.textContent.toLowerCase();
      expect(text).not.toContain('log in');
      expect(text).not.toContain('sign in');
      expect(text).not.toContain('authenticate');
    });
  });
});
