/**
 * Color the given table.
 *
 * @param {Array} table
 * @returns {Void}
 */
function colorTable(table) {
  const tableLength = table.length;

  for (let row = 0; row < tableLength; row++) {
    let rowLength = table[row].length;
    for (let col = 0; col < rowLength; col++) {
      if (table[row][col] !== 0) {
        let id = [row, col];
        document.getElementById(JSON.stringify(id)).style.background = table[row][col];
      }
    }
  }
}

/**
 * Get the position from the given element.
 *
 * @param {String} elementId
 * @return {Void}
 */
function getPosition(elementId) {
  const playerId = localStorage.getItem(btoa('playerId'));
  const activePlayer = localStorage.getItem(btoa('activePlayer'));

  if (playerId && playerId === activePlayer) {
    connection.send(JSON.stringify({
      event: 'MOVE',
      playerId: localStorage.getItem(btoa('playerId')),
      position: elementId
    }));
  }
}

/**
 * Hide the buttons.
 *
 * @return {Void}
 */
function hideButtons() {
  document.getElementById('buttons').style.display = 'none';
}

/**
 * Make the table visible.
 *
 * @return {Void}
 */
function showTable() {
  document.getElementsByClassName('table-responsive')[0].style.display = 'block';
}

/**
 * Set the title.
 *
 * @param {String} text
 * @returns {Void}
 */
function setTitle(text) {
  document.getElementById('title').innerHTML = text;
}
