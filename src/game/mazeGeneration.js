const getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const N = 1
const S = 2
const E = 4
const W = 8

// This algorithm is from Jamis Buck. Translated from ruby. 
// http://weblog.jamisbuck.org/2011/2/3/maze-generation-sidewinder-algorithm
export const sidewinder = (size) => {
  let grid = new Array(size)

  for (let i = 0; i < size; i++) {
    grid[i] = new Array(size).fill(0)
  }

  for (let y = 0; y < size; y++) {
    let runStart = 0
    for (let x = 0; x < size; x++) {
      if (y > 0 && (x + 1 === size || getRandomInt(3) === 0)) {
        let cell = runStart + getRandomInt(x - runStart + 1)
        grid[y][cell] |= N
        grid[y - 1][cell] |= S
        runStart = x + 1 
      } else if (x + 1 < size) {
        grid[y][x] |= E
        grid[y][x + 1] |= W
      }
    }
  }
  return grid
}

export const mazeToAscii = (grid) => {
  let output = '';

  for (let i = 0; i < grid.length; i++) {
    output += ' _';
  }
  output += '\n';

  for (let y = 0; y < grid.length; y++) {
    output += '|';
    let row = grid[y]
    for (let x = 0; x < grid.length; x++) {
      let cell = grid[y][x]
      if (grid[y][x] === 0 && y + 1 < grid.length && grid[y + 1][x] === 0) {
        output += ' ';
      } else {
        output += ((grid[y][x] & S) != 0) ? ' ' : '_';
      }

      if (grid[y][x] === 0 && x + 1 < grid.length && grid[y][x + 1] === 0) {
        output += (y + 1 < grid.length && (grid[y + 1][x] === 0 || grid[y + 1][x + 1] == 0)) ? ' ' : '_';
      } else if ((grid[y][x] & E) != 0) {
        output += (((cell | row[x + 1]) & S) != 0) ? ' ' : '_';
      } else {
        output += '|'
      }
    }
    output += '\n'
  }
  return output

}


/* 
Holy smokes. So apparently

((grid[y][x] & S) !== 0)

executes differently than

(grid[y][x] & S !== 0)

*/