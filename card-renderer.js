'use strict';

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
    if (positions[i][1] > 2) {
      pip.classList.add('pip-inverted');
    }
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

export { renderCardFace };
