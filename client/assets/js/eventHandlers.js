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
	document.getElementById('players').innerText = 'Total players: ' + data.players;

  if (data.players < 2 || ! storage['playerId']()) {
    document.getElementsByClassName('table-responsive')[0].style.display = 'none';
  }

  if (storage['watchMode']() && storage['table']()) {
    showTable();
    setTitle('You are watching the game');
    hideButtons();
  }

  if (data.players === 1 && storage['playerId']()) {
    setTitle('Please wait until more players will join.');
  }

  if (data.players > 1 && storage['playerId']()) {
   setTitle('You can win this game')
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
  	let text = '';

  	localStorage.setItem(btoa('activePlayer'), data.activePlayer);

    data.activePlayer === storage['playerId']() ? text = 'Your move' : text = `Active player: ${data.activePlayer}`;

    document.getElementById('active-player').innerText = text;
  }
}

/**
 * Handles table event.
 *
 * @param {Object} data
 */
function tableEventHandler(data) {
  localStorage.setItem(btoa('table'), JSON.stringify(data.table));

  showTable();
  colorTable(data.table);

  if (! storage['watchMode']()) {
    setTitle('You can win this game');
  }
}

/**
 * Handles game over event.
 *
 * @param {Object} data
 */
function gameOverEventHandler(data) {
  setTitle('The game is over for you!');
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
