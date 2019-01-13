/**
 * Data saved to the local storage.
 *
 * @type {Object}
 */
const storage = {
	playerId: () => localStorage.getItem(btoa('playerId')),
	playerColor: () => localStorage.getItem(btoa('playerColor')),
	activePlayer: () => localStorage.getItem(btoa('activePlayer')),
  table: () => localStorage.getItem(btoa('table')),
  watchMode: () => localStorage.getItem(btoa('watchMode'))
};
