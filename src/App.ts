import Renderer from './engine/Renderer';
import DataManager from './managers/DataManager';
import Level1 from './levels/Level1';

class App {
    private _renderer           : Renderer;

    constructor() {
        this._renderer = new Renderer(960, 540);
        this._renderer.addCanvasToElement(document.getElementById("divGame"));

        DataManager.loadGameData(() => {
            this._newGame();
        });
    }

    private _newGame(): void {
        const level1 = new Level1();

        level1.init();

        this._loopGame(level1);
    }

    private _loopGame(level: Level1): void {
        const renderer = this._renderer;

        renderer.clearCanvas(0.5, 0.5, 0.5);
        level.render(this._renderer);

        requestAnimationFrame(() => { this._loopGame(level); })
    }
}

window.onload = function() {
    new App();
};