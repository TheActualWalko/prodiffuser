const {dims} = require('./constants.js');
const BigNumber = require('./bignumber.js');

const compute = (N, g, X, Y) => {
  const computeIndices = () => {
    let x = -1;
    let y = -1;
    let lastNewRow = 0;
    let index = 0;
    const grid = {};
    while (index < (N-1)) {
      index ++;
      x ++;
      y ++;
      if (y === Y) {
        y = 0;
      }
      if (x === X) {
        x = 0;
        y = lastNewRow + 1;
        lastNewRow ++;
      }
      grid[`${x},${y}`] = index
    }
    return grid;
  }

  const mapGrid = (grid, fn) => {
    const outputGrid = {};
    Object
      .keys(grid)
      .forEach((k) => outputGrid[k] = fn(grid[k]));
    return outputGrid;
  }

  const computeSequenceValues = (indexGrid) =>
    mapGrid(
      indexGrid,
      h => +(new BigNumber(g).pow(h).divide(N).mod(1).multiply(N).round().valueOf())
    );

  return computeSequenceValues(computeIndices())
};

const renderGrid2d = (N, g, X, Y, grid, cellSize = 4) => {
  let output = '';
  for (let y = 0; y < Y; y ++) {
    for (let x = 0; x < X; x ++) {
      let nextVal = grid[`${x},${y}`] + '';
      while (nextVal.length < cellSize) {
        nextVal = ' ' + nextVal;
      }
      output += nextVal;
    }
    output += '\n';
  }
  return output;
}

const serialize = (X,Y,grid) => {
  const output = [];
  for (let y = 0; y < Y; y ++) {
    for (let x = 0; x < X; x ++) {
      output.push(grid[`${x},${y}`]);
    }
  }
  return output;
}

const result = {};

const startT = Date.now();
let lastT = startT;

dims.slice(0,17).forEach(([N,g,X,Y], i, a) => {
  console.log(`Running ${X} x ${Y} (${i+1} of ${a.length})`)
  const sequenceValues = compute(N,g,X,Y);
  result[`${X},${Y}`] = serialize(X,Y,sequenceValues);
  console.log(`Finished in ${((Date.now() - lastT)/1000).toFixed(3)} seconds\n`);
  lastT = Date.now();
});
console.log(`Finished everything in ${((Date.now() - startT)/1000).toFixed(3)} seconds\n\n\n\n`);

console.log(JSON.stringify(result));