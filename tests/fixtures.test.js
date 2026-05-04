import { describe, it, expect } from 'vitest';
import { SUITS, VALUES, makeCard, makeDeck, sampleCards } from './fixtures.js';

describe('Test fixtures', () => {
  it('has 4 suits with names and symbols', () => {
    expect(SUITS).toHaveLength(4);
    for (const suit of SUITS) {
      expect(suit).toHaveProperty('name');
      expect(suit).toHaveProperty('symbol');
      expect(suit.symbol).toMatch(/[♥♦♣♠]/);
    }
  });

  it('has 13 values from Ace (1) to King (13)', () => {
    expect(VALUES).toHaveLength(13);
    expect(VALUES[0].value).toBe(1);
    expect(VALUES[0].label).toBe('A');
    expect(VALUES[12].value).toBe(13);
    expect(VALUES[12].label).toBe('K');
  });

  it('makeCard produces a valid card object', () => {
    const card = makeCard(7, 0);
    expect(card.value).toBe(7);
    expect(card.label).toBe('7');
    expect(card.name).toBe('Seven');
    expect(card.suit).toBe('hearts');
    expect(card.symbol).toBe('♥');
    expect(card.displayName).toBe('Seven of Hearts');
  });

  it('makeDeck produces 52 unique cards', () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(52);
    const keys = deck.map((c) => c.label + c.symbol);
    const unique = new Set(keys);
    expect(unique.size).toBe(52);
  });

  it('sampleCards are realistic and diverse', () => {
    expect(sampleCards.aceOfSpades.displayName).toBe('Ace of Spades');
    expect(sampleCards.sevenOfHearts.value).toBe(7);
    expect(sampleCards.kingOfDiamonds.label).toBe('K');
    expect(sampleCards.threeOfClubs.suit).toBe('clubs');
    expect(sampleCards.tenOfHearts.symbol).toBe('♥');
    expect(sampleCards.queenOfSpades.value).toBe(12);
  });

  it('all suits covered in sampleCards', () => {
    const suits = new Set(Object.values(sampleCards).map((c) => c.suit));
    expect(suits.size).toBe(4);
  });
});
