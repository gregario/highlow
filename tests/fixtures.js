export { SUITS, VALUES, makeCard, createDeck as makeDeck } from '../deck.js';
import { makeCard } from '../deck.js';

export var sampleCards = {
  aceOfSpades: makeCard(1, 3),
  sevenOfHearts: makeCard(7, 0),
  kingOfDiamonds: makeCard(13, 1),
  threeOfClubs: makeCard(3, 2),
  tenOfHearts: makeCard(10, 0),
  queenOfSpades: makeCard(12, 3),
};
