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

  if (ul.childNodes.length > 1) {
    for (let name in jokers) {
      if (jokers[name] === false) {
        let joker = document.getElementById(name);

        if (joker) {
          joker.remove();
        }
      }
    }
  }

  if (ul.childNodes.length === 1) {
    hideJokers();

    for (let name in jokers) {
      if (jokers[name] !== false) {
        let newList = document.createElement('li');
        newList.title = setJokerTitle(name);
        newList.id = name;
        newList.innerHTML = setJokerIcon(name)
        newList.classList = 'list-group-item pointer';

        newList.onclick = function () {
          selectJoker(this.id);
        }

        ul.appendChild(newList);
      }
    }
  }
}

/**
 * Set joker's icon.
 *
 * @param {String} name
 */
function setJokerIcon(name) {
  switch (name) {
    case 'double_move':
      return '<i class="fa fa-subscript fa-2x"></i>'
    case 'replacement':
      return '<i class="fa fa-cut fa-2x"></i>'
    case 'freedom':
      return '<i class="fa fa-twitter fa-2x"></i>'

    default:
      return 'Unknown joker';
  }
}

/**
 * Set joker's element title.
 *
 * @param {String} name
 */
function setJokerTitle(name) {
  switch (name) {
    case 'double_move':
      return 'Double move'
    case 'replacement':
      return 'Replacement '
    case 'freedom':
      return 'Freedom'

    default:
      return 'Unknown joker';
  }
}

/**
 * Hide jokers card.
 */
function hideJokers() {
  const jokers = document.getElementById('jokers-panel');


  if (jokers) {
    jokers.style = 'display: none;'
  }
}

/**
 * Display jokers.
 */
function showJokers() {
  const jokers = document.getElementById('jokers-panel');

  if (jokers) {
    jokers.style = 'display: block;'
  }
}

/**
 * Display the active player.
 *
 * @param {Object} activePlayer
 */
function setActivePlayer(activePlayer) {
  const activePlayerName = formatPlayerName(activePlayer.name);
  let text = '';
  activePlayer.id === storage['playerId']()
    ? text = `<span style="color: ${activePlayer.color}">It\'s your turn</span>`
    : text = `Active: <span style="color: ${activePlayer.color}">${activePlayerName}</span>`;

  document.getElementById('active-player').innerHTML = text;
}
