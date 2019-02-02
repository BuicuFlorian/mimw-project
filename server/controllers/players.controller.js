const gameController = require('./game.controller');
const InfoController = require('./info.controller');
const randomString = require('../utils/randomString');

/**
 * Class used to manage the users.
 *
 * @author Florian Buicu
 */
class PlayersController {
  /**
   * Class constructor.
   *
   * @param {WebSocket.Server} webSocketServer
   * @param {WebSocket} webSocket
   */
  constructor(webSocketServer, webSocket) {
    this.webSocketServer = webSocketServer;
    this.webSocket = webSocket;
    this.infoController = new InfoController();
  }

  /**
   * Add a new player to the game.
   *
   * @returns {Void}
   */
  async joinGame() {
    const totalPlayers = this.players;

    try {
      if (totalPlayers + 1 <= this.infoController.maxPlayers) {
        const playerId = await randomString(7);
        const playerColor = await gameController.addPlayer(playerId);

        this.webSocket.send(JSON.stringify({
          success: 'Welcome',
          playerId,
          playerColor,
          jokers: this.infoController.getPlayerJokers(playerId)
        }));

        if (totalPlayers + 1 === 1) {
          this.webSocket.send(JSON.stringify({
            message: 'Please wait until more players will join.',
          }));
        }

        if (totalPlayers + 1 >= 2) {
          this.webSocketServer.broadcast(JSON.stringify({
            table: gameController.getTable(),
            activePlayer: gameController.getActivePlayer()
          }));
        }

        this.webSocketServer.broadcast(JSON.stringify({
          players: totalPlayers + 1
        }));
      } else {
        this.webSocket.send(JSON.stringify({ error: 'No room!' }));
      }
    } catch (error) {
      console.error('Could not join the game!');
      console.error(error);
    }
  }

  /**
   * Remove a player from the game.
   */
  leaveGame() {

  }

  /**
   * Add a new game watcher.
   *
   * @returns {Void}
   */
  watchGame() {
    if (this.players > 0) {
      const table = gameController.getTable();

      this.webSocket.send(JSON.stringify({
        watchMode: true,
        table
      }));
    } else {
      this.webSocket.send(JSON.stringify({ error: 'Noone is playing right now.' }));
    }
  }

  /**
   * Update the game table.
   *
   * @param {Object} data
   * @return {Void}
   */
  move(data) {
    try {
      const gameInfo = gameController.updateTable(data);
      let message = { table: gameInfo.table };

      if (gameInfo.hasOwnProperty('gameOver')) {
        message.gameOver = gameInfo.gameOver;
        message.gameStatus = gameInfo.gameStatus;
      } else {
        message.activePlayer = gameController.getActivePlayer();
      }

      this.webSocket.send(JSON.stringify({
        jokers: this.infoController.getPlayerJokers(data.playerId)
      }));
      this.webSocketServer.broadcast(JSON.stringify(message));
    } catch (error) {
      console.error(error.message);
      this.webSocket.send(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Get the total number of players.
   *
   * @return {Number}
   */
  get players() {
    return this.infoController.totalPlayers();
  }
}

/**
 * Exporting PlayersController class.
 */
module.exports = PlayersController;
