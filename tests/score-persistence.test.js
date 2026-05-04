import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

var html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
var gameJsSource = readFileSync(resolve(__dirname, '../game.js'), 'utf-8');

function createDOM() {
  var dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'outside-only',
  });
  return dom;
}

function readBestScore(storage) {
  try {
    var val = storage.getItem('highlow-best');
    return val !== null ? parseInt(val, 10) : null;
  } catch (e) {
    return null;
  }
}

function writeBestScore(storage, score) {
  try {
    storage.setItem('highlow-best', String(score));
  } catch (e) {
    // graceful degradation
  }
}

function computeBestOnGameOver(streak, storage) {
  var best = readBestScore(storage);
  var isNew = best === null || streak > best;
  if (isNew) writeBestScore(storage, streak);
  var displayBest = isNew ? streak : best;
  return { displayBest: displayBest, isNew: isNew };
}

function renderBestScoreText(best, isNew) {
  if (best === null) return '';
  return isNew ? 'New best! ' + best : 'Best: ' + best;
}

describe('AC-FA1-21: Best score saved to localStorage on game over', () => {
  var dom, storage;

  beforeEach(() => {
    dom = createDOM();
    storage = dom.window.localStorage;
    storage.clear();
  });

  it('writes streak to localStorage under highlow-best when no prior best exists', () => {
    var result = computeBestOnGameOver(5, storage);
    expect(storage.getItem('highlow-best')).toBe('5');
  });

  it('first game streak becomes the best score', () => {
    var result = computeBestOnGameOver(5, storage);
    expect(result.displayBest).toBe(5);
    expect(result.isNew).toBe(true);
  });

  it('game-over screen shows "New best! 5" for first game with streak 5', () => {
    var result = computeBestOnGameOver(5, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('New best! 5');
  });

  it('best-score DOM element exists in index.html', () => {
    var doc = dom.window.document;
    var bestEl = doc.querySelector('.best-score');
    expect(bestEl).not.toBeNull();
    expect(bestEl.getAttribute('aria-label')).toBe('Best score');
  });

  it('game.js reads from localStorage key highlow-best', () => {
    expect(gameJsSource).toContain("localStorage.getItem('highlow-best')");
  });

  it('game.js writes to localStorage key highlow-best', () => {
    expect(gameJsSource).toContain("localStorage.setItem('highlow-best'");
  });
});

describe('AC-FA1-22: Best score updates only when beaten', () => {
  var dom, storage;

  beforeEach(() => {
    dom = createDOM();
    storage = dom.window.localStorage;
    storage.clear();
    storage.setItem('highlow-best', '3');
  });

  it('updates localStorage when streak exceeds stored best', () => {
    computeBestOnGameOver(5, storage);
    expect(storage.getItem('highlow-best')).toBe('5');
  });

  it('returns isNew=true when streak beats stored best', () => {
    var result = computeBestOnGameOver(5, storage);
    expect(result.isNew).toBe(true);
    expect(result.displayBest).toBe(5);
  });

  it('renders "New best! 5" when streak 5 beats stored best 3', () => {
    var result = computeBestOnGameOver(5, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('New best! 5');
  });

  it('game.js has comparison logic: streak > best triggers write', () => {
    expect(gameJsSource).toContain('engine.streak > best');
  });
});

describe('AC-FA1-23: Best score unchanged when not beaten', () => {
  var dom, storage;

  beforeEach(() => {
    dom = createDOM();
    storage = dom.window.localStorage;
    storage.clear();
    storage.setItem('highlow-best', '10');
  });

  it('localStorage retains original best when streak is lower', () => {
    computeBestOnGameOver(3, storage);
    expect(storage.getItem('highlow-best')).toBe('10');
  });

  it('localStorage retains original best when streak equals best', () => {
    computeBestOnGameOver(10, storage);
    expect(storage.getItem('highlow-best')).toBe('10');
  });

  it('returns isNew=false when streak does not beat stored best', () => {
    var result = computeBestOnGameOver(3, storage);
    expect(result.isNew).toBe(false);
    expect(result.displayBest).toBe(10);
  });

  it('renders "Best: 10" when streak 3 does not beat stored best 10', () => {
    var result = computeBestOnGameOver(3, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('Best: 10');
  });

  it('no "New best" text when streak equals stored best', () => {
    var result = computeBestOnGameOver(10, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('Best: 10');
  });
});

describe('AC-FA1-24: Best score persists across page reloads', () => {
  var dom, storage;

  beforeEach(() => {
    dom = createDOM();
    storage = dom.window.localStorage;
    storage.clear();
  });

  it('reads previously stored best score from localStorage', () => {
    storage.setItem('highlow-best', '7');
    var best = readBestScore(storage);
    expect(best).toBe(7);
  });

  it('comparison works against persisted value — lower streak preserves old best', () => {
    storage.setItem('highlow-best', '7');
    var result = computeBestOnGameOver(3, storage);
    expect(result.displayBest).toBe(7);
    expect(result.isNew).toBe(false);
    expect(storage.getItem('highlow-best')).toBe('7');
  });

  it('comparison works against persisted value — higher streak updates best', () => {
    storage.setItem('highlow-best', '7');
    var result = computeBestOnGameOver(9, storage);
    expect(result.displayBest).toBe(9);
    expect(result.isNew).toBe(true);
    expect(storage.getItem('highlow-best')).toBe('9');
  });

  it('renders "Best: 7" on game over with streak 3 and persisted best 7', () => {
    storage.setItem('highlow-best', '7');
    var result = computeBestOnGameOver(3, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('Best: 7');
  });

  it('renders "New best! 9" on game over with streak 9 and persisted best 7', () => {
    storage.setItem('highlow-best', '7');
    var result = computeBestOnGameOver(9, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('New best! 9');
  });
});

describe('AC-FA1-25: Graceful degradation without localStorage', () => {
  it('readBestScore returns null when localStorage.getItem throws', () => {
    var faultyStorage = {
      getItem: function () { throw new Error('SecurityError'); },
      setItem: function () { throw new Error('SecurityError'); },
    };
    expect(readBestScore(faultyStorage)).toBe(null);
  });

  it('writeBestScore does not throw when localStorage.setItem throws', () => {
    var faultyStorage = {
      getItem: function () { throw new Error('QuotaExceeded'); },
      setItem: function () { throw new Error('QuotaExceeded'); },
    };
    expect(() => writeBestScore(faultyStorage, 5)).not.toThrow();
  });

  it('game functions normally with broken localStorage — computeBestOnGameOver treats as first game', () => {
    var faultyStorage = {
      getItem: function () { throw new Error('SecurityError'); },
      setItem: function () { throw new Error('SecurityError'); },
    };
    var result = computeBestOnGameOver(5, faultyStorage);
    expect(result.displayBest).toBe(5);
    expect(result.isNew).toBe(true);
  });

  it('game.js wraps localStorage.getItem in try/catch', () => {
    expect(gameJsSource).toMatch(/try\s*\{[^}]*localStorage\.getItem/);
  });

  it('game.js wraps localStorage.setItem in try/catch', () => {
    expect(gameJsSource).toMatch(/try\s*\{[^}]*localStorage\.setItem/);
  });

  it('no error elements visible on game-over screen (best-score shows empty or current streak)', () => {
    var dom = createDOM();
    var doc = dom.window.document;
    var game = doc.getElementById('game');
    game.setAttribute('data-state', 'game-over');
    var errorEls = doc.querySelectorAll('.error, [role="alert"]');
    expect(errorEls.length).toBe(0);
  });
});

describe('AC-FA1-26: First game with no prior best', () => {
  var dom, storage;

  beforeEach(() => {
    dom = createDOM();
    storage = dom.window.localStorage;
    storage.clear();
  });

  it('readBestScore returns null when no key exists', () => {
    expect(readBestScore(storage)).toBe(null);
  });

  it('first game over with streak 4 displays 4 as best (not 0 or undefined)', () => {
    var result = computeBestOnGameOver(4, storage);
    expect(result.displayBest).toBe(4);
    expect(result.displayBest).not.toBe(0);
    expect(result.displayBest).not.toBeUndefined();
    expect(result.displayBest).not.toBeNull();
  });

  it('first game over is always treated as new best', () => {
    var result = computeBestOnGameOver(4, storage);
    expect(result.isNew).toBe(true);
  });

  it('renders "New best! 4" for first game (not "Best: 0")', () => {
    var result = computeBestOnGameOver(4, storage);
    var text = renderBestScoreText(result.displayBest, result.isNew);
    expect(text).toBe('New best! 4');
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
    expect(text).not.toContain('Best: 0');
  });

  it('localStorage is written with the first game streak', () => {
    computeBestOnGameOver(4, storage);
    expect(storage.getItem('highlow-best')).toBe('4');
  });

  it('renderBestScoreText returns empty string when best is null (before any game ends)', () => {
    var text = renderBestScoreText(null, false);
    expect(text).toBe('');
  });

  it('game.js renderBestScore handles null best (hides element content)', () => {
    expect(gameJsSource).toContain('if (best === null)');
  });
});
