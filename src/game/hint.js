export default function hint (maze, exit) {

  let isDone = () => {
    maze.forEach(row => {
      row.forEach(cell => {
        if (cell !== 0) {
          return false
        }
      })
    });
  }

  let queue = []

  while(queue.length) {

  }


}