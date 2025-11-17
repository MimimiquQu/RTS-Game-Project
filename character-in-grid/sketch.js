// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 50;
const OPEN_TILE = 0;
const WALL_TILE = 1;
const PLAYER_TILE = 9;

let grid;
let rows;
let cols;
let player = {
  x: 0,
  y: 0,
}
let grassImg;
let pavingImg;

function preload() {
  grassImg = loadImage("images/grass-tile.png");
  pavingImg = loadImage("images/paving-tile.png");
}


function setup() {
  createCanvas(0.9*windowWidth, 0.9*windowHeight);
  cols = floor(height/CELL_SIZE);
  rows = floor(width/CELL_SIZE);
  grid = generateGrid(rows, cols);
  grid[player.x][player.y] = PLAYER_TILE;
}

function draw() {
  background("blue");
  renderGrid();
  console.log(player);
}

function mousePressed() {
  let x = floor(mouseY / CELL_SIZE);
  let y = floor(mouseX / CELL_SIZE);
  toggleCell(x, y);
}

function toggleCell(x, y) {
  if (grid[y][x] === OPEN_TILE) {
    grid[y][x] = WALL_TILE;
  } else if (grid[y][x] === WALL_TILE) {
    grid[y][x] = OPEN_TILE;
  }
}

function keyPressed() {
  if (key === "a") {
    movePlayer(-1, 0);
  } else if (key === "d") {
    movePlayer(1, 0);
  } else if (key === "w") {
    movePlayer(0, -1);
  } else if (key === "s") {
    movePlayer(0, 1);
  }
}


function generateGrid(rows, cols) {
  let newGrid = [];
  for (let i=0; i<rows; i++) {
    newGrid.push([]);
    for (let j=0; j<cols; j++) {
      let rand = random();
      if (rand < 0.2) {
        newGrid[i].push(WALL_TILE);
      } else {
        newGrid[i].push(OPEN_TILE);
      }
    }
  }
  return newGrid;
}

function emptyGrid(rows, cols) {
  let newGrid = [];
  for (let i=0; i<rows; i++) {
    newGrid.push([]);
    for (let j=0; j<cols; j++) {
      newGrid[i].push(OPEN_TILE);
    }
  }
  return newGrid;
}
function renderGrid() {
  for (let i=0; i<rows; i++) {
    for (let j=0; j<cols; j++) {
      if (grid[i][j] === OPEN_TILE) {
        image(pavingImg, i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (grid[i][j] === WALL_TILE) {
        image(grassImg, i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (grid[i][j] === PLAYER_TILE) {
        fill("red");
      }
    }
  }
}

function movePlayer(dx, dy) {
  grid[player.x][player.y] = OPEN_TILE;
  if (grid[player.x + dx][player.y + dy] === OPEN_TILE) {
    player.x+=dx;
    player.y+=dy;
  }
  grid[player.x][player.y] = PLAYER_TILE;
}
