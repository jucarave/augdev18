import Renderer from './engine/Renderer';
import SpriteGeometry from './engine/geometries/SpriteGeometry';
import Camera from './engine/entities/Camera';
import Vector3 from './engine/math/Vector3';
import Instance from './engine/entities/Instance';
import Texture from './engine/Texture';
import SpriteMaterial from './engine/materials/SpriteMaterial';

class App {
    constructor() {
        const renderer = new Renderer(854, 480);
        renderer.addCanvasToElement(document.getElementById("divGame"));

        const geo = new SpriteGeometry(32, 32);
        const tex = new Texture("img/character.png", () => {
            setTimeout(() => {
                renderer.clearCanvas(0.5, 0.5, 0.5);
                inst.render(renderer, cam);
            }, 1000);
        });
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        mat.uvs = [0,0,0.25,0.25];

        const cam = Camera.createOrthographic(854, 480, 0.1, 100.0);

        cam.position.set(0, 0, 10);
        cam.rotation.lookToDirection(new Vector3(0, 0, -10.0));
    }
}

window.onload = function() {
    new App();
};