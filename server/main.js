const express = require('express');
const WebSocket = require('ws');
const join = require('path').join;

const gameController = require('./controllers/game.controller');
const PlayersController = require('./controllers/players.controller');
const EVENTS = require('./config/events');

const wss = new WebSocket.Server({ port: 8080 });


// Broadcast to all clients.
wss.broadcast = data => {
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

wss.on('connection', ws => {
	const playersController = new PlayersController(wss, ws);

	ws.on('message', data => {
		const message = JSON.parse(data);

		if (EVENTS.hasOwnProperty(message.event)) {
			playersController[EVENTS[message.event]](message);
		}

		console.log(`Received data => ${data}`);
	});

	ws.send(JSON.stringify({
		players: playersController.players(),
		activePlayer: gameController.getActivePlayer()
	}));
});
