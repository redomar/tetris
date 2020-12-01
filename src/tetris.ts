'use strict'

// DOM
const canvas = <HTMLCanvasElement>document.getElementById('tetris-field')
const context = <CanvasRenderingContext2D>canvas.getContext('2d')
const scoreBoard = <HTMLElement>document.getElementById('score')
context.scale(20, 20)
const { width, height } = canvas

// Interface
interface offset {
  x: number,
  y: number
}

interface player {
  position: offset,
  matrix: grid,
  score: number,
  highscore: number
}

type grid = number[][]

const blocks = ['iBlock', 'oBlock', 'tBlock', 'sBlock', 'zBlock', 'jBlock', 'lBlock']
const colours = ['aqua', 'yellow', 'magenta', 'green', 'red', 'blue', 'orange']

function arenaSweap() {
  let rowCount = 1
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row)
    y++

    player.score += rowCount * 10
    rowCount *= 2
  }
}

function updateScore() {
  scoreBoard.innerText = player.score.toString()
}

function hasColided(arena: grid, player: player) {
  const [m, o] = [player.matrix, player.position]
  let collision = false

  m.map((row, y) => {
    row.map((_, x) => {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        collision = true
      }
    })
  })

  return collision
}

const createMatrix = (w: number, h: number) => [...Array(h)].map(() => Array(w).fill(0))
const arena: grid = createMatrix(10, 20)

function createBlock(name: String): grid {
  if (name === blocks[0]) {
    return [
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0]
    ]
  }
  if (name === blocks[1]) {
    return [
      [1, 1],
      [1, 1]
    ]
  }
  if (name === blocks[2]) {
    return [
      [0, 0, 0],
      [2, 2, 2],
      [0, 2, 0]
    ]
  }
  if (name === blocks[3]) {
    return [
      [0, 0, 0],
      [0, 3, 3],
      [3, 3, 0]
    ]
  }
  if (name === blocks[4]) {
    return [
      [0, 0, 0],
      [4, 4, 0],
      [0, 4, 4]
    ]
  }
  if (name === blocks[5]) {
    return [
      [0, 5, 0],
      [0, 5, 0],
      [5, 5, 0]
    ]
  }
  if (name === blocks[6]) {
    return [
      [0, 6, 0],
      [0, 6, 0],
      [0, 6, 6]
    ]
  }
  return [
    [0, 0, 0],
    [1, 2, 3],
    [0, 4, 0]
  ]
}

function draw() {
  context.fillStyle = '#333'
  context.fillRect(0, 0, width, height)
  drawMatrix(arena, { x: 0, y: 0 })
  drawMatrix(player.matrix, player.position)
}

// Draw Blocks
function drawMatrix(matrix: grid, offset: offset) {
  matrix.map((row, y) => {
    row.map((val, x) => {
      if (val !== 0) {
        context.fillStyle = (val !== 7 ? colours[val] : colours[0])
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
        context.strokeStyle = 'black'
        context.lineWidth = 1 * .08
        context.strokeRect(x + offset.x, y + offset.y, 1, 1)
        context.stroke()
      }
    })
  })
}


function merge(arena: grid, player: player) {
  player.matrix.map((row, y) => {
    row.map((val, x) => {
      if (val !== 0) {
        arena[y + player.position.y][x + player.position.x] = val
      }
    })
  })
}

// timer
let dropCounter = 0
// timer per tick
let dropInterval = 1000
let lastTime = 0

function playerDrop() {
  player.position.y++
  if (hasColided(arena, player)) {
    player.position.y--
    merge(arena, player)
    playerReset()
    arenaSweap()
    updateScore()
  }
  dropCounter = 0
}

function playerMove(direction: number) {
  player.position.x += direction
  if (hasColided(arena, player)) {
    player.position.x -= direction
  }
}

function playerReset() {
  player.matrix = createBlock(blocks[blocks.length * Math.random() | 0])
  player.position.y = 0
  player.position.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  if (hasColided(arena, player)) {
    arena.forEach(row => row.fill(0))
    if (player.score > player.highscore) {
      player.highscore = player.score
    }
    player.score = 0

  }
}

function playerRotate(direction: number) {
  const position = player.position.x
  let offset = 1
  rotate(player.matrix, direction)
  while (hasColided(arena, player)) {
    player.position.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction)
      player.position.x = position
      return
    }
  }
}

function rotate(matrix: grid, direction: number) {
  matrix.map((row, y) => {
    row.map((_, x) => {
      if (x > y) {
        [
          matrix[x][y],
          matrix[y][x]
        ] = [
            matrix[y][x],
            matrix[x][y]
          ]
      }
    })
  })

  if (direction > 0) {
    matrix.forEach(row => row.reverse())
  } else {
    matrix.reverse()
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop()
  }

  draw()
  requestAnimationFrame(update)
}

const player: player = {
  position: { x: 3, y: -1 },
  matrix: createBlock(blocks[blocks.length * Math.random() | 0]),
  score: 0,
  highscore: 0
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'd') {
    playerMove(1)
  } else if (event.key === 'ArrowLeft' || event.key === 'a') {
    playerMove(-1)
  } else if (event.key === 'ArrowDown' || event.key === 's') {
    playerDrop()
  } else if (event.key === 'z') {
    playerRotate(-1)
  } else if (event.key === 'x') {
    playerRotate(1)
  }
})

update()
// playerReset()