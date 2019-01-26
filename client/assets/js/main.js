const host = location.origin.replace(/^http/, 'ws');
const connection = new WebSocket(host);

connection.onopen = () => {
  console.log('Connected to the server.');
  connection.send(JSON.stringify({ text: 'New client connected!'}));
};

connection.onmessage = event => {
  const data = JSON.parse(event.data);
  console.log(data);
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

connection.onclose = () => {
  setInterval(() => {
    connection.send(JSON.stringify({ text: 'New client connected! '}));
  }, 1000)
}
