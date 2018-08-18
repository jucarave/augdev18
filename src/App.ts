import Renderer from './engine/Renderer';
import Camera from './engine/entities/Camera';
import Vector3 from './engine/math/Vector3';
import Scene from './engine/Scene';
import DataManager from './managers/DataManager';
import CharactersManager from './managers/CharactersManager';
import Instance from './engine/entities/Instance';
import List from './engine/List';

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
        const cam = Camera.createOrthographic(192, 108, 0.1, 100.0);

        cam.position.set(0, 0, 10);
        cam.rotation.lookToDirection(new Vector3(0, 0, -10.0));

        const scene = new Scene();

        const inst = CharactersManager.createGunman();
        scene.addInstance(inst);

        const civ = CharactersManager.createCivilian();
        civ.position.x = 80;
        civ.position.y = 32;
        scene.addInstance(civ);

        scene.init();

        scene.beforeRender = (instances: List<Instance>) => {
            
            instances.sort((insA: Instance, insB: Instance) => {
                const depthA = insA.globalPosition,
                    depthB = insB.globalPosition;

                return depthA.y-depthA.z > depthB.y-depthB.z;
            });

            return instances;
        };

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