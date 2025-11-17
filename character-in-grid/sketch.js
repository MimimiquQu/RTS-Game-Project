// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 50;
const OPEN_TILE = 0;
const WALL_TILE = 1;

let grid;
let rows;
let cols;
let grassImg;
let pavingImg;
let grassDensity = 0.0;
let unitSpeed = 4; // grids per second
let units = [];

class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = unitSpeed;
    this.lastMovedTime;
  }
  moveUnit(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
  renderUnit() {
    fill("blue");
    circle((this.x+0.5)*CELL_SIZE, (this.y+0.5)*CELL_SIZE, CELL_SIZE);
  }
}

function preload() {
  grassImg = loadImage("images/grass-tile.png");
  pavingImg = loadImage("images/paving-tile.png");
}


function setup() {
  createCanvas(0.9*windowWidth, 0.9*windowHeight);
  angleMode(DEGREES);
  cols = floor(height/CELL_SIZE);
  rows = floor(width/CELL_SIZE);
  grid = generateGrid(rows, cols);
  units.push(new Unit(1, 1));
  
}

function draw() {
  background("blue");
  renderGrid();
  moveAllUnits();
  renderAllUnits();
}

function moveAllUnits() {
  for (let u of units) {
    let direction = floor(random(4))*90;
    u.moveUnit(cos(direction), sin(direction));
  }
}

function renderAllUnits() {
  for (let u of units) {
    u.renderUnit();
  }
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

}


function generateGrid(rows, cols) {
  let newGrid = [];
  for (let i=0; i<rows; i++) {
    newGrid.push([]);
    for (let j=0; j<cols; j++) {
      let rand = random();
      if (rand < grassDensity) {
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
      }
    }
  }
}

