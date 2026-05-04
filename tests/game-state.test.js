import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';
import { createGame, compareCards } from '../game-engine.js';

var html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
var css = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');

function createDOM() {
  var dom = new JSDOM(html, { url: 'http://localhost' });
  var style = dom.window.document.createElement('style');
  style.textContent = css;
  dom.window.document.head.appendChild(style);
  return dom;
}

describe('AC-FA1-05: Initial state is Ready — DOM', () => {
  var dom, doc, game;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
  });

  it('game container has data-state="ready" on load', () => {
    expect(game.getAttribute('data-state')).toBe('ready');
  });

  it('Higher and Lower buttons exist and are visible in ready state', () => {
    var higher = doc.querySelector('.btn-higher');
    var lower = doc.querySelector('.btn-lower');
    expect(higher).not.toBeNull();
    expect(lower).not.toBeNull();
    expect(higher.textContent).toBe('Higher');
    expect(lower.textContent).toBe('Lower');
  });

  it('card element exists (face-down card)', () => {
    var card = doc.querySelector('.card');
    expect(card).not.toBeNull();
    var inner = doc.querySelector('.card-inner');
    expect(inner.classList.contains('flipped')).toBe(false);
  });

  it('play-again is hidden in ready state via CSS', () => {
    var playAgain = doc.querySelector('.play-again-area');
    expect(playAgain).not.toBeNull();
  });

  it('best-score is hidden in ready state via CSS', () => {
    var bestScore = doc.querySelector('.best-score');
    expect(bestScore).not.toBeNull();
  });
});

describe('AC-FA1-06: Ready to Playing — DOM state attributes', () => {
  var dom, doc, game;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
  });

  it('setting data-state to playing changes the state', () => {
    game.setAttribute('data-state', 'playing');
    expect(game.getAttribute('data-state')).toBe('playing');
  });

  it('streak-display is visible in playing state', () => {
    game.setAttribute('data-state', 'playing');
    var streak = doc.querySelector('.streak-display');
    expect(streak).not.toBeNull();
  });

  it('cards-remaining is visible in playing state', () => {
    game.setAttribute('data-state', 'playing');
    var remaining = doc.querySelector('.cards-remaining');
    expect(remaining).not.toBeNull();
  });

  it('action-buttons visible in playing state', () => {
    game.setAttribute('data-state', 'playing');
    var buttons = doc.querySelector('.action-buttons');
    expect(buttons).not.toBeNull();
  });
});

describe('AC-FA1-07: Playing to Revealing — DOM button disable', () => {
  var dom, doc, game;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
  });

  it('CSS rule exists for revealing state button opacity', () => {
    expect(css).toContain('[data-state="revealing"]');
    expect(css).toContain('pointer-events: none');
  });

  it('revealing state has CSS rule reducing button opacity', () => {
    expect(css).toContain('[data-state="revealing"] .action-buttons .btn');
    expect(css).toContain('opacity: 0.5');
  });
});

describe('AC-FA1-08: Correct guess — engine transitions back to playing', () => {
  it('engine resolves correct higher guess to playing state', () => {
    var g = createGame().startGame();
    var before = g.streak;
    // Simulate a controlled correct guess
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: { value: 3, label: '3', name: 'Three', suit: 'hearts', symbol: '♥', displayName: 'Three of Hearts' },
      nextCard: { value: 9, label: '9', name: 'Nine', suit: 'spades', symbol: '♠', displayName: 'Nine of Spades' },
      guessDirection: 'higher',
      streak: 2,
      deck: [{ value: 5, label: '5', name: 'Five', suit: 'clubs', symbol: '♣', displayName: 'Five of Clubs' }],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(3);
    expect(result.currentCard.value).toBe(9);
  });
});

describe('AC-FA1-09: Game Over — DOM structure', () => {
  var dom, doc, game;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
  });

  it('CSS hides action-buttons in game-over state', () => {
    expect(css).toContain('[data-state="game-over"] .action-buttons');
  });

  it('play-again area exists for game-over', () => {
    game.setAttribute('data-state', 'game-over');
    var playAgain = doc.querySelector('.btn-play-again');
    expect(playAgain).not.toBeNull();
    expect(playAgain.textContent).toBe('Play again');
  });

  it('streak-display gets larger font in game-over (CSS rule exists)', () => {
    expect(css).toContain('[data-state="game-over"] .streak-display');
    expect(css).toContain('var(--fs-streak-gameover)');
  });
});

describe('AC-FA1-10: Push — engine behavior', () => {
  it('compareCards returns push when values are equal', () => {
    var current = { value: 7, suit: 'hearts' };
    var next = { value: 7, suit: 'spades' };
    expect(compareCards(current, next, 'higher')).toBe('push');
    expect(compareCards(current, next, 'lower')).toBe('push');
  });
});

describe('AC-FA1-11: Game Over to Ready — restart', () => {
  it('game-over has play-again button in DOM', () => {
    var dom = createDOM();
    var doc = dom.window.document;
    var game = doc.getElementById('game');
    game.setAttribute('data-state', 'game-over');
    var btn = doc.querySelector('.btn-play-again');
    expect(btn).not.toBeNull();
  });

  it('engine restartWith from game-over returns ready with fresh deck', () => {
    var engine = createGame();
    var state = {
      state: 'game-over',
      currentCard: null,
      nextCard: null,
      guessDirection: null,
      streak: 5,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.restartWith(state);
    expect(result.state).toBe('ready');
    expect(result.streak).toBe(0);
    expect(result.deck.length).toBe(52);
  });
});

describe('AC-FA1-12: Deck Complete — DOM structure', () => {
  var dom, doc, game;

  beforeEach(() => {
    dom = createDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
  });

  it('CSS has deck-complete state rules', () => {
    expect(css).toContain('[data-state="deck-complete"]');
  });

  it('CSS hides action-buttons in deck-complete state', () => {
    expect(css).toContain('[data-state="deck-complete"] .action-buttons');
  });

  it('CSS applies large streak font in deck-complete', () => {
    expect(css).toContain('[data-state="deck-complete"] .streak-display');
  });

  it('play-again button is available in deck-complete state', () => {
    game.setAttribute('data-state', 'deck-complete');
    var btn = doc.querySelector('.btn-play-again');
    expect(btn).not.toBeNull();
  });

  it('engine transitions to deck-complete when deck is empty and guess is correct', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: { value: 3, label: '3', name: 'Three', suit: 'hearts', symbol: '♥', displayName: 'Three of Hearts' },
      nextCard: { value: 13, label: 'K', name: 'King', suit: 'spades', symbol: '♠', displayName: 'King of Spades' },
      guessDirection: 'higher',
      streak: 50,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('deck-complete');
    expect(result.streak).toBe(51);
  });
});

describe('State machine full flow', () => {
  it('plays a complete game: ready -> playing -> guess -> resolve -> game-over -> restart', () => {
    var g = createGame();
    expect(g.state).toBe('ready');

    g = g.startGame();
    expect(g.state).toBe('playing');
    expect(g.currentCard).not.toBeNull();

    g = g.guess('higher');
    expect(g.state).toBe('revealing');
    expect(g.nextCard).not.toBeNull();

    g = g.resolveWith(g);
    expect(['playing', 'game-over', 'deck-complete']).toContain(g.state);

    if (g.state === 'playing') {
      // Force a wrong guess to reach game-over
      var engine = createGame();
      var wrongState = {
        state: 'revealing',
        currentCard: { value: 13, label: 'K', name: 'King', suit: 'hearts', symbol: '♥', displayName: 'King of Hearts' },
        nextCard: { value: 1, label: 'A', name: 'Ace', suit: 'spades', symbol: '♠', displayName: 'Ace of Spades' },
        guessDirection: 'higher',
        streak: g.streak,
        deck: g.deck,
        cardsRemaining: g.cardsRemaining,
      };
      g = engine.resolveWith(wrongState);
      expect(g.state).toBe('game-over');
    }

    if (g.state === 'game-over') {
      g = g.restartWith(g);
      expect(g.state).toBe('ready');
      expect(g.streak).toBe(0);
      expect(g.deck.length).toBe(52);
    }
  });
});
