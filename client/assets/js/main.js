const host = location.origin.replace(/^http/, 'ws');
let connection;

/**
 * Open the connection to the server using a WebSocket.
 *
 * @param {String} host
 */
function init(host) {
  connection = new WebSocket(host);

  connection.onopen = () => {
    console.log('Connected to the server.');
    connection.send(JSON.stringify({ text: 'New client connected!' }));
  };

  connection.onmessage = event => {
    const data = JSON.parse(event.data);
    const keys = Object.keys(data);

    keys.forEach(key => {
      if (events.hasOwnProperty(key)) {
        window[events[key]](data);
      }
    });
  };

  connection.onerror = error => {
    console.log(`WebSocket error: ${JSON.stringify(error)}`);
  };

  /**
   * If the connection to the server is closed
   * try to reconnect every 5 seconds.
   */
  connection.onclose = () => {
    const FIVE_SECONDS = 5000;

    setTimeout(() => {
      console.log('Reconnecting...');
      init(host);
    }, FIVE_SECONDS);
  }
}

init(host);
