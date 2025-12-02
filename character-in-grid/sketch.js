// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 20;
const OPEN_TILE = 0;
const WALL_TILE = 1;
const UNIT_DISPLAY_SCALE = 2;

let canvas;
let grid;
let rows;
let cols;
let grassImg;
let pavingImg;
let grassDensity = 0.0;
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
    this.moveSlope;
  }

  move(dx, dy) {
    if(this.x+dx <= cols-1 && this.x+dx >= 0) this.x += dx;
    if(this.y+dy <= rows-1 && this.y+dy >= 0) this.y += dy;
  }

  pathfind() {
    if (!this.selected || (this.moveTargetX-this.x===0 && this.moveTargetY-this.y===0)) {
      return;
    }

    // EDGE CASE: if the path is a strait line
    // in this case, we can't use our "Slope method" anymore, because the slope can be undefined.
    if (this.moveTargetX-this.x===0) {
      if (this.moveTargetY-this.y>0) {
        this.move(0,1);
      } else {
        this.move(0,-1);
      }
      return;
    }
    if (this.moveTargetY-this.y===0) {
      if (this.moveTargetX-this.x>0) {
        this.move(1,0);
      } else {
        this.move(-1,0);
      }
      return;
    }
    // if the path isn't a strait line
    // Use "Tschumi's Slope Pathfinding Algorithm": 
      // Draw the diagonal line connecting the starting and ending positions, that's the path the unit will trace. Call the slope of this line "moveSlope"
      // Then, before each move, calculate the slope of the line connecting the current location and the destination. (Assuming moveSlope>0)If the current slope < moveSlope then move in the x-direction, otherwise the y-direction.
      // This ensures that the movement in each direction(x and y) are "evenly distributed", so that the overall path is as straight as it can be. 
    
    let currentSlope = (this.moveTargetY-this.y)/(this.moveTargetX-this.x); // this is the currentSlope of the line connecting the current position and the target.
    if (this.moveSlope > 0) {
      if (this.moveTargetX-this.x > 0) {
        if (currentSlope<this.moveSlope) {
          this.move(1,0);
        } else {
          this.move(0,1);
        }
      } else {
        if (currentSlope<this.moveSlope) {
          this.move(-1,0);
        } else {
          this.move(0,-1);
        }
      }
    } else {
      if (this.moveTargetX-this.x > 0) {
        if (currentSlope<this.moveSlope) {
          this.move(0,-1);
        } else {
          this.move(1,0);
        }
      } else {
        if (currentSlope<this.moveSlope) {
          this.move(0,1);
        } else {
          this.move(-1,0);
        }
      }
      return;
    }
  }

    

  render() {
    fill("blue");
    circle((this.x+0.5)*CELL_SIZE, (this.y+0.5)*CELL_SIZE, CELL_SIZE*UNIT_DISPLAY_SCALE);
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
  let position = coordinateToIndex(mouseX, mouseY);
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
    u.moveSlope = (y-u.y)/(x-u.x);
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

function coordinateToIndex(x, y) {
  let index = [];
  index.push(max(0, min(cols-1, floor(x/CELL_SIZE))));
  index.push(max(0, min(rows-1, floor(y/CELL_SIZE))));
  return index;
}
