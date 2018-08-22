import Instance from "./entities/Instance";
import Renderer from "./Renderer";
import Camera from "./entities/Camera";
import List from "./List";

class Scene {
    private _instances           : Array<List<Instance>>;
    private _cameras             : Array<Camera>;
    private _levelCollisions     : Array<Array<number>>;

    public beforeRender          : Function;

    constructor() {
        this._instances = [];
        this._cameras = [];
        this._levelCollisions = null;

        this.beforeRender = null;
    }

    public addInstance(instance: Instance, layer: number = 1): Scene {
        if (!this._instances[layer]) {
            this._instances[layer] = new List();
        }

        this._instances[layer].push(instance);
        instance.setScene(this);

        return this;
    }

    public setLevelCollisions(collisions: Array<Array<number>>): Scene {
        this._levelCollisions = collisions;

        return this;
    }

    public collidesWithLevel(instance: Instance): boolean {
        for (let i=0,col:Array<number>;col=this._levelCollisions[i];i++) {
            if (instance.collision.overlapsArray(col)) {
                return true;
            }
        }

        return false;
    }

    public getCollision(instance: Instance, layer: number = 1): Instance {
        let node = this._instances[layer].head;

        while (node) {
            const inst: Instance = node.item;
            if (inst.id !== instance.id && inst.collision && inst.collision.overlaps(instance.collision)) {
                return inst;
            }

            node = node.next;
        }

        return null;
    }

    public addCamera(index: number, camera: Camera): void {
        this._cameras[index] = camera;
    }

    public getCamera(index: number): Camera {
        return this._cameras[index];
    }

    public init(): Scene {
        for (let i=0;i<this._instances.length;i++) {
            const layer = this._instances[i];
            if (!layer) { continue; }
            
            layer.each((ins: Instance) => {
                ins.init();
            });
        }

        return this;
    }

    public render(renderer: Renderer, camera: Camera): Scene {
        let renderInst: List<Instance> = null;

        for (let i=0;i<this._instances.length;i++) {
            const layer = this._instances[i];
            if (!layer) { continue; }

            layer.each((ins: Instance) => {
                ins.update();
            });
        }

        for (let i=0;i<this._instances.length;i++) {
            let layer = this._instances[i];
            if (!layer) { continue; }

            if (this.beforeRender !== null) {
                layer = this.beforeRender(layer, i);
            } 

            layer.each((ins: Instance) => {
                if (ins.isDestroyed) {
                    renderInst.remove(ins);
                    return;
                }
    
                ins.render(renderer, camera);
            });
        
        }

        return this;
    }
}

export default Scene;