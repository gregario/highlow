'use strict';

import { createGame } from './game-engine.js';
import { renderCardFace } from './card-renderer.js';

(function () {
  var gameEl = document.getElementById('game');
  if (!gameEl) return;

  var els = {
    game: gameEl,
    cardInner: gameEl.querySelector('.card-inner'),
    cardFront: gameEl.querySelector('.card-front'),
    cardBack: gameEl.querySelector('.card-back'),
    streak: gameEl.querySelector('.streak-display'),
    cardsRemaining: gameEl.querySelector('.cards-remaining'),
    higherBtn: gameEl.querySelector('.btn-higher'),
    lowerBtn: gameEl.querySelector('.btn-lower'),
    playAgainBtn: gameEl.querySelector('.btn-play-again'),
    bestScore: gameEl.querySelector('.best-score'),
    announcer: gameEl.querySelector('.sr-announcer'),
  };

  var engine = createGame();

  function setState(state) {
    els.game.setAttribute('data-state', state);
  }

  function announce(message) {
    els.announcer.textContent = message;
  }

  function readBestScore() {
    try {
      var val = localStorage.getItem('highlow-best');
      return val !== null ? parseInt(val, 10) : null;
    } catch (e) {
      return null;
    }
  }

  function writeBestScore(score) {
    try {
      localStorage.setItem('highlow-best', String(score));
    } catch (e) {
      // graceful degradation
    }
  }

  function renderCard(card) {
    renderCardFace(els.cardFront, card);
  }

  function renderStreak(streak) {
    els.streak.textContent = streak > 0 ? streak : '';
  }

  function renderCardsRemaining(count) {
    els.cardsRemaining.textContent = count + ' cards left';
  }

  function renderBestScore(best, isNew) {
    if (best === null) {
      els.bestScore.textContent = '';
      return;
    }
    els.bestScore.textContent = isNew ? 'New best! ' + best : 'Best: ' + best;
  }

  function flipToFaceUp() {
    els.cardInner.classList.add('flipped');
  }

  function flipToFaceDown() {
    els.cardInner.classList.remove('flipped');
  }

  function render() {
    setState(engine.state);

    if (engine.state === 'ready') {
      flipToFaceDown();
      renderCard(null);
      renderStreak(0);
      renderCardsRemaining(engine.cardsRemaining);
      return;
    }

    if (engine.state === 'playing') {
      flipToFaceUp();
      renderCard(engine.currentCard);
      renderStreak(engine.streak);
      renderCardsRemaining(engine.cardsRemaining);
      return;
    }

    if (engine.state === 'revealing') {
      return;
    }

    if (engine.state === 'game-over' || engine.state === 'deck-complete') {
      flipToFaceUp();
      renderCard(engine.currentCard);
      renderStreak(engine.streak);
      var best = readBestScore();
      var isNew = best === null || engine.streak > best;
      if (isNew) writeBestScore(engine.streak);
      var displayBest = isNew ? engine.streak : best;
      renderBestScore(displayBest, isNew);
      return;
    }
  }

  function handleGuess(direction) {
    if (engine.state === 'ready') {
      engine = engine.startGame();
      render();
      announce(engine.currentCard.displayName + '. Higher or Lower?');

      setTimeout(function () {
        engine = engine.guess(direction);
        setState('revealing');
        renderCard(engine.nextCard);
        announce(
          engine.nextCard.displayName + '. You guessed ' + direction + '.'
        );

        setTimeout(function () {
          var prevEngine = engine;
          engine = engine.resolveWith(engine);
          render();

          if (engine.lastResult === 'correct') {
            announce('Correct! ' + prevEngine.nextCard.displayName + '. Streak: ' + engine.streak + '. Higher or Lower?');
          } else if (engine.lastResult === 'wrong') {
            announce('Wrong. ' + prevEngine.nextCard.displayName + '. Game over. Final streak: ' + engine.streak + '.');
          } else if (engine.lastResult === 'push') {
            announce('Push! ' + prevEngine.nextCard.displayName + '. Streak stays at ' + engine.streak + '. Higher or Lower?');
          }

          if (engine.state === 'deck-complete') {
            announce('Incredible! You guessed all 51 cards! Streak: 51.');
          }
        }, 400);
      }, 300);
      return;
    }

    if (engine.state !== 'playing') return;

    engine = engine.guess(direction);
    setState('revealing');

    setTimeout(function () {
      flipToFaceDown();

      setTimeout(function () {
        renderCard(engine.nextCard);
        flipToFaceUp();

        setTimeout(function () {
          var prevEngine = engine;
          engine = engine.resolveWith(engine);
          render();

          if (engine.lastResult === 'correct') {
            announce('Correct! ' + prevEngine.nextCard.displayName + '. Streak: ' + engine.streak + '. Higher or Lower?');
          } else if (engine.lastResult === 'wrong') {
            announce('Wrong. ' + prevEngine.nextCard.displayName + '. Game over. Final streak: ' + engine.streak + '.');
          } else if (engine.lastResult === 'push') {
            announce('Push! ' + prevEngine.nextCard.displayName + '. Streak stays at ' + engine.streak + '. Higher or Lower?');
          }

          if (engine.state === 'deck-complete') {
            announce('Incredible! You guessed all 51 cards! Streak: 51.');
          }
        }, 400);
      }, 50);
    }, 100);
  }

  function handlePlayAgain() {
    if (engine.state !== 'game-over' && engine.state !== 'deck-complete') return;
    engine = engine.restartWith(engine);
    render();
    announce('New game. Press Higher or Lower to begin.');
  }

  els.higherBtn.addEventListener('click', function () {
    handleGuess('higher');
  });

  els.lowerBtn.addEventListener('click', function () {
    handleGuess('lower');
  });

  els.playAgainBtn.addEventListener('click', handlePlayAgain);

  render();
  announce('High Low. Press Higher or Lower to begin.');
})();
