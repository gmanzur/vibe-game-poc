import { Environment } from './Environment';
import { findPath } from './Pathfinding';

type PlayerState = 'wander' | 'fish' | 'gather_wood' | 'gather_flint' | 'build_shelter' | 'rest';

export class Player {
  x: number;
  y: number;
  hunger = 0;
  tiredness = 0;
  state: PlayerState = 'wander';
  inventory = {
    wood: 0,
    flint: 0,
    fish: 0,
    hasShelter: false,
    hasFire: false,
  };

  private currentPath: { x: number, y: number }[] | null = null;

  constructor(private env: Environment, private gridCols: number, private gridRows: number) {
    this.x = Math.floor(gridCols / 2);
    this.y = Math.floor(gridRows / 2);
  }

  private getAdjacentTiles(rect: { x: number, y: number, width: number, height: number }): { x: number, y: number }[] {
    const adj: { x: number, y: number }[] = [];
    for (let dx = -1; dx <= rect.width; dx++) {
      for (let dy = -1; dy <= rect.height; dy++) {
        if ((dx === -1 || dx === rect.width) || (dy === -1 || dy === rect.height)) {
          const tx = rect.x + dx;
          const ty = rect.y + dy;
          if (
            tx >= 0 && tx < this.gridCols &&
            ty >= 0 && ty < this.gridRows &&
            !this.env.isBlocked(tx, ty)
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
          tx >= 0 && tx < this.gridCols &&
          ty >= 0 && ty < this.gridRows &&
          !this.env.isBlocked(tx, ty)
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
      for (const obj of this.env.trees) {
        const adj = this.getAdjacentToPoint(obj);
        for (const tile of adj) {
          const dist = Math.abs(tile.x - this.x) + Math.abs(tile.y - this.y);
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
      for (const obj of this.env.rocks) {
        const adj = this.getAdjacentToPoint(obj);
        for (const tile of adj) {
          const dist = Math.abs(tile.x - this.x) + Math.abs(tile.y - this.y);
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
      const adj = this.getAdjacentTiles(this.env.lake);
      for (const tile of adj) {
        const dist = Math.abs(tile.x - this.x) + Math.abs(tile.y - this.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = tile;
        }
      }
      return nearest;
    }
    return null;
  }

  private movePlayerRandomly() {
    const directions = [
      { dx: -1, dy: -1 }, { dx:  0, dy: -1 }, { dx:  1, dy: -1 },
      { dx: -1, dy:  0 },                     { dx:  1, dy:  0 },
      { dx: -1, dy:  1 }, { dx:  0, dy:  1 }, { dx:  1, dy:  1 },
    ];
    const shuffled = directions.sort(() => Math.random() - 0.5);
    for (const dir of shuffled) {
      const nx = this.x + dir.dx;
      const ny = this.y + dir.dy;
      if (
        nx >= 0 && nx < this.gridCols &&
        ny >= 0 && ny < this.gridRows &&
        !this.env.isBlocked(nx, ny)
      ) {
        this.x = nx;
        this.y = ny;
        break;
      }
    }
  }

  private movePlayerToward(target: { x: number, y: number }) {
    if (
      !this.currentPath ||
      this.currentPath.length === 0 ||
      this.currentPath[this.currentPath.length - 1].x !== target.x ||
      this.currentPath[this.currentPath.length - 1].y !== target.y
    ) {
      const path = findPath(this.env, { x: this.x, y: this.y }, target, this.gridCols, this.gridRows);
      this.currentPath = path;
    }
    if (this.currentPath && this.currentPath.length > 0) {
      if (this.currentPath[0].x === this.x && this.currentPath[0].y === this.y) {
        this.currentPath.shift();
      }
      if (this.currentPath.length > 0) {
        const next = this.currentPath[0];
        this.x = next.x;
        this.y = next.y;
        this.currentPath.shift();
      }
    }
  }

  private clearPath() {
    this.currentPath = null;
  }

  performAction() {
    this.hunger = Math.min(100, this.hunger + 0.5);
    this.tiredness = Math.min(100, this.tiredness + 0.3);

    if (this.state === 'wander') {
      this.clearPath();
      if (this.hunger > 70) {
        this.state = 'fish';
        return;
      }
      if (this.tiredness > 80) {
        if (!this.inventory.hasShelter) {
          this.state = 'build_shelter';
        } else if (!this.inventory.hasFire && this.inventory.wood > 0 && this.inventory.flint > 0) {
          this.state = 'rest';
        } else {
          if (this.inventory.wood === 0) {
            this.state = 'gather_wood';
          } else if (this.inventory.flint === 0) {
            this.state = 'gather_flint';
          } else {
            this.state = 'rest';
          }
        }
        return;
      }
      this.movePlayerRandomly();
      return;
    }

    if (this.state === 'fish') {
      const lakeAdj = this.findNearest('lake');
      if (lakeAdj && (this.x !== lakeAdj.x || this.y !== lakeAdj.y)) {
        this.movePlayerToward(lakeAdj);
      } else {
        this.clearPath();
        this.inventory.fish += 1;
        this.hunger = Math.max(0, this.hunger - 40);
        this.state = 'wander';
      }
      return;
    }

    if (this.state === 'gather_wood') {
      const treeAdj = this.findNearest('tree');
      if (treeAdj && (this.x !== treeAdj.x || this.y !== treeAdj.y)) {
        this.movePlayerToward(treeAdj);
      } else if (treeAdj) {
        this.clearPath();
        this.inventory.wood += 1;
        this.state = 'wander';
      }
      return;
    }

    if (this.state === 'gather_flint') {
      const rockAdj = this.findNearest('rock');
      if (rockAdj && (this.x !== rockAdj.x || this.y !== rockAdj.y)) {
        this.movePlayerToward(rockAdj);
      } else if (rockAdj) {
        this.clearPath();
        this.inventory.flint += 1;
        this.state = 'wander';
      }
      return;
    }

    if (this.state === 'build_shelter') {
      this.clearPath();
      this.inventory.hasShelter = true;
      this.state = 'wander';
      return;
    }

    if (this.state === 'rest') {
      this.clearPath();
      if (!this.inventory.hasFire && this.inventory.wood > 0 && this.inventory.flint > 0) {
        this.inventory.hasFire = true;
        this.inventory.wood -= 1;
        this.inventory.flint -= 1;
        return;
      }
      this.tiredness = Math.max(0, this.tiredness - 60);
      this.state = 'wander';
      return;
    }
  }
}
