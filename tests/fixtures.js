export const SUITS = [
  { name: 'hearts', symbol: '♥' },
  { name: 'diamonds', symbol: '♦' },
  { name: 'clubs', symbol: '♣' },
  { name: 'spades', symbol: '♠' },
];

export const VALUES = [
  { value: 1, label: 'A', name: 'Ace' },
  { value: 2, label: '2', name: 'Two' },
  { value: 3, label: '3', name: 'Three' },
  { value: 4, label: '4', name: 'Four' },
  { value: 5, label: '5', name: 'Five' },
  { value: 6, label: '6', name: 'Six' },
  { value: 7, label: '7', name: 'Seven' },
  { value: 8, label: '8', name: 'Eight' },
  { value: 9, label: '9', name: 'Nine' },
  { value: 10, label: '10', name: 'Ten' },
  { value: 11, label: 'J', name: 'Jack' },
  { value: 12, label: 'Q', name: 'Queen' },
  { value: 13, label: 'K', name: 'King' },
];

export function makeCard(value, suitIndex) {
  var suit = SUITS[suitIndex];
  var val = VALUES[value - 1];
  return {
    value: val.value,
    label: val.label,
    name: val.name,
    suit: suit.name,
    symbol: suit.symbol,
    displayName: val.name + ' of ' + suit.name.charAt(0).toUpperCase() + suit.name.slice(1),
  };
}

export function makeDeck() {
  var deck = [];
  for (var s = 0; s < SUITS.length; s++) {
    for (var v = 0; v < VALUES.length; v++) {
      deck.push(makeCard(VALUES[v].value, s));
    }
  }
  return deck;
}

export var sampleCards = {
  aceOfSpades: makeCard(1, 3),
  sevenOfHearts: makeCard(7, 0),
  kingOfDiamonds: makeCard(13, 1),
  threeOfClubs: makeCard(3, 2),
  tenOfHearts: makeCard(10, 0),
  queenOfSpades: makeCard(12, 3),
};
