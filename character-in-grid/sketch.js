// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 5;
const OPEN_TILE = 0;
const WALL_TILE = 1;

let grid;
let rows;
let cols;
let grassImg;
let pavingImg;
let grassDensity = 0.0;
let unitSpeed = 20; // grids per second
let units = [];

class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = unitSpeed;
    this.deltaTime = 1/unitSpeed;
    this.lastMovedTime = 0;
  }

  moveUnit(dx, dy) {
    if(this.x+dx <= cols-1 && this.x+dx >= 0) this.x += dx;
    if(this.y+dy <= rows-1 && this.y+dy >= 0) this.y += dy;
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
  cols = floor(width/CELL_SIZE);
  rows = floor(height/CELL_SIZE);
  grid = generateGrid(rows, cols);
  for (let i=0; i<10; i++) {
    units.push(new Unit(cols/2, rows/2));
  }
}

function draw() {
  background("blue");
  renderGrid();
  moveAllUnits();
  renderAllUnits();
}

function mousePressed() {
  let x = floor(mouseY / CELL_SIZE);
  let y = floor(mouseX / CELL_SIZE);
  toggleCell(x, y);
}

function moveAllUnits() {
  for (let u of units) {
    if (millis()/1000 - u.lastMovedTime >= u.deltaTime) {
      let direction = floor(random(4))*90;
      u.moveUnit(cos(direction), sin(direction));
      u.lastMovedTime = millis()/1000;
    }
  }
}

function renderAllUnits() {
  for (let u of units) {
    u.renderUnit();
  }
}



function toggleCell(x, y) {
  if (grid[y][x] === OPEN_TILE) {
    grid[y][x] = WALL_TILE;
  } else if (grid[y][x] === WALL_TILE) {
    grid[y][x] = OPEN_TILE;
  }
}



function generateGrid(rows, cols) {
  let newGrid = [];
  for (let i=0; i<cols; i++) {
    newGrid.push([]);
    for (let j=0; j<rows; j++) {
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
  for (let i=0; i<cols; i++) {
    newGrid.push([]);
    for (let j=0; j<rows; j++) {
      newGrid[i].push(OPEN_TILE);
    }
  }
  return newGrid;
}
function renderGrid() {
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {
      if (grid[i][j] === OPEN_TILE) {
        image(pavingImg, i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else if (grid[i][j] === WALL_TILE) {
        image(grassImg, i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

