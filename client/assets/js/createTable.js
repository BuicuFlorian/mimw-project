/**
 * Create game table.
 *
 * @param {Object} table
 * @return {Void}
 */
function createTable(table) {
  const tableResponsive = document.createElement('div');
  tableResponsive.classList = 'table-responsive mt-5';

  const newTable = document.createElement('table');
  newTable.classList = 'table table-bordered';

  const tableBody = document.createElement('tbody');
  newTable.appendChild(tableBody);

  const tableLength = table.length;

  for (let row = 0; row < tableLength; row++) {
    let rowLength = table[row].length;
    let tr = document.createElement('tr');
    tableBody.appendChild(tr)

    for (let col = 0; col < rowLength; col++) {
      let td = document.createElement('td');
      td.id = `[${row},${col}]`;
      td.onclick = function () {
        getPosition(this.id);
      };

      if (table[row][col] !== 0) {
        td.style.background = table[row][col];
      }

      tr.appendChild(td);
    }
  }

  tableResponsive.appendChild(newTable);

  let playground = document.getElementById('playground');
  playground.appendChild(tableResponsive);
}
