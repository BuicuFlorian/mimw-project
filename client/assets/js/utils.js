/**
 * Color the given table.
 *
 * @param {Array} table
 * @returns {Void}
 */
function colorTable(table) {
  const tableLength = table.length;

  for (let row = 0; row < tableLength; row++) {
    let rowLength = table[row].length;
    for (let col = 0; col < rowLength; col++) {
      if (table[row][col] !== 0) {
        let id = [row, col];
        document.getElementById(JSON.stringify(id)).style.background = table[row][col];
      }
    }
  }
}

/**
 * Get the position from the given element.
 *
 * @param {String} elementId
 * @return {Void}
 */
function getPosition(elementId) {
  const playerId = storage['playerId']();
  const activePlayer = storage['activePlayer']();

  if (playerId && playerId === activePlayer.id) {
    const moveInfo = {
      event: 'MOVE',
      playerId: localStorage.getItem(btoa('playerId')),
      position: elementId
    }

    if (storage['selectedJoker']()) {
      moveInfo.joker = storage['selectedJoker']();

      setTimeout(() => {
        localStorage.removeItem(btoa('selectedJoker'));
      }, 1000);
    }

    connection.send(JSON.stringify(moveInfo));
  }
}

/**
 * Hide the buttons.
 *
 * @return {Void}
 */
function hideButtons() {
  document.getElementById('buttons').style.display = 'none';
}

/**
 * Make the table visible.
 *
 * @return {Void}
 */
function showTable() {
  document.getElementsByClassName('table-responsive')[0].style.display = 'block';
}

/**
 * Set the title.
 *
 * @param {String} text
 * @returns {Void}
 */
function setTitle(text) {
  document.getElementById('title').innerHTML = text;
}

/**
 * Format the given name.
 *
 * @param {String} name
 * @return {String}
 */
function formatPlayerName(name) {
  let splitName = name.split('_');

  return `${splitName[0].charAt(0).toUpperCase()}${splitName[0].slice(1)} ${splitName[1]}`;
}

/**
 * Select the given joker.
 *
 * @param {String} name
 * @return {Void}
 */
function selectJoker(name) {
  if (storage['selectedJoker']()) {
    const selectedJoker = document.getElementById(storage['selectedJoker']());
    selectedJoker.style = '';
  }

  localStorage.setItem(btoa('selectedJoker'), name);

  const joker = document.getElementById(name);
  joker.style = 'color: white; background: orange;'
}

/**
 * Insert active jokers into the list.
 * 
 * @param {Object} jokers
 */
function addJokers(jokers) {
  const ul = document.getElementById('jokers');

  for (let name in jokers) {
    if (jokers[name] !== false) {
      let newList = document.createElement('li');
      newList.id = name;
      newList.innerText = name
      newList.classList = 'list-group-item pointer';

      newList.onclick = function () {
        selectJoker(this.id);
      }

      ul.appendChild(newList);
    }
  }
}

/**
 * Hide jokers card.
 */
function hideJokers() {
  const jokers = document.getElementById('jokers-panel');

  jokers.style = 'display: none;'
}