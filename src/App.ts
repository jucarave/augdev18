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

        const geo = new SpriteGeometry(16, 16);
        const tex = new Texture("img/character.png", () => {
            this.loopGame(renderer, cam, inst);
        });
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        const anim = tex.createAnimation("walkD");
        anim.addFrame([0.00,0,0.25,0.25]);
        anim.addFrame([0.25,0,0.25,0.25]);
        anim.addFrame([0.50,0,0.25,0.25]);
        anim.addFrame([0.75,0,0.25,0.25]);
        anim.speed = 1 / 10;
        tex.playAnimation("walkD");

        const cam = Camera.createOrthographic(192, 108, 0.1, 100.0);

        cam.position.set(0, 0, 10);
        cam.rotation.lookToDirection(new Vector3(0, 0, -10.0));
    }

    loopGame(renderer: Renderer, cam: Camera, inst: Instance) {
        renderer.clearCanvas(0.5, 0.5, 0.5);
        inst.render(renderer, cam);

        requestAnimationFrame(() => { this.loopGame(renderer, cam, inst); })
    }
}

window.onload = function() {
    new App();
};