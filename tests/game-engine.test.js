import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, compareCards } from '../game-engine.js';
import { makeCard, makeDeck } from './fixtures.js';

describe('AC-FA1-05: Initial state is Ready', () => {
  it('game starts in ready state', () => {
    var g = createGame();
    expect(g.state).toBe('ready');
  });

  it('streak is 0 at start', () => {
    var g = createGame();
    expect(g.streak).toBe(0);
  });

  it('currentCard is null before first deal', () => {
    var g = createGame();
    expect(g.currentCard).toBeNull();
  });

  it('deck has 52 cards at start', () => {
    var g = createGame();
    expect(g.deck).toHaveLength(52);
  });

  it('cardsRemaining reflects deck size minus dealt cards', () => {
    var g = createGame();
    expect(g.cardsRemaining).toBe(52);
  });
});

describe('AC-FA1-06: Ready to Playing transition', () => {
  it('startGame transitions state from ready to playing', () => {
    var g = createGame();
    g = g.startGame();
    expect(g.state).toBe('playing');
  });

  it('startGame deals an initial card face-up', () => {
    var g = createGame();
    g = g.startGame();
    expect(g.currentCard).not.toBeNull();
    expect(g.currentCard.value).toBeGreaterThanOrEqual(1);
    expect(g.currentCard.value).toBeLessThanOrEqual(13);
  });

  it('startGame draws from the deck reducing remaining cards', () => {
    var g = createGame();
    g = g.startGame();
    expect(g.deck.length).toBe(51);
    expect(g.cardsRemaining).toBe(51);
  });

  it('startGame does nothing if already playing', () => {
    var g = createGame().startGame();
    var g2 = g.startGame();
    expect(g2.state).toBe('playing');
    expect(g2.deck.length).toBe(51);
  });
});

describe('AC-FA1-07: Playing to Revealing transition', () => {
  it('guess transitions state from playing to revealing', () => {
    var g = createGame().startGame();
    g = g.guess('higher');
    expect(g.state).toBe('revealing');
  });

  it('guess stores the guessDirection and nextCard', () => {
    var g = createGame().startGame();
    g = g.guess('higher');
    expect(g.guessDirection).toBe('higher');
    expect(g.nextCard).not.toBeNull();
  });

  it('guess draws a card from the deck', () => {
    var g = createGame().startGame();
    var deckBefore = g.deck.length;
    g = g.guess('higher');
    expect(g.deck.length).toBe(deckBefore - 1);
  });

  it('guess does nothing if state is not playing', () => {
    var g = createGame();
    var g2 = g.guess('higher');
    expect(g2.state).toBe('ready');
  });

  it('guess accepts lower direction', () => {
    var g = createGame().startGame();
    g = g.guess('lower');
    expect(g.guessDirection).toBe('lower');
    expect(g.state).toBe('revealing');
  });
});

describe('AC-FA1-08: Revealing to Playing on correct guess', () => {
  it('resolve returns to playing with incremented streak on correct guess', () => {
    var g = createGame();
    g = g.startGame();
    var currentVal = g.currentCard.value;
    g = g.guess(currentVal <= 6 ? 'higher' : 'lower');

    // Force a correct scenario: mock nextCard to be higher than currentCard
    var forced = {
      ...g,
      currentCard: makeCard(3, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'higher',
    };
    // Use createGame to get the resolve method
    var engine = createGame();
    var result = engine.resolveWith(forced);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(forced.streak + 1);
  });

  it('on correct, the nextCard becomes the new currentCard', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'higher',
      streak: 2,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(forced);
    expect(result.currentCard.value).toBe(9);
  });

  it('on correct, cardsRemaining stays consistent with deck length', () => {
    var deck = [makeCard(5, 0), makeCard(10, 2)];
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(8, 1),
      guessDirection: 'higher',
      streak: 0,
      deck: deck,
      cardsRemaining: deck.length,
    };
    var result = engine.resolveWith(forced);
    expect(result.cardsRemaining).toBe(deck.length);
  });
});

describe('AC-FA1-09: Revealing to Game Over on wrong guess', () => {
  it('resolve transitions to game-over on wrong guess', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 5,
      deck: [makeCard(7, 2)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.state).toBe('game-over');
  });

  it('streak is preserved (not reset) on game-over', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 5,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(forced);
    expect(result.streak).toBe(5);
  });

  it('the wrong nextCard becomes visible (currentCard shows the revealed card)', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(9, 0),
      nextCard: makeCard(3, 1),
      guessDirection: 'higher',
      streak: 2,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(forced);
    expect(result.currentCard.value).toBe(3);
  });
});

describe('AC-FA1-10: Revealing to Playing on tie (push)', () => {
  it('resolve returns to playing on push (equal values)', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 3,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.state).toBe('playing');
  });

  it('streak does NOT change on push', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 3,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.streak).toBe(3);
  });

  it('push also works with lower guess direction', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(5, 1),
      nextCard: makeCard(5, 2),
      guessDirection: 'lower',
      streak: 1,
      deck: [makeCard(8, 0)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(1);
  });

  it('on push, the tied card is discarded and next card from deck becomes current', () => {
    var engine = createGame();
    var deckCard = makeCard(10, 1);
    var forced = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 3,
      deck: [deckCard],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.currentCard.value).toBe(10);
    expect(result.deck.length).toBe(0);
  });

  it('cardsRemaining decrements by 1 on push (tied card consumed)', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'lower',
      streak: 2,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.cardsRemaining).toBe(0);
  });

  it('resolve returns push result type', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(7, 0),
      nextCard: makeCard(7, 3),
      guessDirection: 'higher',
      streak: 3,
      deck: [makeCard(10, 1)],
      cardsRemaining: 1,
    };
    var result = engine.resolveWith(forced);
    expect(result.lastResult).toBe('push');
  });
});

describe('AC-FA1-11: Game Over to Ready on restart', () => {
  it('restart from game-over creates fresh game in ready state', () => {
    var g = createGame();
    var forced = {
      state: 'game-over',
      currentCard: makeCard(3, 0),
      nextCard: null,
      guessDirection: null,
      streak: 5,
      deck: [],
      cardsRemaining: 0,
    };
    var result = g.restartWith(forced);
    expect(result.state).toBe('ready');
    expect(result.streak).toBe(0);
    expect(result.deck).toHaveLength(52);
    expect(result.currentCard).toBeNull();
  });

  it('restart resets with a new shuffled deck', () => {
    var g = createGame();
    var r1 = g.restartWith({ state: 'game-over', deck: [], streak: 0, currentCard: null, nextCard: null, guessDirection: null, cardsRemaining: 0 });
    var r2 = g.restartWith({ state: 'game-over', deck: [], streak: 0, currentCard: null, nextCard: null, guessDirection: null, cardsRemaining: 0 });
    var order1 = r1.deck.map(function (c) { return c.value + '-' + c.suit; }).join(',');
    var order2 = r2.deck.map(function (c) { return c.value + '-' + c.suit; }).join(',');
    // Two restarts should produce different deck orderings (with overwhelming probability)
    expect(order1).not.toBe(order2);
  });

  it('restart does nothing if not in game-over or deck-complete state', () => {
    var g = createGame();
    var forced = {
      state: 'playing',
      currentCard: makeCard(5, 0),
      nextCard: null,
      guessDirection: null,
      streak: 3,
      deck: [makeCard(8, 1)],
      cardsRemaining: 1,
    };
    var result = g.restartWith(forced);
    expect(result.state).toBe('playing');
    expect(result.streak).toBe(3);
  });
});

describe('AC-FA1-12: Deck Complete state', () => {
  it('transitions to deck-complete when last card is guessed correctly', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'higher',
      streak: 50,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(forced);
    expect(result.state).toBe('deck-complete');
    expect(result.streak).toBe(51);
  });

  it('deck-complete shows streak of 51', () => {
    var engine = createGame();
    var forced = {
      state: 'revealing',
      currentCard: makeCard(3, 0),
      nextCard: makeCard(9, 1),
      guessDirection: 'higher',
      streak: 50,
      deck: [],
      cardsRemaining: 0,
    };
    var result = engine.resolveWith(forced);
    expect(result.streak).toBe(51);
  });

  it('restart from deck-complete works', () => {
    var g = createGame();
    var forced = {
      state: 'deck-complete',
      currentCard: makeCard(13, 0),
      nextCard: null,
      guessDirection: null,
      streak: 51,
      deck: [],
      cardsRemaining: 0,
    };
    var result = g.restartWith(forced);
    expect(result.state).toBe('ready');
    expect(result.streak).toBe(0);
    expect(result.deck).toHaveLength(52);
  });
});

describe('compareCards — pure comparison logic', () => {
  it('returns correct when higher guess and next is higher', () => {
    expect(compareCards(makeCard(5, 0), makeCard(9, 1), 'higher')).toBe('correct');
  });

  it('returns correct when lower guess and next is lower', () => {
    expect(compareCards(makeCard(9, 0), makeCard(5, 1), 'lower')).toBe('correct');
  });

  it('returns wrong when higher guess and next is lower', () => {
    expect(compareCards(makeCard(9, 0), makeCard(3, 1), 'higher')).toBe('wrong');
  });

  it('returns wrong when lower guess and next is higher', () => {
    expect(compareCards(makeCard(3, 0), makeCard(9, 1), 'lower')).toBe('wrong');
  });

  it('returns push when values are equal regardless of direction', () => {
    expect(compareCards(makeCard(7, 0), makeCard(7, 3), 'higher')).toBe('push');
    expect(compareCards(makeCard(7, 0), makeCard(7, 3), 'lower')).toBe('push');
  });

  it('boundary: Ace (1) lower than King (13)', () => {
    expect(compareCards(makeCard(1, 0), makeCard(13, 1), 'higher')).toBe('correct');
    expect(compareCards(makeCard(13, 0), makeCard(1, 1), 'lower')).toBe('correct');
  });

  it('boundary: Queen (12) vs King (13)', () => {
    expect(compareCards(makeCard(12, 0), makeCard(13, 1), 'higher')).toBe('correct');
    expect(compareCards(makeCard(12, 0), makeCard(13, 1), 'lower')).toBe('wrong');
  });
});
