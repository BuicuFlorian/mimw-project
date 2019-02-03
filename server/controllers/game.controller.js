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
   * Update the game table.
   *
   * @param {Object} data
   * @returns {Array}
   */
  updateTable(data) {
    const player = super.getPlayerById(data.playerId);
    let joker = null;

    if (data.joker) {
      if (this.gameInfo.players[player]['jokers'][data.joker] === true) {
        joker = data.joker;
      } else {
        throw new Error('You already used that joker.');
      }
    }

    const playerColor = super.getPlayerColor(data.playerId);
    const position = JSON.parse(data.position);
    const row = position[0];
    const col = position[1];
    const isValidPosition = this.validatePosition(row, col, playerColor, joker);

    if (isValidPosition) {
      this.gameInfo.table[row][col] = playerColor;

      if (joker) {
        if (joker === 'double_move') {
          this.gameInfo.table[row][col] = 0;
          this.doubleMove(row, col, playerColor);
          this.gameInfo.table[row][col] = playerColor;
        }

        this.gameInfo.players[player]['jokers'][joker] = false;
      }

      if (this.isBlocked(playerColor, data.playerId)) {
        this.gameInfo.players[player]['blocked'] = true;
      };

      const nextPlayer = this.activateNextPlayer(data.playerId);

      if (this.isBlocked(this.gameInfo.players[nextPlayer]['color'], data.playerId)) {
        this.gameInfo.players[player]['blocked'] = true;
        if (super.getPlayers().length > 1) {
          super.updateGameInfo();
          data.playerId = this.gameInfo.players[nextPlayer]['id'];
          return this.updateTable(data);
        }
      }

      super.updateGameInfo();

      let gameInfo = { table: this.gameInfo.table };

      if (super.getPlayers().length === 1) {
        gameInfo.gameOver = true;
        gameInfo.gameStatus = super.getGameStatus();

        setTimeout(() => {
          super.clearGameInfo();
        }, 2000)
      }

      return gameInfo;
    }

    throw new Error('Invalid position, try again!');
  }

  /**
   * Color the missing cell when the player uses double_move joker.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {String} playerColor
   */
  doubleMove(row, col, playerColor) {
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;

    if ((col - 2) >= 0 && this.gameInfo.table[row][col - 2] === playerColor) {
      if (this.gameInfo.table[row][col - 1] !== 0) {
        throw new Error('Invalid position, try again!');
      }
      this.gameInfo.table[row][col - 1] = playerColor;
    } else if ((col + 2) <= colsLength && this.gameInfo.table[row][col + 2] === playerColor) {
      if (this.gameInfo.table[row][col + 1] !== 0) {
        throw new Error('Invalid position, try again!');
      }

      this.gameInfo.table[row][col + 1] = playerColor;
    } else if ((row - 2) >= 0 && this.gameInfo.table[row - 2][col] === playerColor) {
      if (this.gameInfo.table[row - 1][col] !== 0) {
        throw new Error('Invalid position, try again!');
      }

      this.gameInfo.table[row - 1][col] = playerColor;
    } else if ((row + 2) <= rowsLength && this.gameInfo.table[row + 2][col] === playerColor) {
      if (this.gameInfo.table[row + 1][col] !== 0) {
        throw new Error('Invalid position, try again!');
      }

      this.gameInfo.table[row + 1][col] = playerColor;
    }
  }

  /**
   * Validate the given position.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {String} playerColor
   * @param {String} joker
   * @return {Boolean}
   */
  validatePosition(row, col, playerColor, joker) {
    if (joker) {
      return this.validateJokerMove(row, col, playerColor, joker);
    }

    if (this.gameInfo.table[row][col] === 0) {
      return this.crossValidate(row, col, playerColor, 1);
    }

    return false;
  }

  /**
   * Validate the move when the player uses a joker.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {String} playerColor
   * @param {String} joker
   * @returns {Boolean}
   */
  validateJokerMove(row, col, playerColor, joker) {
    if (joker === 'double_move' && this.gameInfo.table[row][col] === 0) {
      return this.crossValidate(row, col, playerColor, 2);
    }

    if (joker === 'replacement' && this.gameInfo.table[row][col] !== playerColor) {
      return this.crossValidate(row, col, playerColor, 1);
    }

    if (joker === 'freedom' && this.gameInfo.table[row][col] === 0) {
      return true;
    }

    return false;
  }

  /**
   * Check and see if the given player is blocked.
   *
   * @param {String} playerColor
   * @param {String} playerId
   * @returns {Boolean}
   */
  isBlocked(playerColor, playerId) {
    const jokers = super.getPlayerJokers(playerId);
    const validJokers = this.validateJokers(JSON.parse(jokers));
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;
    let validPositions = [];

    for (let row = 0; row <= rowsLength; row++) {
      for (let col = 0; col <= colsLength; col++) {
        if (validJokers.includes('freedom') || validJokers.includes('replacement')) {
          if (validJokers.includes('freedom')
            && this.gameInfo.table[row][col] === 0) {
            validPositions.push([row, col]);
          } else if (validJokers.includes('replacement')
            && this.gameInfo.table[row][col] !== playerColor) {
            if (this.crossValidate(row, col, playerColor, 1) === true) {
              validPositions.push([row, col]);
            }
          }
        } else {
          if (this.gameInfo.table[row][col] === playerColor) {
            if (this.crossValidate(row, col, 0, 1) === true) {
              validPositions.push([row, col]);
            }
          }
        }
      }
    }

    return validPositions.length === 0;
  }

  /**
   * Validate the given jokers.
   *
   * @param {Object} jokers
   * @return {Array}
   */
  validateJokers(jokers) {
    let validJokers = [];

    for (let joker in jokers) {
      if (jokers[joker] === true) {
        validJokers.push(joker)
      }
    }

    return validJokers;
  }

  /**
   * Cross validate the given position.
   *
   * @param {Number} row
   * @param {Number} col
   * @param {Number|String} criteria
   * @param {Number} size
   * @return {Boolean}
   */
  crossValidate(row, col, criteria, size) {
    const rowsLength = this.gameInfo.table.length - 1;
    const colsLength = this.gameInfo.table[0].length - 1;

    if ((col + size) <= colsLength && this.gameInfo.table[row][col + size] === criteria) {
      return true;
    } else if ((col - size) >= 0 && this.gameInfo.table[row][col - size] === criteria) {
      return true;
    } else if ((row + size) <= rowsLength && this.gameInfo.table[row + size][col] === criteria) {
      return true;
    } else if ((row - size) >= 0 && this.gameInfo.table[row - size][col] === criteria) {
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
