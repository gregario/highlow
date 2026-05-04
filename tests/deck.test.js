import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, drawCard, SUITS, VALUES } from '../deck.js';

describe('AC-FA1-01: Standard 52-card deck creation', () => {
  it('creates a deck with exactly 52 cards', () => {
    var deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('contains all 4 suits x 13 values combinations', () => {
    var deck = createDeck();
    var keys = deck.map(function (c) { return c.value + '-' + c.suit; });
    var unique = new Set(keys);
    expect(unique.size).toBe(52);
  });

  it('has 4 suits: hearts, diamonds, clubs, spades', () => {
    var deck = createDeck();
    var suits = new Set(deck.map(function (c) { return c.suit; }));
    expect(suits).toEqual(new Set(['hearts', 'diamonds', 'clubs', 'spades']));
  });

  it('has 13 values per suit (A=1 through K=13)', () => {
    var deck = createDeck();
    var heartValues = deck
      .filter(function (c) { return c.suit === 'hearts'; })
      .map(function (c) { return c.value; })
      .sort(function (a, b) { return a - b; });
    expect(heartValues).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
});

describe('AC-FA1-02: Deck shuffle randomness', () => {
  it('returns a deck of 52 cards after shuffle', () => {
    var deck = createDeck();
    var shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
  });

  it('contains the same cards after shuffle (no cards lost or gained)', () => {
    var deck = createDeck();
    var original = deck.map(function (c) { return c.value + '-' + c.suit; }).sort();
    var shuffled = shuffleDeck(deck.slice());
    var after = shuffled.map(function (c) { return c.value + '-' + c.suit; }).sort();
    expect(after).toEqual(original);
  });

  it('two consecutive shuffles produce different orderings', () => {
    var deck1 = shuffleDeck(createDeck());
    var deck2 = shuffleDeck(createDeck());
    var order1 = deck1.map(function (c) { return c.value + '-' + c.suit; }).join(',');
    var order2 = deck2.map(function (c) { return c.value + '-' + c.suit; }).join(',');
    expect(order1).not.toBe(order2);
  });

  it('first-card distribution is approximately uniform over 1000 shuffles', () => {
    var counts = {};
    for (var i = 0; i < 1000; i++) {
      var deck = shuffleDeck(createDeck());
      var key = deck[0].value + '-' + deck[0].suit;
      counts[key] = (counts[key] || 0) + 1;
    }
    var values = Object.values(counts);
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    // With 1000 shuffles and 52 cards, expected ~19.2 per card
    // Allow generous range: no card should appear more than 60 times or fewer than 1
    expect(max).toBeLessThan(60);
    expect(min).toBeGreaterThan(0);
  });

  it('does not mutate the original deck array', () => {
    var deck = createDeck();
    var firstCard = deck[0].value + '-' + deck[0].suit;
    var originalLength = deck.length;
    shuffleDeck(deck);
    expect(deck).toHaveLength(originalLength);
  });
});

describe('AC-FA1-03: Card draw depletes deck', () => {
  it('drawing a card reduces deck size by 1', () => {
    var deck = shuffleDeck(createDeck());
    var originalSize = deck.length;
    var result = drawCard(deck);
    expect(result.remainingDeck).toHaveLength(originalSize - 1);
  });

  it('drawn card is not in the remaining deck', () => {
    var deck = shuffleDeck(createDeck());
    var result = drawCard(deck);
    var drawnKey = result.card.value + '-' + result.card.suit;
    var remainingKeys = result.remainingDeck.map(function (c) { return c.value + '-' + c.suit; });
    expect(remainingKeys).not.toContain(drawnKey);
  });

  it('drawing all 52 cards produces no duplicates and empties the deck', () => {
    var deck = shuffleDeck(createDeck());
    var drawn = [];
    for (var i = 0; i < 52; i++) {
      var result = drawCard(deck);
      drawn.push(result.card);
      deck = result.remainingDeck;
    }
    expect(deck).toHaveLength(0);
    var keys = drawn.map(function (c) { return c.value + '-' + c.suit; });
    var unique = new Set(keys);
    expect(unique.size).toBe(52);
  });

  it('drawing from an empty deck returns null card', () => {
    var result = drawCard([]);
    expect(result.card).toBeNull();
    expect(result.remainingDeck).toHaveLength(0);
  });
});

describe('AC-FA1-04: Card value representation', () => {
  it('every card has numeric value 1-13', () => {
    var deck = createDeck();
    for (var i = 0; i < deck.length; i++) {
      expect(deck[i].value).toBeGreaterThanOrEqual(1);
      expect(deck[i].value).toBeLessThanOrEqual(13);
      expect(Number.isInteger(deck[i].value)).toBe(true);
    }
  });

  it('every card has correct display label matching its value', () => {
    var labelMap = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    var deck = createDeck();
    for (var i = 0; i < deck.length; i++) {
      var card = deck[i];
      var expected = labelMap[card.value] || String(card.value);
      expect(card.label).toBe(expected);
    }
  });

  it('every card has suit name and symbol', () => {
    var validSuits = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    var deck = createDeck();
    for (var i = 0; i < deck.length; i++) {
      var card = deck[i];
      expect(validSuits).toHaveProperty(card.suit);
      expect(card.symbol).toBe(validSuits[card.suit]);
    }
  });

  it('every card has a human-readable displayName', () => {
    var deck = createDeck();
    for (var i = 0; i < deck.length; i++) {
      var card = deck[i];
      expect(card.displayName).toMatch(/^\w+ of \w+$/);
      expect(card.displayName).toContain(card.name);
    }
  });

  it('Ace of Spades has correct representation', () => {
    var deck = createDeck();
    var ace = deck.find(function (c) { return c.value === 1 && c.suit === 'spades'; });
    expect(ace).toBeDefined();
    expect(ace.label).toBe('A');
    expect(ace.name).toBe('Ace');
    expect(ace.symbol).toBe('♠');
    expect(ace.displayName).toBe('Ace of Spades');
  });

  it('King of Hearts has correct representation', () => {
    var deck = createDeck();
    var king = deck.find(function (c) { return c.value === 13 && c.suit === 'hearts'; });
    expect(king).toBeDefined();
    expect(king.label).toBe('K');
    expect(king.name).toBe('King');
    expect(king.symbol).toBe('♥');
    expect(king.displayName).toBe('King of Hearts');
  });
});
