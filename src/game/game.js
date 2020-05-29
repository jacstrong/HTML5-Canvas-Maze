import Render from '../engine/render'
import Box from '../engine/objects/box'
import Texture2d from '../engine/objects/texture2d'
import { sidewinder } from './mazeGeneration'
import Camera2d from '../engine/objects/camera2d'
import Vector2 from '../engine/objects/vector2'
import Input from '../engine/input'
import Player2d from '../engine/objects/player2d'
import CollisionBody from '../engine/objects/collisionBody'
import Text from '../engine/objects/text'

import makeWall from './makeWall'
import makeS from './makeS'
import makeE from './makeE'
import Stopwatch from '../engine/objects/stopwatch'
import getHint from './hint'

export default function game() {
  let canvas = document.getElementById('canvas-id');
  let context = canvas.getContext('2d');

  let previousTime = performance.now();
  
  context.imageSmoothingEnabled = false;

  let input = new Input();

  let cam1 = new Camera2d({
    scale: {
      // x: 0.495,
      // y: 0.495
      x: 5,
      y: 5
    },
    pos: {
      x: -64,
      y: -64
    },
    rotation: 0,
    input: input,
    followDist: {x: 1, y: 1},
    update: [
      function zoomIn(elapsedTime, input) {
        if (input.keys.hasOwnProperty('q')) {
          this.scale.x += elapsedTime * this.scale.x * 0.001;
          this.scale.y += elapsedTime * this.scale.y * 0.001;
        }
      },
      function zoomOut(elapsedTime, input) {
        if (input.keys.hasOwnProperty('e')) {
          this.scale.x -= elapsedTime * this.scale.x * 0.001;
          this.scale.y -= elapsedTime * this.scale.y * 0.001;
        }
      }
    ]
  });

  const timer = new Text({
    text: 'Time/Score: ',
    font: '30px Arial',
    fillStyle: 'white',
    pos: {x: 780, y: 1000},
    hide: false
  })

  const stopwatch = new Stopwatch()

  let render = new Render(context, canvas, [cam1], 'rgba(0, 0, 0, 1)', [timer]);

  let highScores = JSON.parse(localStorage.getItem('highScores'))
  if (highScores === null) {
    highScores = {
      '5': [],
      '10': [],
      '15': [],
      '20': [],
      '30': [],
    }
    localStorage.setItem('highScores', JSON.stringify(highScores))
  }

  let assetsLoaded = false;
  let assetProgress = 0.1;
  const ss = new Image();

  
  function loadAssets() {
    ss.addEventListener('load', function() {
      // For testing
      while (assetProgress < 1) {
        assetProgress += 0.05
        let x = 0
        while (x < 100000000) x++;
      }
      assetsLoaded = true;
    });
    // ss.src = 'https://lh3.googleusercontent.com/LbKF5WzZOVGze5Bq1_L84CpekM398lly4F8958OUQuU-yGRBnXNVZXUAjQx65SCop6JRlDcQ2ePtYNTAyvNfO5jFDIzaoW-pyESuktgBtfzdqu1_E1DFpRoNLPIhnKiPexRXWs7LBbRYmxtdIUcAyoS7y9l7bdGSoqeyAxMjyUDo1d1t2hHWJ8P0TrP4aFT3glwINFYy--lTKJfSa1ZXhYLDYcpRocELf57Z_QaaOBnd-JBRSYo7rhiq_4a6cJfuu9D3LD2nEdvsQ7dcifQl3OXG2MaXhaEYvfUWTyTSO_Tn5CiO2vdv4fAWvCpNfuU1O8ApefDo837ynXWWj8Zmn6PiRVu8rvlHjw0fm58odBTEOgaH3orUgRAG_uJOIMtGXjwIHwqUEsBLjjKc2MRLF9lyFKeJUjlHAOg1t-C4ePPrRuj-qi70jFpsUvksbOTWy-q6K8nyFp41Bg2W5-WTFNXJQqUR2B5k5fxc1VucQ_YZxXeLZRa5NkkiBil9o1fwi722gX-FTWlhM4mgfNqZUgDdRIJfG8TApJyI8CoKRDrPs36nXCvLMkFGX2m9pyUWPLafnVzinedk4BQ1chIPYOR2fek7ZsjKyDRjNpp0dpx-GEbealZUGLBIaKxIgtYgsuVv2TIp-u7mWn9ub731EG8lDPrIwigoiZu3cZtBJkl20XGN=w64-h224-no';
    ss.src = require('../assets/maze-sprites.png');
    
  }

  function makeGrid (x, y) {
    return new CollisionBody({
      image: ss,
      pos: { x: x, y: y },
      width: spriteWidth + 0.2,
      height: spriteWidth + 0.2,
      rotation: 0,
      callback: () => {
        console.log('image loaded')
      },
      collisionObjects: [
        {
          collisionCenter: {x: 16, y: 16},
          collisionDim: {x: 32, y: 32},
        }
      ],
      hide: true,
      collisionShow: false,
      ss: {
        S: [
          {
            x: 32,
            y: 160,
            width: 16,
            height: 16
          },
        ],
      },
      state: 'S',
      collisionChecks: [player],
      update: [
        function collision(elapsedTime) {
          // this.checkCollision()
          if (this.checkCollision()) {
            this.hasBeenVisited = true
          }
        },
      ]
    })
  }

  let mazeSprites = [];
  let grid = [];
  let maze = [];
  let hint = [];
  let mazeSize = 5;
  let spriteWidth = 32;
  let gameState = 1;
  let stateChange = true;

  let showingTrail = false;
  let showingHint = false;

  let entranceChosen = false;
  let entrance = new Vector2(0, 0);
  let exitChosen = false;
  let exit = new Vector2(0, 0);
  let done = false
  let finished = false
  let started = false

  function generateNewMaze() {
    done = false
    finished = false
    started = false

    mazeSprites.length = 0
    grid.length = 0
    maze = sidewinder(mazeSize)
    
    entranceChosen = false;
    entrance = new Vector2(0, 0);
    exitChosen = false;
    exit = new Vector2(0, 0);
    
    for (let i = 0; i < maze.length; i++) {
      const row = maze[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        grid.push(makeGrid(j * spriteWidth, i * spriteWidth))
        if (cell === 4 || cell === 6) {
          mazeSprites.push(makeWall(j * spriteWidth, i * spriteWidth, 'WN', ss));  
        } else if (cell === 14 || cell === 12 || cell === 10 || cell === 2 || cell === 8) {
          mazeSprites.push(makeWall(j * spriteWidth, i * spriteWidth, 'N', ss));
        } else if (cell === 3 || cell === 1 || cell === 5 || cell === 7) {
          mazeSprites.push(makeWall(j * spriteWidth, i * spriteWidth, 'W', ss));
        // } else if () {
          // mazeSprites.push(makeWall(j * spriteWidth, i * spriteWidth, 's8'));
        } else if (cell === 9 || cell === 13 || cell === 15 || cell === 11) {
          mazeSprites.push(makeWall(j * spriteWidth, i * spriteWidth, 'NONE', ss));
        }

        if (i === 0 && !entranceChosen && mazeSprites[mazeSprites.length - 1].currentState === 'N') {
          mazeSprites[mazeSprites.length - 1].setState('entrance');
          entranceChosen = true;
          entrance.x = j
          entrance.y = i
        }
        if (i === maze.length - 1 && !exitChosen && mazeSprites[mazeSprites.length - 1].currentState === 'N') {
          mazeSprites[mazeSprites.length - 1].setState('exit');
          exitChosen = true;
          exit.x = j
          exit.y = i
        }
        
      }
      mazeSprites.push(makeE(maze.length * spriteWidth, i * spriteWidth, ss));
      mazeSprites.push(makeS(i * spriteWidth, maze.length * spriteWidth, ss));
    }
    player.pos.x = entrance.x * spriteWidth
    player.pos.y = 0
    // hint = getHint(maze, exit)
  }

  let player = new CollisionBody({
    name: 'player',
    image: ss,
    input: input,
    pos: {x: entrance.x * spriteWidth, y: 0},
    width: spriteWidth,
    height: spriteWidth,
    ss: {
      S: [
        {
          x: 0,
          y: 176,
          width: 16,
          height: 16
        },
      ],
    },
    state: 'S',
    collisionObjects: [
      {
        collisionCenter: { x:16, y: 23},
        collisionDim: { x: 16, y: 14},
      }
    ],
    collisionChecks: mazeSprites,
    update: [
      function collision(elapsedTime) {
        // this.checkCollision()
      },
      function moveUp(elapsedTime, input) {
        if (input.keys.hasOwnProperty('w')) {
          this.pos.y -= elapsedTime * 0.1
          if (this.checkCollision()) {
          this.pos.y += elapsedTime * 0.1
          }
        }
      },
      function moveDown(elapsedTime, input) {
        if (input.keys.hasOwnProperty('s')) {
          this.pos.y += elapsedTime * 0.1
          if (this.checkCollision()) {
            this.pos.y -= elapsedTime * 0.1
          }
        }
      },
      function moveRight(elapsedTime, input) {
        if (input.keys.hasOwnProperty('d')) {
          this.pos.x += elapsedTime * 0.1
          if (this.checkCollision()) {
            this.pos.x -= elapsedTime * 0.1
          }
        }
      },
      function moveLeft(elapsedTime, input) {
        if (input.keys.hasOwnProperty('a')) {
          this.pos.x -= elapsedTime * 0.1
          if (this.checkCollision()) {
            this.pos.x += elapsedTime * 0.1
          }
        }
      },
    ]
  })

  cam1.followObject(player)
  
  const title = new Text({
    text: 'Maze Game',
    font: '12px Arial',
    pos: {x: -40, y: -64},
  })

  const credits = new Text({
    text: 'Made by: Jacob Strong',
    font: '10px Arial',
    pos: {x: -40, y: -54},
  })

  const instructions = new Text({
    text: '# = maze size | 1: 5x5 | 2: 10x10 | 3: 15x15 | 4: 20x20',
    font: '8px Arial',
    pos: {x: -40, y: -44},
  })

  const controls = new Text ({
    text: 'WASD/Arrows - move      Q & E - zoom in and out',
    font: '8px Arial',
    pos: {x: -40, y: -34},
  })

  const controls2 = new Text ({
    text: 'R - show/hide hint            F - show/hide trail',
    font: '8px Arial',
    pos: {x: -40, y: -24},
  })

  const highScore = new Text ({
    text: 'High Scores',
    font: '8px Arial',
    pos: {x: -44, y: 5},
  })

  const highScoreID = new Text ({
    text: '(5x5)',
    font: '8px Arial',
    pos: {x: -44, y: 15},
  })

  const love = new Text ({
    text: 'Have Fun!',
    font: '150px Arial',
    pos: {x: 0, y: -1000},
  })

  const currentSizeText = new Text({
    text: 'Current Size: 5x5',
    font: '10px Arial',
    pos: {x: 0, y: -2},
  })


  const text = [currentSizeText, love, title,
    credits, instructions, controls, controls2,
    highScore, highScoreID]

  let highScoreText = []

  function updateHighScores() {
    highScoreText.length = 0
    for (let i = 0; i < highScores[String(mazeSize)].length; i++) {
      const el = highScores[String(mazeSize)][i];
      highScoreText.push(new Text({
        text: `${i + 1}: ${el}`,
        font: '8px Arial',
        pos: {x: -44, y: 25 + (i * 10)},
      }))
    }
  }
  updateHighScores()

  function changeSizeText(size) {
    currentSizeText.text = `Current Size: ${size}x${size}`
    highScoreID.text = `${size}x${size}`
    updateHighScores()
  }


  function checkMenuChange() {
    if (input.keyPress.hasOwnProperty('1')) {
      mazeSize = 5
      changeSizeText(5)
      stateChange = true
      stopwatch.time = 0
    } else if (input.keyPress.hasOwnProperty('2')) {
      mazeSize = 10
      changeSizeText(10)
      stateChange = true
      stopwatch.time = 0
    } else if (input.keyPress.hasOwnProperty('3')) {
      mazeSize = 15
      changeSizeText(15)
      stateChange = true
      stopwatch.time = 0
    } else if (input.keyPress.hasOwnProperty('4')) {
      mazeSize = 20
      changeSizeText(20)
      stateChange = true
      stopwatch.time = 0
    } else if (input.keyPress.hasOwnProperty('5')) {
      mazeSize = 30
      changeSizeText(30)
      stateChange = true
      stopwatch.time = 0
    }
    if (input.keyPress.hasOwnProperty('f')) {
      if (showingTrail) {
        for (let i = 0; i < grid.length; i++) {
          grid[i].hide = true
        }
        showingTrail = false
      } else {
        showingTrail = true
      }
    }
  }

  function addHighScore(secs) {
    if (highScores[String(mazeSize)].length === 0) {
      highScores[String(mazeSize)].push(secs)
    } else {
      let placed = false
      for (let i = 0; i < highScores[String(mazeSize)].length; i++) {
        if (secs < parseFloat(highScores[String(mazeSize)][i])) {
          highScores[String(mazeSize)].splice(i, 0, String(secs))
          placed = true
          break;
        }
      }
      if (!placed) {
        highScores[String(mazeSize)].push(secs)
      }
    }
    localStorage.setItem('highScores', JSON.stringify(highScores))
    updateHighScores()
  }

  let wait = 0
  
  function update(elapsedTime) {
    if (showingTrail) {
      for (let i = 0; i < grid.length; i++) {
        if (grid[i].hasBeenVisited) {
          grid[i].hide = false
        }
      }
    }

    // for consoling
    wait += elapsedTime
    if (wait > 2000) {
      wait = 0
    }

    checkMenuChange()

    if (stateChange) {
      generateNewMaze()
      player.pos.x = entrance.x * spriteWidth
      player.pos.y = 0
      player.collisionChecks = mazeSprites
      stateChange = false
    }

    timer.text = `Time/Score: ${stopwatch.seconds}`

    const pos = player.pos;
    const center = player.collisionObjects[0].collisionCenter;
    const dim = player.collisionObjects[0].collisionDim;
  
    let x = pos.x + center.x
    let y = pos.y + center.y
  
    let xdim = dim.x / 2
    let ydim = dim.y / 2

    player.update(elapsedTime)
    cam1.update(elapsedTime)
    stopwatch.update(elapsedTime)
    for (let i = 0; i < grid.length; i++) {
      grid[i].update(elapsedTime);
    }

    if (x + xdim > exit.x * (spriteWidth)
      && y + ydim > exit.y * (spriteWidth)
      && x - xdim < exit.x * (spriteWidth) + (spriteWidth)
      && y - ydim < exit.y * (spriteWidth) + (spriteWidth)) {
        done = true
    }
    
    if (done) {
      generateNewMaze()
      addHighScore(stopwatch.seconds)
      stopwatch.time = 0
    }

    input.clear()
  }


  function gameLoop(time) {
    let elapsedTime = time - previousTime;
    previousTime = time;
    update(elapsedTime);

    // if (assetsLoaded) {
      switch (gameState) {
        case 1:
          render.frame([[...mazeSprites],[...grid],[player],[...text], [...highScoreText]]);
          break;
        case 2:

          break;
        default:
          break;
      }
    // } else {
      // render.loading(assetProgress)
    // }
    
    requestAnimationFrame(gameLoop);
  }

  loadAssets()
  requestAnimationFrame(gameLoop)
}