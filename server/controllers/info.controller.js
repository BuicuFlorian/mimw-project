const fs = require('fs');
const join = require('path').join;

/**
 * Class used to manage game information.
 *
 * @author Florian Buicu
 */
class InfoController {

  /**
  * Class constructor.
  */
  constructor() {
    this.gamePath = join(__dirname, '../config/game.json');
    this.gameInfo = this.getGameInfo();
  }

  /**
   * Get the maximum number of players.
   *
   * @returns {Number}
   */
  get maxPlayers() {
    return this.gameInfo['max_players'];
  }

	/**
   * Get player by the given ID.
   *
   * @param {String} playerId
   * @return {String}
   */
  getPlayerById(playerId) {
    let gameInfo = this.getGameInfo();
    const players = gameInfo.players;
    let player = '';

    for (let key in players) {
      if (players[key]['id'] === playerId) {
        player = key;

        break;
      }
    }

    return player;
  }

  /**
   * Get the active user.
   *
   * @return {String}
   */
  getActivePlayer() {
    const players = this.gameInfo.players;
    let activePlayer = '';

    for (let key in players) {
      if (players[key]['active'] === true) {
        activePlayer = JSON.stringify({
          id: players[key]['id'],
          name: key,
          color: players[key]['color']
        });

        break;
      }
    }

    return activePlayer;
  }

  /**
   * Get the color of the given player.
   *
   * @param {String} playerId
   * @return {String}
   */
  getPlayerColor(playerId) {
    const player = this.getPlayerById(playerId);
    const playerColor = this.gameInfo.players[player]['color'];

    return playerColor;
  }

  /**
   * Get the jokers of the given player.
   *
   * @param {String} playerId
   * @return {String}
   */
  getPlayerJokers(playerId) {
    const gameInfo = this.getGameInfo();
    const player = this.getPlayerById(playerId);
    const playerJokers = JSON.stringify(gameInfo.players[player]['jokers']);

    return playerJokers;
  }

  /**
   * Get all active players.
   *
   * @return {Object}
   */
  getPlayers() {
    const gameInfo = this.getGameInfo();
    let activePlayers = [];

    for (let key in gameInfo.players) {
      if (this.gameInfo.players[key]['id'] !== '' && gameInfo.players[key]['blocked'] === false && key !== 'total') {
        activePlayers.push(key);
      }
    }

    return activePlayers;
  }

  getGameStatus() {
    const players = this.gameInfo.players;
    const table = this.gameInfo.table;
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;
    let gameStatus = {};

    for (let key in players) {
      if (this.gameInfo.players[key]['id'] !== '' && key !== 'total') {
        gameStatus[key] = {};
        let color = players[key]['color'];
        let score = 0;

        for (let row = 0; row <= rowsLength; row++) {
          for (let col = 0; col <= colsLength; col++) {
            if (table[row][col] === color) {
              score += 1;
            }
          }
        }

        gameStatus[key]['score'] = score;
      }
    }

    gameStatus['winner'] = this.getTheWinner(gameStatus);

    return gameStatus;
  }

  /**
   * Get the player with highest score.
   *
   * @param {Object} scores
   * @return {String}
   */
  getTheWinner(scores) {
    let maxScore = 0;
    let winner = '';
    let equalScores = [];

    for (let player in scores) {
      if (scores[player]['score'] > maxScore) {
        maxScore = scores[player]['score'];
        winner = player;
      }

      if (scores[player]['score'] > maxScore) {
        if (!equalScores.includes(winner)) {
          equalScores.push(winner)
        }

        equalScores.push(player);
      }
    }

    if (equalScores.length > 0) {
      for (let candidate in equalScores) {
        if (this.gameInfo.players[winner]['active'] === true) {
          winner = candidate;
        }
      }
    }

    return this.gameInfo.players[winner]['color'];
  }

  /**
   * Get game information.
   *
   * @returns {Object}
   */
  getGameInfo() {
    try {
      const gameInfo = fs.readFileSync(this.gamePath, 'utf8');

      return JSON.parse(gameInfo);
    } catch (error) {
      console.log('Could not read the given file!');
      console.error(error);
    }
  }

  /**
   * Get total number of players.
   *
   * @returns {Number}
   */
  totalPlayers() {
    let gameInfo = this.getGameInfo();

    return gameInfo.players.total;
  }

  /**
   * Update game information.
   */
  updateGameInfo() {
    fs.writeFileSync(this.gamePath, JSON.stringify(this.gameInfo));
  }

  /**
   * Reset game configuration.
   */
  clearGameInfo() {
    this.gameInfo['game_id'] = '';
    this.clearPlayers();
    this.clearTable();
    this.updateGameInfo();
  }

  /**
   * Reset the players.
   */
  clearPlayers() {
    const players = Object.keys(this.gameInfo.players);

    players.forEach(key => {
      if (key !== 'total') {
        this.gameInfo.players[key]['id'] = '';
        this.gameInfo.players[key]['active'] = false;
        this.gameInfo.players[key]['blocked'] = false;
        this.gameInfo.players[key]['jokers'] = {
          'double_move': true,
          'replacement': true,
          'freedom': true
        }
      } else {
        this.gameInfo.players['total'] = 0;
        this.gameInfo.players['player_1']['active'] = true;
      }
    });
  }

  /**
  * Reset the table.
  */
  clearTable() {
    let table = this.gameInfo.table;
    const tableLength = table.length;

    for (let row = 0; row < tableLength; row++) {
      let rowLength = table[row].length;
      for (let col = 0; col < rowLength; col++) {
        table[row][col] = 0;
      }
    }
  }
}

/**
 * Exporting InfoController class.
 */
module.exports = InfoController;
