import Instance from "./entities/Instance";
import Renderer from "./Renderer";
import Camera from "./entities/Camera";
import List from "./List";

class Scene {
    private _instances           : List<Instance>;

    public beforeRender          : Function;

    constructor() {
        this._instances = new List();

        this.beforeRender = null;
    }

    public addInstance(instance: Instance): Scene {
        this._instances.push(instance);
        instance.setScene(this);

        return this;
    }

    public getCollision(instance: Instance): Instance {
        let node = this._instances.head;

        while (node) {
            const inst: Instance = node.item;
            if (inst.id !== instance.id && inst.collision && inst.collision.overlaps(instance.collision)) {
                return inst;
            }

            node = node.next;
        }

        return null;
    }

    public init(): Scene {
        this._instances.each((ins: Instance) => {
            ins.init();
        });

        return this;
    }

    public render(renderer: Renderer, camera: Camera): Scene {
        let renderInst = this._instances;

        this._instances.each((ins: Instance) => {
            ins.update();
        });

        if (this.beforeRender !== null) {
            renderInst = this.beforeRender(this._instances);
        }

        this._instances.each((ins: Instance) => {
            if (ins.isDestroyed) {
                renderInst.remove(ins);
                return;
            }

            ins.render(renderer, camera);
        });

        return this;
    }
}

export default Scene;