export class Environment {
  readonly BG_COLOR = '#388E3C';
  readonly LAKE_COLOR = '#2196F3';
  readonly ROCK_COLOR = '#757575';
  readonly TREE_COLOR = '#2E7D32';
  readonly PLAYER_COLOR = '#FFD600';

  readonly lake = { x: 5, y: 5, width: 4, height: 2 };
  readonly rocks = [
    { x: 10, y: 8 },
    { x: 12, y: 15 },
    { x: 25, y: 10 },
    { x: 30, y: 18 },
  ];
  readonly trees = [
    { x: 7, y: 3 },
    { x: 15, y: 12 },
    { x: 20, y: 5 },
    { x: 35, y: 16 },
    { x: 38, y: 2 },
  ];

  isBlocked(x: number, y: number): boolean {
    // Lake
    if (
      x >= this.lake.x &&
      x < this.lake.x + this.lake.width &&
      y >= this.lake.y &&
      y < this.lake.y + this.lake.height
    ) {
      return true;
    }
    // Rocks
    for (const rock of this.rocks) {
      if (rock.x === x && rock.y === y) return true;
    }
    // Trees
    for (const tree of this.trees) {
      if (tree.x === x && tree.y === y) return true;
    }
    return false;
  }
}
