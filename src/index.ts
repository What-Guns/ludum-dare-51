import Game from './game.js';
import { load as loadImages } from './images.js';

window.addEventListener('load', async () => {
    await loadImages();
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')!;
    const ctx = canvas.getContext('2d')!;


    const game = new Game(ctx);
    game.run(0);
});
