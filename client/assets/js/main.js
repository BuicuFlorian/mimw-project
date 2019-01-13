const url = 'wss://mimw-project.herokuapp.com';
const connection = new WebSocket(url);

connection.onopen = () => {
  console.log('Connected to the server.');
  connection.send(JSON.stringify({ text: 'New client connected!'}));
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
  console.log(`WebSocket error: ${error}`);
};
