const fs = require('fs');
const join = require('path').join;

/**
 * Class used to manage the game.
 *
 * @author Florian Buicu
 */
class GameController {
  /**
   * Class constructor.
   */
  constructor() {
    this.gamePath = join(__dirname, '../config/game.json');
    this.gameInfo = this.getGameInfo();
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
    const playerColor = this.getPlayerColor(data.playerId);
    const position = JSON.parse(data.position);
    const row = position[0];
    const col = position[1];
    const isValidPosition = this.validatePosition(row, col, playerColor);

    if (isValidPosition) {
      this.gameInfo.table[row][col] = playerColor;

      const nextPlayer = this.activateNextPlayer(data.playerId);

      if (this.isBlocked(playerColor)) {
        const player = this.getPlayerById(data.playerId);
        this.gameInfo.players[player]['blocked'] = true;
      };

      this.updateGameInfo();

      let gameInfo = { table: this.gameInfo.table };

      if (this.getPlayers().length === 1) {
        gameInfo.gameOver = true
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
   * Reset the table.
   *
   * @returns {Void}
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

    this.updateGameInfo();
  }

  /**
   * Add a new player to the game.
   *
   * @param {String} playerId
   */
  addPlayer(playerId) {
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

    this.gameInfo.table[position[0]][position[1]] = playerColor;

    this.updateGameInfo();

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
        this.gameInfo.players[key]['active'] = 'false';
      } else {
        this.gameInfo.players[key] = 0;
      }
    });

    this.updateGameInfo();
  }

  /**
   * Get player by the given ID.
   *
   * @param {String} playerId
   * @return {String}
   */
  getPlayerById(playerId) {
    const players = this.gameInfo.players;
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
        activePlayer = players[key]['id'];

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
   * Mark the next player as active.
   *
   * @param {String} playerId
   * @returns {String}
   */
  activateNextPlayer(playerId) {
    let players = this.getPlayers();
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
   * Get all active players.
   *
   * @return {Object}
   */
  getPlayers() {
    let activePlayers = [];

    for (let key in this.gameInfo.players) {
      if (this.gameInfo.players[key]['id'] !== '' && this.gameInfo.players[key]['blocked'] === false && key !== 'total') {
        activePlayers.push(key);
      }
    }

    console.log(activePlayers);
    return activePlayers;
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
    this.clearPlayers();
    this.clearTable();
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
        if (! equalScores.includes(winner)) {
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
