import { Game } from './game/Game';

// Create and style the canvas
const canvas = document.createElement('canvas');
canvas.width = 40 * 32;
canvas.height = 20 * 32;
canvas.style.border = '2px solid #222';
canvas.style.imageRendering = 'pixelated';
canvas.style.display = 'block';
canvas.style.margin = 'auto';
canvas.style.background = '#388E3C';

document.body.style.background = '#222';
document.body.style.display = 'flex';
document.body.style.alignItems = 'center';
document.body.style.justifyContent = 'center';
document.body.style.height = '100vh';
document.body.style.margin = '0';

document.getElementById('root')?.appendChild(canvas);

const game = new Game(canvas);
game.start();
