import React, { useRef, useEffect } from 'react';

const GRID_ROWS = 20;
const GRID_COLS = 40;
const CELL_SIZE = 32;
const PLAYER_COLOR = '#FFD600'; // yellow
const BG_COLOR = '#388E3C'; // green

const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Player starts in the center
  const player = {
    x: Math.floor(GRID_COLS / 2),
    y: Math.floor(GRID_ROWS / 2),
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let animationFrameId: number;

    function draw() {
      if (!ctx) return;
      // Draw background
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid (optional, can be commented out)
      /*
      ctx.strokeStyle = '#222';
      for (let r = 0; r <= GRID_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * CELL_SIZE);
        ctx.lineTo(CANVAS_WIDTH, r * CELL_SIZE);
        ctx.stroke();
      }
      for (let c = 0; c <= GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CELL_SIZE, 0);
        ctx.lineTo(c * CELL_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
      }
      */

      // Draw player
      ctx.fillStyle = PLAYER_COLOR;
      ctx.fillRect(
        player.x * CELL_SIZE,
        player.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }

    function loop() {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        border: '2px solid #222',
        imageRendering: 'pixelated',
        background: BG_COLOR,
      }}
    />
  );
};

export default Game;
