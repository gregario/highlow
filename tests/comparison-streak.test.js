import { describe, it, expect } from 'vitest';
import { createGame, compareCards } from '../game-engine.js';
import { makeCard } from './fixtures.js';

describe('AC-FA1-13: Higher guess correct when next card is higher', () => {
  it('current=5, next=9, guess higher → correct', () => {
    expect(compareCards(makeCard(5, 0), makeCard(9, 1), 'higher')).toBe('correct');
  });

  it('boundary: current=12 (Q), next=13 (K), guess higher → correct', () => {
    expect(compareCards(makeCard(12, 0), makeCard(13, 1), 'higher')).toBe('correct');
  });

  it('engine resolves correct higher guess: streak increments, state → playing', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(5, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'higher',
      streak: 3,
      deck: [makeCard(7, 2)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(4);
    expect(result.lastResult).toBe('correct');
  });
});

describe('AC-FA1-14: Lower guess correct when next card is lower', () => {
  it('current=9, next=5, guess lower → correct', () => {
    expect(compareCards(makeCard(9, 0), makeCard(5, 1), 'lower')).toBe('correct');
  });

  it('boundary: current=2, next=1 (A), guess lower → correct', () => {
    expect(compareCards(makeCard(2, 0), makeCard(1, 1), 'lower')).toBe('correct');
  });

  it('engine resolves correct lower guess: streak increments', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(5, 1),
      guessDirection: 'lower',
      streak: 2,
      deck: [makeCard(8, 3)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(3);
    expect(result.lastResult).toBe('correct');
  });
});

describe('AC-FA1-15: Higher guess wrong when next card is lower', () => {
  it('current=9, next=3, guess higher → wrong', () => {
    expect(compareCards(makeCard(9, 0), makeCard(3, 1), 'higher')).toBe('wrong');
  });

  it('engine transitions to game-over on wrong higher guess', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 4,
      deck: [makeCard(7, 2)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('game-over');
    expect(result.lastResult).toBe('wrong');
    expect(result.streak).toBe(4);
  });
});

describe('AC-FA1-16: Lower guess wrong when next card is higher', () => {
  it('current=3, next=9, guess lower → wrong', () => {
    expect(compareCards(makeCard(3, 0), makeCard(9, 1), 'lower')).toBe('wrong');
  });

  it('engine transitions to game-over on wrong lower guess', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'lower',
      streak: 1,
      deck: [makeCard(6, 2)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('game-over');
    expect(result.lastResult).toBe('wrong');
    expect(result.streak).toBe(1);
  });
});

describe('AC-FA1-17: Tie results in push regardless of guess direction', () => {
  it('current=7♥, next=7♠, guess higher → push, streak unchanged', () => {
    expect(compareCards(makeCard(7, 0), makeCard(7, 3), 'higher')).toBe('push');
  });

  it('current=7♥, next=7♠, guess lower → push, streak unchanged', () => {
    expect(compareCards(makeCard(7, 0), makeCard(7, 3), 'lower')).toBe('push');
  });

  it('engine: push with higher — streak unchanged, tied card consumed, new card drawn', () => {
    var engine = createGame();
    var deckCard = makeCard(10, 2);
    var state = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 5,
      deck: [deckCard],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(5);
    expect(result.lastResult).toBe('push');
    expect(result.currentCard.value).toBe(10);
    expect(result.deck.length).toBe(0);
  });

  it('engine: push with lower — streak unchanged', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'lower',
      streak: 2,
      deck: [makeCard(11, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(2);
    expect(result.lastResult).toBe('push');
  });
});

describe('AC-FA1-18: Streak increments only on correct guess', () => {
  it('3 correct guesses in sequence: streak goes 1, 2, 3', () => {
    var engine = createGame();

    var s1 = engine.resolveWith({
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(8, 1),
      guessDirection: 'higher',
      streak: 0,
      deck: [makeCard(5, 2), makeCard(12, 3), makeCard(2, 0)],
      cardsRemaining: 3,
    });
    expect(s1.streak).toBe(1);

    var s2 = engine.resolveWith({
      state: 'revealing',
      currentCard: s1.currentCard,
      nextCard: makeCard(12, 3),
      guessDirection: 'higher',
      streak: s1.streak,
      deck: [makeCard(2, 0)],
      cardsRemaining: 1,
    });
    expect(s2.streak).toBe(2);

    var s3 = engine.resolveWith({
      state: 'revealing',
      currentCard: s2.currentCard,
      nextCard: makeCard(13, 1),
      guessDirection: 'higher',
      streak: s2.streak,
      deck: [],
      cardsRemaining: 0,
    });
    expect(s3.streak).toBe(3);
  });

  it('streak does NOT increment on wrong guess', () => {
    var engine = createGame();
    var result = engine.resolveWith({
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 4,
      deck: [],
      cardsRemaining: 0,
    });
    expect(result.streak).toBe(4);
    expect(result.state).toBe('game-over');
  });

  it('streak does NOT increment on push', () => {
    var engine = createGame();
    var result = engine.resolveWith({
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 2),
      guessDirection: 'higher',
      streak: 4,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    });
    expect(result.streak).toBe(4);
    expect(result.lastResult).toBe('push');
  });
});

describe('AC-FA1-19: Streak resets on new game', () => {
  it('after game-over with streak 5, restart resets streak to 0', () => {
    var engine = createGame();
    var gameOver = {
      state: 'game-over',
      currentCard: makeCard(3, 1),
      nextCard: null,
      guessDirection: null,
      streak: 5,
      deck: [],
      cardsRemaining: 0,
    };
    var fresh = engine.restartWith(gameOver);
    expect(fresh.streak).toBe(0);
    expect(fresh.state).toBe('ready');
  });

  it('after deck-complete, restart resets streak to 0', () => {
    var engine = createGame();
    var deckComplete = {
      state: 'deck-complete',
      currentCard: makeCard(13, 0),
      nextCard: null,
      guessDirection: null,
      streak: 51,
      deck: [],
      cardsRemaining: 0,
    };
    var fresh = engine.restartWith(deckComplete);
    expect(fresh.streak).toBe(0);
    expect(fresh.state).toBe('ready');
    expect(fresh.deck.length).toBe(52);
  });
});

describe('AC-FA1-20: Cards remaining tracks deck depletion', () => {
  it('new game starts with 52 cards, startGame deals one leaving 51', () => {
    var g = createGame();
    expect(g.cardsRemaining).toBe(52);
    g = g.startGame();
    expect(g.cardsRemaining).toBe(51);
  });

  it('guess draws another card, decrementing cardsRemaining', () => {
    var g = createGame().startGame();
    expect(g.cardsRemaining).toBe(51);
    g = g.guess('higher');
    expect(g.cardsRemaining).toBe(50);
  });

  it('correct resolve does not consume extra cards', () => {
    var engine = createGame();
    var deck = [makeCard(5, 0), makeCard(10, 2)];
    var state = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(8, 1),
      guessDirection: 'higher',
      streak: 0,
      deck: deck,
      cardsRemaining: 2,
    };
    var result = engine.resolveWith(state);
    expect(result.cardsRemaining).toBe(2);
  });

  it('wrong resolve does not consume extra cards', () => {
    var engine = createGame();
    var deck = [makeCard(5, 0)];
    var state = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 2,
      deck: deck,
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.cardsRemaining).toBe(1);
  });

  it('push consumes the tied card — cardsRemaining decrements by 1', () => {
    var engine = createGame();
    var state = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 2,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(state);
    expect(result.cardsRemaining).toBe(0);
  });

  it('full sequence: start(52→51), guess(51→50), each consumed card decrements', () => {
    var g = createGame();
    expect(g.cardsRemaining).toBe(52);

    g = g.startGame();
    expect(g.cardsRemaining).toBe(51);

    g = g.guess('higher');
    expect(g.cardsRemaining).toBe(50);

    g = g.resolveWith(g);
    if (g.lastResult === 'push') {
      expect(g.cardsRemaining).toBe(49);
    } else {
      expect(g.cardsRemaining).toBe(50);
    }
  });
});

describe('AC-FA1-18/19/20: DOM structure for streak and cards-remaining', () => {
  var readFileSync, resolve, JSDOM, html, css;

  it('streak-display element exists and is accessible', async () => {
    var fs = await import('fs');
    var path = await import('path');
    var jsdom = await import('jsdom');
    html = fs.readFileSync(path.resolve(import.meta.dirname, '../index.html'), 'utf-8');
    var dom = new jsdom.JSDOM(html, { url: 'http://localhost' });
    var doc = dom.window.document;

    var streak = doc.querySelector('.streak-display');
    expect(streak).not.toBeNull();
    expect(streak.getAttribute('aria-label')).toBe('Current streak');
  });

  it('cards-remaining element exists and is accessible', async () => {
    var fs = await import('fs');
    var path = await import('path');
    var jsdom = await import('jsdom');
    html = fs.readFileSync(path.resolve(import.meta.dirname, '../index.html'), 'utf-8');
    var dom = new jsdom.JSDOM(html, { url: 'http://localhost' });
    var doc = dom.window.document;

    var remaining = doc.querySelector('.cards-remaining');
    expect(remaining).not.toBeNull();
    expect(remaining.getAttribute('aria-label')).toBe('Cards remaining');
  });

  it('streak-display is visible in playing state (CSS rule exists)', async () => {
    var fs = await import('fs');
    var path = await import('path');
    css = fs.readFileSync(path.resolve(import.meta.dirname, '../style.css'), 'utf-8');

    expect(css).toContain('.streak-display');
  });

  it('cards-remaining is visible in playing state (CSS rule exists)', async () => {
    var fs = await import('fs');
    var path = await import('path');
    css = fs.readFileSync(path.resolve(import.meta.dirname, '../style.css'), 'utf-8');

    expect(css).toContain('.cards-remaining');
  });

  it('sr-announcer exists for screen reader game state announcements', async () => {
    var fs = await import('fs');
    var path = await import('path');
    var jsdom = await import('jsdom');
    html = fs.readFileSync(path.resolve(import.meta.dirname, '../index.html'), 'utf-8');
    var dom = new jsdom.JSDOM(html, { url: 'http://localhost' });
    var doc = dom.window.document;

    var announcer = doc.querySelector('.sr-announcer');
    expect(announcer).not.toBeNull();
    expect(announcer.getAttribute('aria-live')).toBe('polite');
  });
});
