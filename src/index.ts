import Game from './game.js';
import { load as loadImages } from './images.js';

window.addEventListener('load', async () => {
    await loadImages();
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')!;
    const ctx = canvas.getContext('2d')!;

    window.addEventListener('keyup', ev => {
        if (ev.key === "`") (window as any).debug = !(window as any).debug;
    });

    const game = new Game(ctx);
    game.run(0);

});
