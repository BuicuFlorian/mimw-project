/**
 * Data saved to the local storage.
 *
 * @type {Object}
 */
const storage = {
  playerId: () => localStorage.getItem(btoa('playerId')),
  playerColor: () => localStorage.getItem(btoa('playerColor')),
  activePlayer: () => JSON.parse(localStorage.getItem(btoa('activePlayer'))),
  table: () => JSON.parse(localStorage.getItem(btoa('table'))),
  watchMode: () => localStorage.getItem(btoa('watchMode')),
  totalPlayers: () => localStorage.getItem(btoa('totalPlayers')),
  gameId: () => localStorage.getItem(btoa('gameId')),
  jokers: () => JSON.parse(localStorage.getItem(btoa('jokers'))),
  selectedJoker: () => localStorage.getItem(btoa('selectedJoker'))
};
