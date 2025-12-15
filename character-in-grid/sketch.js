// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 20;
const OPEN_TILE = 0;
const WALL_TILE = 1;
const UNIT_DISPLAY_SCALE = 1.1;

let canvas;
let grid;
let rows;
let cols;
let grassImg;
let pavingImg;
let grassDensity = 0.1;
let unitSpeed = 20; // grids per second
let units = [];
let command = "null"; // this is the state variable that tracks the player's current command/state
let selectedUnits = [];




class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = unitSpeed;
    this.deltaTime = 1/unitSpeed;
    this.lastMovedTime = 0;
    this.selected = false;
    this.moveTargetX = x;
    this.moveTargetY = y;
    this.moveStartX = x;
    this.moveStartY = y;
  }

  move(dx, dy) {
    if(this.x+dx <= cols-1 && this.x+dx >= 0) this.x += dx;
    if(this.y+dy <= rows-1 && this.y+dy >= 0) this.y += dy;
  }

  render() {
    fill("blue");
    circle((this.x+0.5)*CELL_SIZE, (this.y+0.5)*CELL_SIZE, CELL_SIZE*UNIT_DISPLAY_SCALE);
  }

  // use A* algorithm (Hueristic) for pathfinding
  pathfind() {
    let openNodes = []; // nodes that are waiting to be evaulated(searched)
    let closedNodes = []; // nodes that we have already searched
    let current = new pathNode(this.moveStartX, this.moveStartY); 
    let target = new pathNode(this.moveTargetX, this.moveTargetY);
    openNodes.push(current);
    current.getNeighbors();
    

    // pathfinding loop, doesn't exit until the unit reaches the target
    while (this.selected) {
      current = openNodes[0];
      current.getNeighbors();
      if (current.x === target.x && current.y === target.y) { // current === target, path has been found!
        return;
      }
      // loop through each neighbor
      for (let nb of current.neighbors) {
        if (nb.tileType != OPEN_TILE || closedNodes.includes(nb)) {
          continue;
        }
        if (!openNodes.includes(nb)) { // if new path to neighbor is shorter, OR, neighbor is not in OPEN.
          nb.getFCost();
          nb.parent = current;
          // if neighbor isn't in OPEN, add it
          if (!openNodes.includes(nb)) {
            openNodes.push(nb);
          }
        }
      }
    }
  }
}

class pathNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.parent;
    this.neighbors;
    this.tileType = grid[x][y];
    this.fCost;
    this.gCost;
    this.hCost;
    this.parent;
  }
  // get the neighbors of THIS pathNode
  getNeighbors() {
    if (this.x>0) {
      neighbors.push(new pathNode(this.x-1, this.y));
    }
    if (this.x<cols-1) {
      neighbors.push(new pathNode(this.x+1, this.y));
    }
    if (this.y>0) {
      neighbors.push(new pathNode(this.x, this.y-1));
    }
    if (this.y<rows-1) {
      neighbors.push(new pathNode(this.x, this.y+1));
    }
    if (this.x>0 && this.y>0) {
      neighbors.push(new pathNode(this.x-1, this.y-1));
    }
    if (this.x<cols-1 && this.y<rows-1) {
      neighbors.push(new pathNode(this.x+1, this.y+1));
    }
    if (this.x<cols-1 && this.y>0) {
      neighbors.push(new pathNode(this.x+1, this.y-1));
    }
    if (this.x>0 && this.y<rows-1) {
      neighbors.push(new pathNode(this.x-1, this.y+1));
    }
  }

  getFCost() {

  }
}




function preload() {
  grassImg = loadImage("images/grass-tile.png");
  pavingImg = loadImage("images/paving-tile.png");
}



function setup() {
  canvas = createCanvas(0.9*windowWidth, 0.9*windowHeight);
  canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault()); // Asked ChatGPT how to disable the content table when right clicking. Basically, if there's a context table tries to pop up, we block the event so it doesn't show up with this preventDefault() function.
  angleMode(DEGREES);
  cols = floor(width/CELL_SIZE);
  rows = floor(height/CELL_SIZE);
  grid = generateGrid(rows, cols);
  for (let i=0; i<1; i++) {
    units.push(new Unit(i%cols, floor(i/cols)));
  }
  renderGrid();
}




function draw() {
  background("blue");
  renderGrid();
  unitsLoop();
}



function mousePressed() {
  let position = getCoordinate(mouseX, mouseY);
  let x = position[0];
  let y = position[1];
  // console.log(x, y);
  if (command === "null" && (mouseButton === LEFT)) {
    selectedUnits = selectUnitsInArea(x, y);
    command = "move";
  }
  if (command === "move" && (mouseButton === RIGHT)) {
    moveSelectedUnits(x, y);
    command = "null";
  }
}




function unitsLoop() {
  for (let u of units) {
    if (millis()/1000 - u.lastMovedTime >= u.deltaTime) {
      u.pathfind();
      u.lastMovedTime = millis()/1000;
    }
    u.render();
  }
}


function selectUnitsInArea(x,y) {
  let targetUnits = [];
  for (let u of units) {
    // console.log(u);
    if ((u.x === x) && (u.y === y)) {
      targetUnits.push(u);
    }
  }
  // console.log(targetUnits);
  return targetUnits;
}

function moveSelectedUnits(x, y) {
  for (let u of selectedUnits) {
    // console.log(u.x, u.y, x, y, u.moveSlope);
    u.moveStartX = u.x;
    u.moveStartY = u.y;
    u.moveTargetX = x;
    u.moveTargetY = y;
    u.selected = true;
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

function getCoordinate(x, y) {
  let index = [];
  index.push(max(0, min(cols-1, floor(x/CELL_SIZE))));
  index.push(max(0, min(rows-1, floor(y/CELL_SIZE))));
  return index;
}
