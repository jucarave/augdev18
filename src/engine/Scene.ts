import Instance from "./entities/Instance";
import Renderer from "./Renderer";
import Camera from "./entities/Camera";

class Scene {
    private _instances           : Array<Instance>;

    constructor() {
        this._instances = [];
    }

    public addInstance(instance: Instance): Scene {
        this._instances.push(instance);

        return this;
    }

    public render(renderer: Renderer, camera: Camera): Scene {
        let i: number,
            ins: Instance;

        for (i=0;ins=this._instances[i];i++) {
            ins.update();
        }

        for (i=0;ins=this._instances[i];i++) {
            ins.render(renderer, camera);
        }

        return this;
    }
}

export default Scene;