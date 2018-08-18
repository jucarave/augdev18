import Instance from "./entities/Instance";
import Scene from "./Scene";
import Renderer from "./Renderer";
import Geometry from "./geometries/Geometry";
import Camera from "./entities/Camera";

abstract class Component {
    protected _instance         : Instance;
    
    public readonly code        : string;

    constructor(code: string) {
        this.code = code;
    }

    public init(scene: Scene): void { scene; }
    public update(): void {}
    public destroy(): void {}
    public render(renderer: Renderer, geometry: Geometry, camera: Camera): void { renderer; geometry; camera; }

    public setInstance(instance: Instance): Component {
        this._instance = instance;

        return this;
    }
}

export default Component;