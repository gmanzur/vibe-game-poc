export class Game {
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;

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
  }

  private loop = () => {
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  start() {
    this.loop();
  }

  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
