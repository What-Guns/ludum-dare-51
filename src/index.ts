import Game from './game.js';
window.addEventListener('load', () => {
    const canvas: HTMLCanvasElement = document.querySelector('#canvas')!;
    const ctx = canvas.getContext('2d')!;


    const game = new Game(ctx);
    game.run(0);
});
