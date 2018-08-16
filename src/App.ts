import Renderer from './engine/Renderer';
import SpriteGeometry from './engine/geometries/SpriteGeometry';
import Camera from './engine/entities/Camera';
import Vector3 from './engine/math/Vector3';
import Instance from './engine/entities/Instance';
import SpriteMaterial from './engine/materials/SpriteMaterial';
import Scene from './engine/Scene';
import DataManager from './DataManager';

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
        const geo = new SpriteGeometry(16, 16);
        const tex = DataManager.getTexture("gunmanClassic");
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        mat.playAnimation("standR");

        const cam = Camera.createOrthographic(192, 108, 0.1, 100.0);

        cam.position.set(0, 0, 10);
        cam.rotation.lookToDirection(new Vector3(0, 0, -10.0));

        const scene = new Scene();
        scene.addInstance(inst);

        this._loopGame(cam, scene);
    }

    private _loopGame(cam: Camera, scene: Scene): void {
        const renderer = this._renderer;

        renderer.clearCanvas(0.5, 0.5, 0.5);
        scene.render(renderer, cam);

        requestAnimationFrame(() => { this._loopGame(cam, scene); })
    }
}

window.onload = function() {
    new App();
};