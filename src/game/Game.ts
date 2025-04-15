import { Player } from './Player';
import { Environment } from './Environment';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private wanderTimeoutId: number | null = null;

  private readonly GRID_ROWS = 20;
  private readonly GRID_COLS = 40;
  private readonly CELL_SIZE = 32;

  private player: Player;
  private env: Environment;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.env = new Environment();
    this.player = new Player(this.env, this.GRID_COLS, this.GRID_ROWS);
  }

  private draw() {
    // Draw background
    this.ctx.fillStyle = this.env.BG_COLOR;
    this.ctx.fillRect(0, 0, this.GRID_COLS * this.CELL_SIZE, this.GRID_ROWS * this.CELL_SIZE);

    // Draw lake
    this.ctx.fillStyle = this.env.LAKE_COLOR;
    this.ctx.fillRect(
      this.env.lake.x * this.CELL_SIZE,
      this.env.lake.y * this.CELL_SIZE,
      this.env.lake.width * this.CELL_SIZE,
      this.env.lake.height * this.CELL_SIZE
    );

    // Draw rocks
    this.ctx.fillStyle = this.env.ROCK_COLOR;
    for (const rock of this.env.rocks) {
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
    this.ctx.fillStyle = this.env.TREE_COLOR;
    for (const tree of this.env.trees) {
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
    this.ctx.fillStyle = this.env.PLAYER_COLOR;
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

  private scheduleWander() {
    const delay = 100 + Math.random() * 200; // 0.1 to 0.3 seconds
    this.wanderTimeoutId = window.setTimeout(() => {
      this.player.performAction();
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
