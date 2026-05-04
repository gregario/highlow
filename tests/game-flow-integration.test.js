import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

var html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
var css = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');
var gameJs = readFileSync(resolve(__dirname, '../game.js'), 'utf-8');
var gameEngineJs = readFileSync(resolve(__dirname, '../game-engine.js'), 'utf-8');
var deckJs = readFileSync(resolve(__dirname, '../deck.js'), 'utf-8');
var cardRendererJs = readFileSync(resolve(__dirname, '../card-renderer.js'), 'utf-8');

function createLiveDOM() {
  var dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });

  var style = dom.window.document.createElement('style');
  style.textContent = css;
  dom.window.document.head.appendChild(style);

  // Inject modules as inline scripts since JSDOM doesn't support ES module imports
  // Combine all modules into a single script that executes in order
  var combinedScript = `
    'use strict';

    // === deck.js ===
    var SUITS = ${JSON.stringify([
      { name: 'hearts', symbol: '♥' },
      { name: 'diamonds', symbol: '♦' },
      { name: 'clubs', symbol: '♣' },
      { name: 'spades', symbol: '♠' },
    ])};

    var VALUES = ${JSON.stringify([
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
    ])};

    function makeCard(value, suitIndex) {
      var suit = SUITS[suitIndex];
      var val = VALUES[value - 1];
      return {
        value: val.value, label: val.label, name: val.name,
        suit: suit.name, symbol: suit.symbol,
        displayName: val.name + ' of ' + suit.name.charAt(0).toUpperCase() + suit.name.slice(1),
      };
    }

    function createDeck() {
      var deck = [];
      for (var s = 0; s < SUITS.length; s++) {
        for (var v = 0; v < VALUES.length; v++) {
          deck.push(makeCard(VALUES[v].value, s));
        }
      }
      return deck;
    }

    function shuffleDeck(deck) {
      var shuffled = deck.slice();
      for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
      return shuffled;
    }

    function drawCard(deck) {
      if (deck.length === 0) return { card: null, remainingDeck: [] };
      return { card: deck[0], remainingDeck: deck.slice(1) };
    }

    // === game-engine.js ===
    function compareCards(current, next, direction) {
      if (current.value === next.value) return 'push';
      if (direction === 'higher') return next.value > current.value ? 'correct' : 'wrong';
      return next.value < current.value ? 'correct' : 'wrong';
    }

    function makeState(overrides) {
      return {
        state: 'ready', currentCard: null, nextCard: null, guessDirection: null,
        streak: 0, deck: [], cardsRemaining: 0, lastResult: null, ...overrides,
      };
    }

    function startGame() {
      if (this.state !== 'ready') return this;
      var result = drawCard(this.deck);
      return addMethods(makeState({
        state: 'playing', currentCard: result.card,
        deck: result.remainingDeck, cardsRemaining: result.remainingDeck.length,
      }));
    }

    function guess(direction) {
      if (this.state !== 'playing') return this;
      var result = drawCard(this.deck);
      return addMethods(makeState({
        state: 'revealing', currentCard: this.currentCard,
        nextCard: result.card, guessDirection: direction,
        streak: this.streak, deck: result.remainingDeck, cardsRemaining: result.remainingDeck.length,
      }));
    }

    function resolveWith(gameState) {
      if (gameState.state !== 'revealing') return addMethods(gameState);
      var result = compareCards(gameState.currentCard, gameState.nextCard, gameState.guessDirection);
      if (result === 'push') {
        var draw = drawCard(gameState.deck);
        return addMethods(makeState({
          state: 'playing', currentCard: draw.card || gameState.nextCard,
          deck: draw.card ? draw.remainingDeck : gameState.deck,
          cardsRemaining: draw.card ? draw.remainingDeck.length : gameState.cardsRemaining,
          streak: gameState.streak, lastResult: 'push',
        }));
      }
      if (result === 'correct') {
        var newStreak = gameState.streak + 1;
        var isDeckComplete = gameState.deck.length === 0;
        return addMethods(makeState({
          state: isDeckComplete ? 'deck-complete' : 'playing',
          currentCard: gameState.nextCard, streak: newStreak,
          deck: gameState.deck, cardsRemaining: gameState.deck.length, lastResult: 'correct',
        }));
      }
      return addMethods(makeState({
        state: 'game-over', currentCard: gameState.nextCard,
        streak: gameState.streak, deck: gameState.deck,
        cardsRemaining: gameState.deck.length, lastResult: 'wrong',
      }));
    }

    function restartWith(gameState) {
      if (gameState.state !== 'game-over' && gameState.state !== 'deck-complete') return addMethods(gameState);
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
      return addMethods(makeState({ deck: deck, cardsRemaining: deck.length }));
    }

    // === card-renderer.js ===
    var PIP_POSITIONS = {
      2: [[0, 0], [0, 4]],
      3: [[0, 0], [0, 2], [0, 4]],
      4: [[0, 0], [2, 0], [0, 4], [2, 4]],
      5: [[0, 0], [2, 0], [1, 2], [0, 4], [2, 4]],
      6: [[0, 0], [2, 0], [0, 2], [2, 2], [0, 4], [2, 4]],
      7: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [0, 4], [2, 4]],
      8: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [1, 3], [0, 4], [2, 4]],
      9: [[0, 0], [2, 0], [0, 1], [2, 1], [1, 2], [0, 3], [2, 3], [0, 4], [2, 4]],
      10: [[0, 0], [2, 0], [1, 0.5], [0, 1], [2, 1], [0, 3], [2, 3], [1, 3.5], [0, 4], [2, 4]],
    };

    function createEl(tag, className, text) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    }

    function renderCorner(label, symbol, position) {
      var corner = createEl('div', 'card-corner card-corner-' + position);
      corner.appendChild(createEl('div', 'card-corner-value', label));
      corner.appendChild(createEl('div', 'card-corner-suit', symbol));
      return corner;
    }

    function renderPips(count, symbol) {
      var grid = createEl('div', 'pip-grid');
      var positions = PIP_POSITIONS[count];
      if (!positions) return grid;
      for (var i = 0; i < positions.length; i++) {
        var pip = createEl('span', 'pip', symbol);
        pip.style.gridColumn = String(positions[i][0] + 1);
        pip.style.gridRow = String(Math.round(positions[i][1] * 2 + 1));
        if (positions[i][1] > 2) pip.classList.add('pip-inverted');
        grid.appendChild(pip);
      }
      return grid;
    }

    function renderCardFace(el, card) {
      el.innerHTML = '';
      el.removeAttribute('data-suit-color');
      if (!card) return;
      var suitColor = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'dark';
      el.setAttribute('data-suit-color', suitColor);
      el.style.color = 'var(--color-suit-' + suitColor + ')';
      el.appendChild(renderCorner(card.label, card.symbol, 'tl'));
      el.appendChild(renderCorner(card.label, card.symbol, 'br'));
      var isNumber = card.value >= 2 && card.value <= 10;
      var isFaceCard = card.value >= 11 && card.value <= 13;
      var isAce = card.value === 1;
      if (isNumber) {
        el.appendChild(renderPips(card.value, card.symbol));
      } else if (isFaceCard) {
        el.appendChild(createEl('div', 'card-value', card.label));
        el.appendChild(createEl('div', 'card-suit', card.symbol));
      } else if (isAce) {
        el.appendChild(createEl('div', 'card-value', card.label));
        el.appendChild(createEl('div', 'card-suit', card.symbol));
        el.appendChild(createEl('div', 'card-center-suit', card.symbol));
      }
    }
  `;

  var scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = combinedScript;
  dom.window.document.head.appendChild(scriptEl);

  return dom;
}

function injectGameJs(dom, gameJsSource) {
  // Strip import/export and adapt to global scope
  var adapted = gameJsSource
    .replace(/import\s*\{[^}]*\}\s*from\s*'[^']*';\s*/g, '')
    .replace(/export\s*\{[^}]*\};?\s*/g, '');

  var scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = adapted;
  dom.window.document.body.appendChild(scriptEl);
  return dom;
}

describe('AC-FA1-08: Multi-turn game flow — first guess from ready state resolves', () => {
  var dom, doc, game;

  beforeEach(() => {
    vi.useFakeTimers();
    dom = createLiveDOM();
    doc = dom.window.document;
    game = doc.getElementById('game');
    injectGameJs(dom, gameJs);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('game resolves out of revealing state after first Higher click', () => {
    expect(game.getAttribute('data-state')).toBe('ready');

    // Click Higher — starts game from ready
    doc.querySelector('.btn-higher').click();

    // After 300ms the ready→playing path calls guess() and sets revealing
    vi.advanceTimersByTime(300);
    // The resolveAfterDelay should then kick in
    // Advance enough for all nested timeouts (100 + 50 + 400 = 550)
    vi.advanceTimersByTime(600);

    var state = game.getAttribute('data-state');
    expect(state).not.toBe('revealing');
    expect(['playing', 'game-over', 'deck-complete']).toContain(state);
  });

  it('game resolves out of revealing state after second guess from playing state', () => {
    expect(game.getAttribute('data-state')).toBe('ready');

    // First click — starts game from ready
    doc.querySelector('.btn-higher').click();
    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(600);

    // Only proceed if we got to playing
    var afterFirst = game.getAttribute('data-state');
    if (afterFirst !== 'playing') return;

    // Second click — guess from playing state
    doc.querySelector('.btn-higher').click();
    vi.advanceTimersByTime(100 + 50 + 400 + 100);

    var state = game.getAttribute('data-state');
    expect(state).not.toBe('revealing');
    expect(['playing', 'game-over', 'deck-complete']).toContain(state);
  });
});

describe('REGRESSION: ready-state-guess — resolveAfterDelay must be defined', () => {
  it('game.js source does not reference undefined resolveAfterDelay function', () => {
    // If resolveAfterDelay is called, it must be defined in the same scope
    var callsResolveAfterDelay = /resolveAfterDelay\s*\(/.test(gameJs);
    var definesResolveAfterDelay = /function\s+resolveAfterDelay/.test(gameJs);
    var assignsResolveAfterDelay = /resolveAfterDelay\s*=/.test(gameJs);

    if (callsResolveAfterDelay) {
      expect(definesResolveAfterDelay || assignsResolveAfterDelay).toBe(true);
    }
  });

  it('ready-state guess path uses the same resolve pattern as playing-state path', () => {
    // The handleGuess function for the ready state must resolve the revealing state
    // by calling engine.resolveWith, just like the playing state path does
    var readyBlock = gameJs.slice(
      gameJs.indexOf("if (engine.state === 'ready')"),
      gameJs.indexOf("if (engine.state !== 'playing')")
    );
    expect(readyBlock).toContain('resolveWith');
  });
});
