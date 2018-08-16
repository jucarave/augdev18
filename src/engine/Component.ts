import Instance from "./entities/Instance";

abstract class Component {
    protected _instance         : Instance;
    
    public readonly code        : string;

    constructor(code: string) {
        this.code = code;
    }

    public init(): void {}
    public update(): void {}
    public destroy(): void {}

    public setInstance(instance: Instance): Component {
        this._instance = instance;

        return this;
    }
}

export default Component;