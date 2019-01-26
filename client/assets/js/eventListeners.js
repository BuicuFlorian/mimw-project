document.addEventListener('DOMContentLoaded', function(event) {
  const joinButton = document.getElementById('join');
  const watchButton = document.getElementById('watch');

  joinButton.addEventListener('click', () => {
    if (! storage['playerId']()) {
      connection.send(JSON.stringify({ event: 'JOIN_GAME'}));
    } else {
      alert('You can not join again!');
    }
  });

  watchButton.addEventListener('click', () => {
    if (storage['playerId']()) {
      return alert('You can not view wile you are playing!');

    } else if (storage['table']()) {
      return alert('You are already watching a game!');
    } else {
      connection.send(JSON.stringify({ event: 'WATCH_GAME'}));
    }
  });

  if (storage['table']()) {
    createTable(storage['table']());
    colorTable(storage['table']());
  }

  if (storage['jokers']()) {
    addJokers(storage['jokers']());
  }

  if (storage['selectedJoker']()) {
    selectJoker(storage['selectedJoker']());
  }

  if (storage['playerId']()) {
    hideButtons();
  } else {
    hideJokers();
  } 
});
