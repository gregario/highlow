'use strict';

import { createDeck, shuffleDeck, drawCard } from './deck.js';

function compareCards(current, next, direction) {
  if (current.value === next.value) return 'push';
  if (direction === 'higher') {
    return next.value > current.value ? 'correct' : 'wrong';
  }
  return next.value < current.value ? 'correct' : 'wrong';
}

function makeState(overrides) {
  return {
    state: 'ready',
    currentCard: null,
    nextCard: null,
    guessDirection: null,
    streak: 0,
    deck: [],
    cardsRemaining: 0,
    lastResult: null,
    ...overrides,
  };
}

function startGame() {
  if (this.state !== 'ready') return this;
  var result = drawCard(this.deck);
  return addMethods(makeState({
    state: 'playing',
    currentCard: result.card,
    deck: result.remainingDeck,
    cardsRemaining: result.remainingDeck.length,
  }));
}

function guess(direction) {
  if (this.state !== 'playing') return this;
  var result = drawCard(this.deck);
  return addMethods(makeState({
    state: 'revealing',
    currentCard: this.currentCard,
    nextCard: result.card,
    guessDirection: direction,
    streak: this.streak,
    deck: result.remainingDeck,
    cardsRemaining: result.remainingDeck.length,
  }));
}

function resolveWith(gameState) {
  if (gameState.state !== 'revealing') return addMethods(gameState);
  var result = compareCards(gameState.currentCard, gameState.nextCard, gameState.guessDirection);

  if (result === 'push') {
    var draw = drawCard(gameState.deck);
    return addMethods(makeState({
      state: 'playing',
      currentCard: draw.card || gameState.nextCard,
      deck: draw.card ? draw.remainingDeck : gameState.deck,
      cardsRemaining: draw.card ? draw.remainingDeck.length : gameState.cardsRemaining,
      streak: gameState.streak,
      lastResult: 'push',
    }));
  }

  if (result === 'correct') {
    var newStreak = gameState.streak + 1;
    var isDeckComplete = gameState.deck.length === 0;
    return addMethods(makeState({
      state: isDeckComplete ? 'deck-complete' : 'playing',
      currentCard: gameState.nextCard,
      streak: newStreak,
      deck: gameState.deck,
      cardsRemaining: gameState.deck.length,
      lastResult: 'correct',
    }));
  }

  return addMethods(makeState({
    state: 'game-over',
    currentCard: gameState.nextCard,
    streak: gameState.streak,
    deck: gameState.deck,
    cardsRemaining: gameState.deck.length,
    lastResult: 'wrong',
  }));
}

function restartWith(gameState) {
  if (gameState.state !== 'game-over' && gameState.state !== 'deck-complete') {
    return addMethods(gameState);
  }
  return createGame();
}

function addMethods(state) {
  state.startGame = startGame;
  state.guess = guess;
  state.resolveWith = resolveWith;
  state.restartWith = restartWith;
  return state;
}

function createGame() {
  var deck = shuffleDeck(createDeck());
  return addMethods(makeState({
    deck: deck,
    cardsRemaining: deck.length,
  }));
}

export { createGame, compareCards };
