// Rectangle Neighbors 2d Array Demo

const CELL_SIZE = 40;
const OPEN_TILE = 0;
const WALL_TILE = 1;
const UNIT_DISPLAY_SCALE = 1.2;

let canvas;
let grid;
let rows;
let cols;
let grassImg;
let pavingImg;
let grassDensity = 0.0; // percentage of grass tiles in the grid
let unitSpeed = 10; // grids per second
let units = [];
let command = "null"; // this is the state variable that tracks the player's current command/state
let selectedUnits = [];
let mouseSelectCoord = new Array(4);
let showSelectionBox = false;

// create an array of all nodes in the entire grid, so that we can reference them later without duplicating them.
let nodeGrid = [];



class Priorityarray extends Array {
  // binary search + insert algorithm, so that the priority-array remains sorted w/ respect to fCost after the addition of the new node.
  enqueue(node, left, right) { // INITIAL: left = 0, right = length-1
    // if the array is currently empty, just push the node in.
    if (this.length === 0) {
      this.push(node);
      return;
    }
    let mid = Math.floor((left+right)/2);

    // when left bound coaligns with right bound, the binary search has completed and we simply insert it there.
    if (left === right) {
      this.splice(left, 0, node);
      return;
    }

    // Standard binary search with recursion
    
    if (this[mid].fCost === node.fCost) { // if the node's f cost are the same, tiebreak by lowest h cost.
      if (this[mid].hCost == node.hCost) { // if the node's f,h costs are the same as the element at mid position, simply insert the node there.
        this.splice(left, 0, node);
        return;
      } else if (this[mid].hCost < node.hCost) { // tiebreaking by lowest h cost
        this.enqueue(node, mid+1, right);
      } else {
        this.enqueue(node, left, mid);
      }
    } else if (this[mid].fCost < node.fCost) { 
      this.enqueue(node, mid+1, right);
    } else {
      this.enqueue(node, left, mid);
    }
  }
}


class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = unitSpeed;
    this.deltaTime = 1/unitSpeed;
    this.lastMovedTime = 0;
    this.status = "idle"; // a finite status machine of what command the unit is currently executing. "idle" for nothing. "pending", "pathfinding", "move", "attack", etc.
    this.selected = false;
    this.moveTargetX = x;
    this.moveTargetY = y;
    this.moveStartX = x;
    this.moveStartY = y;
    this.movePath;
    this.waitTime = 0;
    this.maxWaitTime = 1; // in seconds
    grid[x][y] = this; // mark the unit's position on the grid
  }

  move() {
    let next = this.movePath[this.movePath.length-1];

    // check if destination is blocked by another unit, if so then do not move.
    if (grid[next.x][next.y] != OPEN_TILE) {
      // when path is blocked, add wait time
      this.waitTime += this.deltaTime;
      if (waitTime > this.maxWaitTime) {
        let alt = this.tryAlternativePath();
        if (alt != null) {
          // found an alternative neighbor cell to move into

        }
      }
      // console.log(grid[next.x][next.y]); // for debugging purposes
      return;
    }

    // erase old tile in grid
    grid[this.x][this.y] = OPEN_TILE;
    //move to next tile
    grid[next.x][next.y] = this;

    // change unit's position
    this.x = next.x;
    this.y = next.y;
    this.movePath.splice(this.movePath.length-1, 1);
    this.lastMovedTime = millis()/1000;
  }

  render() {
    fill("blue");
    if (this.selected) {
      stroke("green");
      strokeWeight(5);
    } else {
      stroke("black");
      strokeWeight(1);
    }
    circle((this.x+0.5)*CELL_SIZE, (this.y+0.5)*CELL_SIZE, CELL_SIZE*UNIT_DISPLAY_SCALE);
  }

  // use A* algorithm (Hueristic) for pathfinding
  pathfind() {
    // console.log(1); // 1 is the code for testing
    
    let openNodes = new Priorityarray(); // nodes that are waiting to be evaulated(searched). I put them in a priority array(a class I created) so that we can use the enqueue function to push elements in while preserving its sorted sequence based on f-cost("priority")
    let closedNodes = []; // nodes that we have already searched
    let target = nodeGrid[this.moveTargetX][this.moveTargetY];
    let current = nodeGrid[this.moveStartX][this.moveStartY]; 
    current.gCost = 0;
    current.hCost = current.gridDist(target);
    current.fCost = current.gCost + current.hCost;
    // console.log(openNodes);
    openNodes.enqueue(current, 0, openNodes.length-1); // enqueue the current node into the openNodes priority array, bascially when adding the element, find the appropriate place for it based on priority(determined by f-cost, tie-breaked by lowest h-cost)
    

    // pathfinding loop, doesn't exit until the unit reaches the target
    while (this.status === "pathfinding") {
      // console.log(openNodes); //console.log the open nodes for debugging purposes
      // check if target is reached
      if (current.x === target.x && current.y === target.y) { // current === target, path has been found!
        break;
      }

      // if OPEN is empty, no path exists, exit.
      if (openNodes.length === 0) {
        this.status = "idle";
        console.log("Warning: invalid movement command, target cannot be reached from current position.");
        return -1; // code for "No path"
      }

      current = openNodes[0]; // current = the node with least f value in open
      openNodes.splice(0, 1);
      closedNodes.push(current);

      // Correction: instead of looping through each neighbor, add all neighbors to OPEN.
      // loop through each neighbor
      for (let nb of current.neighbors) {
        if (grid[nb.x][nb.y] === WALL_TILE  || closedNodes.includes(nb)) { // when pathfinding, treat other units as open tiles.
          continue;
        }
        
        let tentativeG = current.gCost + current.gridDist(nb); // calculate tentative g-cost
        if (!openNodes.includes(nb)) {
          // set parent to current, and set g,h,f costs.
          nb.parent = current;
          nb.gCost = tentativeG;
          nb.hCost = nb.gridDist(target); // calcualate the h-cost of the neighbor: defined as the heuristic distance between the nb and the target.
          nb.fCost = nb.gCost + nb.hCost; // caluclate the f-cost: defined as g+h
          
          openNodes.enqueue(nb, 0, openNodes.length-1); // enqueue neighbor into open nodes

        } else if (tentativeG < nb.gCost) {
          // if the tentative G-cost is smaller than that of the neighbor, then it indicates that a BETTER PATH to this neighbor has been found.
          nb.parent = current;
          // update g, recalculate h and f.
          nb.gCost = tentativeG;
          nb.fCost = nb.gCost + nb.hCost;   
        }
      }
    }

    // reconstruct the path by tracing the parents of nodes recursively. PS: the path array starts from the target and ends at the start node.
    let path = [];
    let node = target; // create a temporary looping variable "node", and its start value is target
    path.push(node);
    while(node != nodeGrid[this.moveStartX][this.moveStartY]) {
      node = node.parent;
      path.push(node);
    }
    path.splice(path.length-1, 1); // remove the starting node from the path, since the unit is already at the starting node
    this.status = "moving"; // exit pathfinding state and enter moving state
    return path;
  }

  tryAlternativePath() {
    // check the 8 neighboring cells and see which one is the best for the unit to move into any of them.
    let bestNb = null;
    let bestDist = Infinity;
    let node = nodeGrid[this.x][this.y];
    let target = nodeGrid[this.moveTargetX][this.moveTargetY];
    for (let nb of node.neighbors) {
      if (grid[nb.x][nb.y] === OPEN_TILE) {
        // found an open neighbor cell, see if it's the best one yet.
        if (nb.gridDist(target) < bestDist) {
        bestDist = nb.gridDist(target);
        bestNb = nb;
        }
      }
    }
    return bestNb;
  }
}

class PathNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.parent;
    this.neighbors = [];
    this.fCost;
    this.gCost;
    this.hCost;
    this.parent;
  }
  // get the neighbors of THIS PathNode
  getNeighbors() {
    if (this.x>0) {
      this.neighbors.push(nodeGrid[this.x-1][this.y]);
    }
    if (this.x<cols-1) {
      this.neighbors.push(nodeGrid[this.x+1][this.y]);
    }
    if (this.y>0) {
      this.neighbors.push(nodeGrid[this.x][this.y-1]);
    }
    if (this.y<rows-1) {
      this.neighbors.push(nodeGrid[this.x][this.y+1]);
    }
    if (this.x>0 && this.y>0) {
      this.neighbors.push(nodeGrid[this.x-1][this.y-1]);
    }
    if (this.x<cols-1 && this.y<rows-1) {
      this.neighbors.push(nodeGrid[this.x+1][this.y+1]);
    }
    if (this.x<cols-1 && this.y>0) {
      this.neighbors.push(nodeGrid[this.x+1][this.y-1]);
    }
    if (this.x>0 && this.y<rows-1) {
      this.neighbors.push(nodeGrid[this.x-1][this.y+1]);
    }
  }

  gridDist(node) {
    // each diagonal step is distance 14, horizontal is 10. This is bc a diagonal step is sqrt(2) times the horizontal step, which is appriximately 1.414=1.4
    let diag = min(abs(node.x-this.x), abs(node.y-this.y));
    return 14*diag + 10*(max(abs(node.x-this.x), abs(node.y-this.y))-diag);
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
  renderGrid();
  // console.log(grid); // for debugging purposes
  
  // create units (for demo purposes, just create a number of units lining up at the top-left corner, adjacent to eachother)
  for (let i=0; i<100; i++) {
    units.push(new Unit(i%cols, floor(i/cols)));
  }

  // create nodeGrid
  for (let i=0; i<cols; i++) {
    nodeGrid.push([]);
    for (let j=0; j<rows; j++) {
      let node = new PathNode(i,j);
      nodeGrid[i].push(node);
    }
  }
  // set the neighbors of each node using PathNode.getNeighbors()
  for (let i=0; i<cols; i++) {
    for (let j=0; j<rows; j++) {
      nodeGrid[i][j].getNeighbors();
    }
  }
  // console.log(nodeGrid);
}




function draw() {
  background("blue");
  renderGrid();
  unitsLoop();
  selectionBox();
  
  console.log(command); // for debugging purposes
}



function mousePressed() {
  let pos = getCoordinate(mouseX, mouseY);
  let x = pos[0];
  let y = pos[1];

  // console.log(x, y);
  if (mouseButton === LEFT) {
    selectedUnits = selectUnitsInArea(x, y, x, y);
    if (selectedUnits.length > 0) {
      command = "move";
    } else {
      command = "null";
    }
  }
  
  if (command === "move" && (mouseButton === RIGHT)) {
    if(grid[x][y] === WALL_TILE) {
      console.log("Warning: Invalid movement commad, target is blocked.")
    } else {
      moveSelectedUnits(x, y); // the select boundary is just the cell at (x,y).
    }
  }
}

function mouseDragged() { // called when user drags their mouse to create a selection box
  if (mouseButton === LEFT && command != "selecting") {
    console.log("1"); // for debugging purposes
    mouseSelectCoord[0] = mouseX;
    mouseSelectCoord[1] = mouseY;
    showSelectionBox = true;
    command = "selecting";
  }
}


function mouseReleased() { //called when user releases their mouse when box-selecting
  if (command === "selecting" && (mouseButton === LEFT)) {
    console.log("2"); // for debugging purposes
    mouseSelectCoord[2] = mouseX;
    mouseSelectCoord[3] = mouseY;
    showSelectionBox = false;
    let pos1 = getCoordinate(mouseSelectCoord[0], mouseSelectCoord[1]); // starting cell of selection
    let pos2 = getCoordinate(mouseSelectCoord[2], mouseSelectCoord[3]); // ending cell of selection
    selectedUnits = selectUnitsInArea(pos1[0], pos1[1], pos2[0], pos2[1]);
    if (selectedUnits.length > 0) {
      command = "move";
    } else {
      command = "null";
    }
  }

}



function unitsLoop() {
  for (let u of units) {
    // console.log(u.status); // for testing purposes
    if ((millis()/1000 - u.lastMovedTime >= u.deltaTime) && u.status === "moving") {
      // console.log(u.movePath[u.movePath.length-1]); // for debugging
      if (u.movePath.length > 0) {
        u.move();
      } else {
        u.status = "idle"; // there is no more path for the unit to move along, so set the status to "idle"
      }
    }
    u.render();
  }
}


function selectUnitsInArea(x1, y1, x2, y2) { // this function returns an array of selected units within the specified area, and ALSO clears the status of *selected*(boolean) for the previous selectedUnits.
  // clears the *selected* status of previously selected units
  for (let u of selectedUnits) {
    u.selected = false;
  }

  let targetUnits = [];
  for (let u of units) {
    // console.log(u);
    if ((u.x >= min(x1,x2)) && (u.x <= max(x1,x2)) && (u.y >= min(y1,y2)) && (u.y <= max(y1,y2))) {
      targetUnits.push(u);
      u.selected = true;
    }
  }
  // console.log(targetUnits);
  return targetUnits;
}

function moveSelectedUnits(x, y) {
  // set different destinations for each selected unit, centered at the target (x,y) position. 
  // This ensures that multiple selected units can end up moving to distinct and neighboring cells around the destination, instead of feebly trying to all go to the same target(x,y) and end up stucking forever.
  let destinations = getSpreadDestinations(x, y, selectedUnits.length);
  if (destinations === -1) { // recieved error code
    return; // exit the function without moving anything
  }

  for (let i=0; i<selectedUnits.length; i++) {
    // console.log(u.x, u.y, x, y, u.moveSlope);
    let u = selectedUnits[i];
    u.moveStartX = u.x;
    u.moveStartY = u.y;
    u.moveTargetX = destinations[i].x;
    u.moveTargetY = destinations[i].y;
    u.status = "pathfinding";
    u.movePath = u.pathfind(); // call A* pathfinding algorithm
    // console.log(u.movePath); // for debugging purposes, show the path
  }
}

function getSpreadDestinations(x, y, n) { // a function that assigns the n selected units to n distinct neighboring desinations around the target(x,y)
  let dests = [];
  let radius = 0;
  while (dests.length < n) {
    for (let dx=-radius; dx<=radius; dx++) {
      for (let dy=-radius; dy<=radius; dy++) {
        // only consider the border cells of the square, not the inner cells because they've already been checked by the previous pass.
        if (abs(dx) === radius || abs(dy) === radius) {
          let destX = x + dx;
          let destY = y + dy;
          // check if the destination is within bounds and is an OPEN_TILE
          if (destX >=0 && destX < cols && destY >=0 && destY < rows && grid[destX][destY] != WALL_TILE) {
            dests.push({x: destX, y: destY});
            if (dests.length === n) { // AFTER we add a new destination, check if we have enough destinations already. If so then return.
              // console.log(dests); // for debugging purposes
              return dests;

            }
          }
        }
      }
    }
    radius++;
  }
  if (dests.length < n) {
    console.log("Warning: invalid movement commad, not enough space to fit all selected units near target destination.");
    return -1; // code for error
  }

}


function selectionBox() {
  if (showSelectionBox) {
    rectMode(CORNERS);
    noFill();
    strokeWeight(3);
    stroke("light green");

    rect(mouseSelectCoord[0], mouseSelectCoord[1], mouseX, mouseY);
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
      } else if (grid[i][j] === WALL_TILE || grid[i][j] instanceof Unit) { // call "instanceof" to check if the grid cell contains a "Unit" object
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
