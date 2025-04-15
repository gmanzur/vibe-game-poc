export class Game {
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private wanderTimeoutId: number | null = null;

  private readonly GRID_ROWS = 20;
  private readonly GRID_COLS = 40;
  private readonly CELL_SIZE = 32;
  private readonly PLAYER_COLOR = '#FFD600';
  private readonly BG_COLOR = '#388E3C';
  private readonly LAKE_COLOR = '#2196F3';
  private readonly ROCK_COLOR = '#757575';
  private readonly TREE_COLOR = '#2E7D32';

  private player = {
    x: Math.floor(40 / 2),
    y: Math.floor(20 / 2),
    hunger: 0,    // 0 (full) to 100 (starving)
    tiredness: 0, // 0 (rested) to 100 (exhausted)
    state: 'wander' as 'wander' | 'fish' | 'gather_wood' | 'gather_flint' | 'build_shelter' | 'rest',
    inventory: {
      wood: 0,
      flint: 0,
      fish: 0,
      hasShelter: false,
      hasFire: false,
    }
  };

  // Lake: 2 rows x 4 cols, top-left at (5, 5)
  private lake = {
    x: 5,
    y: 5,
    width: 4,
    height: 2,
  };

  // Some rocks at fixed positions
  private rocks = [
    { x: 10, y: 8 },
    { x: 12, y: 15 },
    { x: 25, y: 10 },
    { x: 30, y: 18 },
  ];

  // Some trees at fixed positions
  private trees = [
    { x: 7, y: 3 },
    { x: 15, y: 12 },
    { x: 20, y: 5 },
    { x: 35, y: 16 },
    { x: 38, y: 2 },
  ];

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  private draw() {
    // Draw background
    this.ctx.fillStyle = this.BG_COLOR;
    this.ctx.fillRect(0, 0, this.GRID_COLS * this.CELL_SIZE, this.GRID_ROWS * this.CELL_SIZE);

    // Draw lake
    this.ctx.fillStyle = this.LAKE_COLOR;
    this.ctx.fillRect(
      this.lake.x * this.CELL_SIZE,
      this.lake.y * this.CELL_SIZE,
      this.lake.width * this.CELL_SIZE,
      this.lake.height * this.CELL_SIZE
    );

    // Draw rocks
    this.ctx.fillStyle = this.ROCK_COLOR;
    for (const rock of this.rocks) {
      this.ctx.beginPath();
      this.ctx.arc(
        rock.x * this.CELL_SIZE + this.CELL_SIZE / 2,
        rock.y * this.CELL_SIZE + this.CELL_SIZE / 2,
        this.CELL_SIZE * 0.4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Draw trees
    this.ctx.fillStyle = this.TREE_COLOR;
    for (const tree of this.trees) {
      this.ctx.beginPath();
      this.ctx.arc(
        tree.x * this.CELL_SIZE + this.CELL_SIZE / 2,
        tree.y * this.CELL_SIZE + this.CELL_SIZE / 2,
        this.CELL_SIZE * 0.45,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Draw player
    this.ctx.fillStyle = this.PLAYER_COLOR;
    this.ctx.fillRect(
      this.player.x * this.CELL_SIZE,
      this.player.y * this.CELL_SIZE,
      this.CELL_SIZE,
      this.CELL_SIZE
    );

    // Draw hunger/tiredness counters (top left)
    this.ctx.font = '20px monospace';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Hunger: ${Math.round(this.player.hunger)}`, 10, 24);
    this.ctx.fillText(`Tired: ${Math.round(this.player.tiredness)}`, 10, 48);

    // Optionally, show state
    this.ctx.fillStyle = '#FFD600';
    this.ctx.fillText(`State: ${this.player.state}`, 10, 72);
  }

  private isBlocked(x: number, y: number): boolean {
    // Check lake
    if (
      x >= this.lake.x &&
      x < this.lake.x + this.lake.width &&
      y >= this.lake.y &&
      y < this.lake.y + this.lake.height
    ) {
      return true;
    }
    // Check rocks
    for (const rock of this.rocks) {
      if (rock.x === x && rock.y === y) return true;
    }
    // Check trees
    for (const tree of this.trees) {
      if (tree.x === x && tree.y === y) return true;
    }
    return false;
  }

  private movePlayerRandomly() {
    // All 8 directions (dx, dy)
    const directions = [
      { dx: -1, dy: -1 }, // up-left
      { dx:  0, dy: -1 }, // up
      { dx:  1, dy: -1 }, // up-right
      { dx: -1, dy:  0 }, // left
      { dx:  1, dy:  0 }, // right
      { dx: -1, dy:  1 }, // down-left
      { dx:  0, dy:  1 }, // down
      { dx:  1, dy:  1 }, // down-right
    ];

    // Shuffle directions to pick randomly
    const shuffled = directions.sort(() => Math.random() - 0.5);

    for (const dir of shuffled) {
      const nx = this.player.x + dir.dx;
      const ny = this.player.y + dir.dy;
      if (
        nx >= 0 && nx < this.GRID_COLS &&
        ny >= 0 && ny < this.GRID_ROWS &&
        !this.isBlocked(nx, ny)
      ) {
        this.player.x = nx;
        this.player.y = ny;
        break;
      }
    }
  }

  private findPath(start: { x: number, y: number }, goal: { x: number, y: number }): { x: number, y: number }[] | null {
    const key = (x: number, y: number) => `${x},${y}`;
    const open: { x: number, y: number }[] = [start];
    const cameFrom = new Map<string, { x: number, y: number } | null>();
    const gScore = new Map<string, number>();
    gScore.set(key(start.x, start.y), 0);

    const h = (a: { x: number, y: number }, b: { x: number, y: number }) =>
      Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    while (open.length > 0) {
      // Get node with lowest fScore
      let currentIdx = 0;
      let current = open[0];
      let lowestF = (gScore.get(key(current.x, current.y)) ?? Infinity) + h(current, goal);
      for (let i = 1; i < open.length; i++) {
        const node = open[i];
        const f = (gScore.get(key(node.x, node.y)) ?? Infinity) + h(node, goal);
        if (f < lowestF) {
          currentIdx = i;
          current = node;
          lowestF = f;
        }
      }
      open.splice(currentIdx, 1);

      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        const path: { x: number, y: number }[] = [];
        let currKey = key(current.x, current.y);
        while (cameFrom.has(currKey)) {
          path.unshift(current);
          const prev = cameFrom.get(currKey);
          if (!prev) break;
          current = prev;
          currKey = key(current.x, current.y);
        }
        return path;
      }

      // All 8 directions
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = current.x + dx;
          const ny = current.y + dy;
          if (
            nx >= 0 && nx < this.GRID_COLS &&
            ny >= 0 && ny < this.GRID_ROWS &&
            !this.isBlocked(nx, ny)
          ) {
            const neighborKey = key(nx, ny);
            const tentativeG = (gScore.get(key(current.x, current.y)) ?? Infinity) + 1;
            if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
              cameFrom.set(neighborKey, { x: current.x, y: current.y });
              gScore.set(neighborKey, tentativeG);
              if (!open.some(n => n.x === nx && n.y === ny)) {
                open.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }
    return null; // No path found
  }

  private currentPath: { x: number, y: number }[] | null = null;

  private movePlayerToward(target: { x: number, y: number }) {
    // Use pathfinding to move toward target
    if (
      !this.currentPath ||
      this.currentPath.length === 0 ||
      this.currentPath[this.currentPath.length - 1].x !== target.x ||
      this.currentPath[this.currentPath.length - 1].y !== target.y
    ) {
      // Recalculate path if no path or target changed
      const path = this.findPath({ x: this.player.x, y: this.player.y }, target);
      this.currentPath = path;
    }
    if (this.currentPath && this.currentPath.length > 0) {
      // Remove current position if at start
      if (this.currentPath[0].x === this.player.x && this.currentPath[0].y === this.player.y) {
        this.currentPath.shift();
      }
      if (this.currentPath.length > 0) {
        const next = this.currentPath[0];
        this.player.x = next.x;
        this.player.y = next.y;
        this.currentPath.shift();
      }
    }
  }

  private clearPath() {
    this.currentPath = null;
  }

  private getAdjacentTiles(rect: { x: number, y: number, width: number, height: number }): { x: number, y: number }[] {
    const adj: { x: number, y: number }[] = [];
    for (let dx = -1; dx <= rect.width; dx++) {
      for (let dy = -1; dy <= rect.height; dy++) {
        // Only border tiles (not corners inside the rect)
        if (
          (dx === -1 || dx === rect.width) ||
          (dy === -1 || dy === rect.height)
        ) {
          const tx = rect.x + dx;
          const ty = rect.y + dy;
          if (
            tx >= 0 && tx < this.GRID_COLS &&
            ty >= 0 && ty < this.GRID_ROWS &&
            !this.isBlocked(tx, ty)
          ) {
            adj.push({ x: tx, y: ty });
          }
        }
      }
    }
    return adj;
  }

  private getAdjacentToPoint(obj: { x: number, y: number }): { x: number, y: number }[] {
    const adj: { x: number, y: number }[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const tx = obj.x + dx;
        const ty = obj.y + dy;
        if (
          tx >= 0 && tx < this.GRID_COLS &&
          ty >= 0 && ty < this.GRID_ROWS &&
          !this.isBlocked(tx, ty)
        ) {
          adj.push({ x: tx, y: ty });
        }
      }
    }
    return adj;
  }

  private findNearest(type: 'tree' | 'rock' | 'lake'): { x: number, y: number } | null {
    if (type === 'tree') {
      let minDist = Infinity;
      let nearest: { x: number, y: number } | null = null;
      for (const obj of this.trees) {
        const adj = this.getAdjacentToPoint(obj);
        for (const tile of adj) {
          const dist = Math.abs(tile.x - this.player.x) + Math.abs(tile.y - this.player.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = tile;
          }
        }
      }
      return nearest;
    }
    if (type === 'rock') {
      let minDist = Infinity;
      let nearest: { x: number, y: number } | null = null;
      for (const obj of this.rocks) {
        const adj = this.getAdjacentToPoint(obj);
        for (const tile of adj) {
          const dist = Math.abs(tile.x - this.player.x) + Math.abs(tile.y - this.player.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = tile;
          }
        }
      }
      return nearest;
    }
    if (type === 'lake') {
      let minDist = Infinity;
      let nearest: { x: number, y: number } | null = null;
      const adj = this.getAdjacentTiles(this.lake);
      for (const tile of adj) {
        const dist = Math.abs(tile.x - this.player.x) + Math.abs(tile.y - this.player.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = tile;
        }
      }
      return nearest;
    }
    return null;
  }

  private performAction() {
    // Increase hunger/tiredness over time
    this.player.hunger = Math.min(100, this.player.hunger + 0.5);
    this.player.tiredness = Math.min(100, this.player.tiredness + 0.3);

    // State transitions
    if (this.player.state === 'wander') {
      this.clearPath();
      if (this.player.hunger > 70) {
        this.player.state = 'fish';
        return;
      }
      if (this.player.tiredness > 80) {
        if (!this.player.inventory.hasShelter) {
          this.player.state = 'build_shelter';
        } else if (!this.player.inventory.hasFire && this.player.inventory.wood > 0 && this.player.inventory.flint > 0) {
          this.player.state = 'rest'; // Will build fire and rest
        } else {
          // Need wood/flint for fire
          if (this.player.inventory.wood === 0) {
            this.player.state = 'gather_wood';
          } else if (this.player.inventory.flint === 0) {
            this.player.state = 'gather_flint';
          } else {
            this.player.state = 'rest';
          }
        }
        return;
      }
      // Random wander
      this.movePlayerRandomly();
      return;
    }

    if (this.player.state === 'fish') {
      // Go to a tile adjacent to the lake
      const lakeAdj = this.findNearest('lake');
      if (lakeAdj && (this.player.x !== lakeAdj.x || this.player.y !== lakeAdj.y)) {
        this.movePlayerToward(lakeAdj);
      } else {
        // At lake edge: fish
        this.clearPath();
        this.player.inventory.fish += 1;
        this.player.hunger = Math.max(0, this.player.hunger - 40);
        this.player.state = 'wander';
      }
      return;
    }

    if (this.player.state === 'gather_wood') {
      // Go to a tile adjacent to a tree
      const treeAdj = this.findNearest('tree');
      if (treeAdj && (this.player.x !== treeAdj.x || this.player.y !== treeAdj.y)) {
        this.movePlayerToward(treeAdj);
      } else if (treeAdj) {
        this.clearPath();
        this.player.inventory.wood += 1;
        this.player.state = 'wander';
      }
      return;
    }

    if (this.player.state === 'gather_flint') {
      // Go to a tile adjacent to a rock
      const rockAdj = this.findNearest('rock');
      if (rockAdj && (this.player.x !== rockAdj.x || this.player.y !== rockAdj.y)) {
        this.movePlayerToward(rockAdj);
      } else if (rockAdj) {
        this.clearPath();
        this.player.inventory.flint += 1;
        this.player.state = 'wander';
      }
      return;
    }

    if (this.player.state === 'build_shelter') {
      this.clearPath();
      // Build shelter at current position
      this.player.inventory.hasShelter = true;
      this.player.state = 'wander';
      return;
    }

    if (this.player.state === 'rest') {
      this.clearPath();
      // Build fire if needed
      if (!this.player.inventory.hasFire && this.player.inventory.wood > 0 && this.player.inventory.flint > 0) {
        this.player.inventory.hasFire = true;
        this.player.inventory.wood -= 1;
        this.player.inventory.flint -= 1;
        return;
      }
      // Rest (reduce tiredness)
      this.player.tiredness = Math.max(0, this.player.tiredness - 60);
      this.player.state = 'wander';
      return;
    }
  }

  private scheduleWander() {
    // 10x faster: 100ms to 300ms instead of 1s to 3s
    const delay = 100 + Math.random() * 200; // 0.1 to 0.3 seconds
    this.wanderTimeoutId = window.setTimeout(() => {
      this.performAction();
      this.scheduleWander();
    }, delay);
  }

  private loop = () => {
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  start() {
    this.loop();
    this.scheduleWander();
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.wanderTimeoutId !== null) {
      clearTimeout(this.wanderTimeoutId);
    }
  }
}
