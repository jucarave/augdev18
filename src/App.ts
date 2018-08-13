import Renderer from './engine/Renderer';
import SpriteGeometry from './engine/geometries/SpriteGeometry';
import Material from './engine/materials/Material';
import MainShader from './engine/shaders/MainShader';
import Camera from './engine/entities/Camera';
import Vector3 from './engine/math/Vector3';
import Instance from './engine/entities/Instance';

class App {
    constructor() {
        const renderer = new Renderer(854, 480);
        renderer.addCanvasToElement(document.getElementById("divGame"));

        const geo = new SpriteGeometry(32, 32);
        const mat = new Material(MainShader);
        const inst = new Instance(geo, mat);

        const cam = Camera.createOrthographic(854, 480, 0.1, 100.0);

        cam.position.set(0, 0, 10);
        cam.rotation.lookToDirection(new Vector3(0, 0, -10.0));

        renderer.clearCanvas();
        inst.render(renderer, cam);
    }
}

window.onload = function() {
    new App();
};