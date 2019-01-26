const InfoController = require('./info.controller.js');
const randomString = require('../utils/randomString');

/**
 * Class used to manage the game.
 *
 * @author Florian Buicu
 */
class GameController extends InfoController {
  /**
   * Class constructor.
   */
  constructor() {
    super();
  }

  get gameId() {
    return this.gameInfo.game_id;
  }

  /**
   * Get table configuration.
   *
   * @returns {Array}
   */
  getTable() {
    return this.gameInfo.table;
  }

  /**
   * Update the table.
   *
   * @param {Object} data
   * @returns {Array}
   */
  updateTable(data) {
    const playerColor = super.getPlayerColor(data.playerId);
    const position = JSON.parse(data.position);
    const row = position[0];
    const col = position[1];
    const isValidPosition = this.validatePosition(row, col, playerColor);

    if (isValidPosition) {
      this.gameInfo.table[row][col] = playerColor;

      const nextPlayer = this.activateNextPlayer(data.playerId);
      console.log('Blocked:', this.isBlocked(playerColor));
      if (this.isBlocked(playerColor)) {
        const player = super.getPlayerById(data.playerId);
        this.gameInfo.players[player]['blocked'] = true;
      };

      super.updateGameInfo();

      let gameInfo = { table: this.gameInfo.table };

      if (super.getPlayers().length === 1) {
        gameInfo.gameOver = true
        gameInfo.gameStatus = super.getGameStatus()

        setTimeout(() => {
          super.clearGameInfo();
        }, 2000)
      }

      return gameInfo;
    }

    throw new Error('Invalid position, try again!');
  }

  /**
   * Validate the given position.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {String} playerColor
   * @return {Boolean}
   */
  validatePosition(row, col, playerColor) {
    if (this.gameInfo.table[row][col] === 0) {
      return this.crossValidate(row, col, playerColor);
    }

    return false;
  }

  isBlocked(playerColor) {
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;
    let validPositions = [];

    for (let row = 0; row <= rowsLength; row++) {
      for (let col = 0; col <= colsLength; col++) {
        if (this.gameInfo.table[row][col] === playerColor) {
          if (this.crossValidate(row, col, 0) === true) {
            validPositions.push([row, col]);
          }
        }
      }
    }

    return validPositions.length === 0;
  }

  /**
   * Cross validate the given position.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {Number|String} criteria
   * @return {Boolean}
   */
  crossValidate(row, col, criteria) {
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;

    if ((col + 1) <= colsLength && this.gameInfo.table[row][col + 1] === criteria) {
      return true;
    } else if ((col - 1) >= 0  && this.gameInfo.table[row][col - 1] === criteria) {
      return true;
    } else if ((row + 1) <= rowsLength && this.gameInfo.table[row + 1][col] === criteria) {
      return true;
    } else if ((row - 1) >= 0 && this.gameInfo.table[row - 1][col] === criteria) {
      return true;
    }

    return false;
  }

  /**
   * Add a new player to the game.
   *
   * @param {String} playerId
   */
  async addPlayer(playerId) {
    const position = this.generateRandomPosition();
    const players = this.gameInfo.players;
    let playerColor = '';

    // If the position is not empty try again.
    if (this.gameInfo.table[position[0]][position[1]] !== 0) {
      return this.addPlayer(playerId);
    }

    for (let key in players) {
      if (players[key]['id'] === '') {
        playerColor = this.gameInfo.players[key]['color'];
        this.gameInfo.players[key]['id'] = playerId;
        this.gameInfo.players.total += 1;

        break;
      }
    }

    if (this.totalPlayers() === 1) {
      const gameId = await randomString(14);
      this.gameInfo['game_id'] = gameId;
    }

    this.gameInfo.table[position[0]][position[1]] = playerColor;

    super.updateGameInfo();

    return playerColor;
  }

  /**
   * Remove the given player from the game.
   *
   * @param {String} playerId
   */
  removePlayer(playerId) {
    const players = this.gameInfo.players;
    const key = Object.keys(players).find(key => players[key]['id'] === playerId);
    this.gameInfo.players[key]['id'] = '';
    this.gameInfo.players[key]['active'] = false;

    super.updateGameInfo();
  }

  /**
   * Mark the next player as active.
   *
   * @param {String} playerId
   * @returns {String}
   */
  activateNextPlayer(playerId) {
    let players = super.getPlayers();
    let playersLength = players.length - 1;
    let nextPlayer = '';

    players.forEach(player => {
      let playerStatus = this.gameInfo.players[player]['active'];
      if (this.gameInfo.players[player]['id'] === playerId && playerStatus !== false) {
        this.gameInfo.players[player]['active'] = false;
        let playerIndex = players.indexOf(player);

        if (playerIndex === playersLength) {
          this.gameInfo.players[players[0]]['active'] = true;
          nextPlayer = players[0];
        } else {
          this.gameInfo.players[players[playerIndex + 1]]['active'] = true;
          nextPlayer = players[playerIndex + 1];
        }
      }
    });

    return nextPlayer;
  }

  /**
   * Generate a random position on the table.
   *
   * @returns {Array}
   */
  generateRandomPosition() {
    const row = Math.floor(Math.random() * 6);
    const col = Math.floor(Math.random() * 10);

    return [row, col];
  }
}

/**
 * Exporting a single instance of GameController class.
 */
module.exports = new GameController();
