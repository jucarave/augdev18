import SpriteGeometry from "../engine/geometries/SpriteGeometry";
import DataManager from "../managers/DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Instance from "../engine/entities/Instance";
import Scene from "../engine/Scene";
import Camera from "../engine/entities/Camera";
import Renderer from "../engine/Renderer";
import CharactersManager from "../managers/CharactersManager";
import List from "../engine/List";
import Vector3 from "../engine/math/Vector3";
import CameraComponent from "../components/CameraComponent";

class Level1 {
    private _scene              : Scene;
    private _camera             : Camera;
    private _player             : Instance;

    constructor() {
        this._scene = new Scene();

        this._buildLevelGeometry();
        this._populate();
        this._createCamera();
        this._loadCollisions();

        this._scene.beforeRender = (instances: List<Instance>, layer: number) => {
            if (layer != 1) { return instances; }
            
            instances.sort((insA: Instance, insB: Instance) => {
                const depthA = insA.globalPosition,
                    depthB = insB.globalPosition;

                return depthA.y-depthA.z > depthB.y-depthB.z;
            });

            return instances;
        };
    }

    private _loadCollisions(): void {
        const collisions = DataManager.getCollisions("level_1");

        this._scene.setLevelCollisions(collisions);
    }

    private _createCamera(): void {
        this._camera = Camera.createOrthographic(192, 108, 0.1, 100.0);

        const cameraComponent = new CameraComponent(this._player);
        this._camera.addComponent(cameraComponent);

        this._camera.position.set(96, 54, 10);
        this._camera.rotation.lookToDirection(new Vector3(0, 0, -10.0));

        this._scene.addCamera(0, this._camera);
    }

    private _buildLevelGeometry(): void {
        const tex = DataManager.getTexture("level1");
        const geo = new SpriteGeometry(tex.width, tex.height, 'TL');
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        inst.position.y = tex.height;

        this._scene.addInstance(inst, 0);
    }

    private _populate(): void {
        const gunman = CharactersManager.createGunman();
        gunman.position.set(135, 489, 0);
        this._scene.addInstance(gunman);
        this._player = gunman;

        const civ = CharactersManager.createCivilian();
        civ.position.x = 80;
        civ.position.y = 32;
        this._scene.addInstance(civ);
    }

    public init(): void {
        this._camera.init();
        
        this._scene.init();
    }

    public render(renderer: Renderer): void {
        this._camera.update();

        this._scene.render(renderer, this._camera);
    }
}

export default Level1;