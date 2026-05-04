'use strict';

(function () {
  var game = document.getElementById('game');
  if (!game) return;

  var els = {
    game: game,
    cardInner: game.querySelector('.card-inner'),
    cardFront: game.querySelector('.card-front'),
    cardBack: game.querySelector('.card-back'),
    streak: game.querySelector('.streak-display'),
    cardsRemaining: game.querySelector('.cards-remaining'),
    higherBtn: game.querySelector('.btn-higher'),
    lowerBtn: game.querySelector('.btn-lower'),
    playAgainBtn: game.querySelector('.btn-play-again'),
    bestScore: game.querySelector('.best-score'),
    announcer: game.querySelector('.sr-announcer'),
  };

  function getState() {
    return els.game.getAttribute('data-state');
  }

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
      // localStorage unavailable — graceful degradation
    }
  }

  function init() {
    setState('ready');
    announce('High Low. Press Higher or Lower to begin.');
  }

  init();
})();
