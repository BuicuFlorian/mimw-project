/**
 * Handles watch mode event.
 *
 * @param {Object} data
 */
function watchModeEventHandler(data) {
  hideButtons();
  setTitle('You are watching the game');

  localStorage.setItem(btoa('watchMode'), data.watchMode);
}

/**
 * Handles players event.
 *
 * @param {Object} data
 */
function playersEventHandler(data) {
  localStorage.setItem(btoa('totalPlayers'), data.players);
  document.getElementById('players').innerText = 'Total players: ' + data.players;

  if (storage['watchMode']() && storage['table']()) {
    showTable();
    setTitle('You are watching the game');
    hideButtons();
  }

  if (data.players === 1 && storage['playerId']()) {
    setTitle('Please wait until more players will join.');
  }

  if (data.players > 1) {
    setTitle('You can win this game');
    const hiddenJokers = document.getElementById('jokers-panel').style.display === 'none';

    if (hiddenJokers) {
      showJokers();
    }

    if (document.getElementById('active-player').innerHTML === '' && storage['activePlayer']() !== null) {
      setActivePlayer(storage['activePlayer']())
    }
  }
}

/**
 * Handles error event.
 *
 * @param {Object} data
 */
function errorEventHandler(data) {
  alert(data.error);
}

/**
 * Handles success event.
 *
 * @param {Object} data
 */
function successEventHandler(data) {
  alert(data.success);
}

/**
 * Handles player id event.
 *
 * @param {Object} data
 */
function playerIdEventHandler(data) {
  localStorage.setItem(btoa('playerId'), data.playerId);

  hideButtons();
}

/**
 * Handles table event.
 *
 * @param {Object} data
 */
function playerColorEventHandler(data) {
  localStorage.setItem(btoa('playerColor'), data.playerColor);
}

/**
 * Handles active player event.
 *
 * @param {Object} data
 */
function activePlayerEventHandler(data) {
  if (storage['playerId']() || storage['watchMode']()) {
    localStorage.setItem(btoa('activePlayer'), data.activePlayer);
    if (storage['totalPlayers']() > 1) {
      const activePlayer = JSON.parse(data.activePlayer);

      setActivePlayer(activePlayer);
    }
  }
}

/**
 * Handles table event.
 *
 * @param {Object} data
 */
function tableEventHandler(data) {
  if (!document.getElementsByClassName('table-responsive')[0]) {
    createTable(data.table);
  }

  localStorage.setItem(btoa('table'), JSON.stringify(data.table));

  showTable();
  colorTable(data.table);

  if (!storage['watchMode']()) {
    setTitle('You can win this game');
  }
}

/**
 * Handles game over event.
 *
 * @param {Object} data
 */
function gameOverEventHandler(data) {
  setTimeout(() => {
    localStorage.clear();
    location.reload();
  }, 10000)
}

/**
 * Handles game status event.
 *
 * @param {Object} data
 */
function gameStatusEventHandler(data) {
  const color = data.gameStatus.winner;
  setTitle(`The player with <b style="color: ${color}">${color}</b> color won the game!`);
}

/**
 * Handle jokers event.
 *
 * @param {Object} data
 */
function jokersEventHandler(data) {
  localStorage.setItem(btoa('jokers'), data.jokers);

  addJokers(JSON.parse(data.jokers));
}

/**
 * Handle game ID event.
 *
 * @param {Object} data
 */
function gameIdEventHandler(data) {
  if (!storage['gameId']() && data.gameId !== '') {
    localStorage.setItem(btoa('gameId'), data.gameId);
  }

  if (storage['gameId']() && storage['gameId']() !== data.gameId) {
    localStorage.clear();
    alert('Invalid game ID.');
    location.reload();
  }
}
