const express = require('express');
const WebSocket = require('ws');
const join = require('path').join;

const gameController = require('./controllers/game.controller');
const PlayersController = require('./controllers/players.controller');
const EVENTS = require('./config/events');

const app = express();
const port = process.env.PORT || 8080;
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

// Serve static assets.
app.use(express.static(join(__dirname, '../client/assets/js/')));
app.use(express.static(join(__dirname, '../client/assets/css/')));

app.get('*', (req, res) => {
	res.sendFile(join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(port, () => {
	console.log('Magic happens at localhost:8000');
});
