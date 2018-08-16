import { ShaderStruct } from '../shaders/Shader';
import { createUUID } from '../Utils';
import Renderer from '../Renderer';
import Shader from '../shaders/Shader';
import Instance from '../entities/Instance';
import Camera from '../entities/Camera';
import Geometry from '../geometries/Geometry';

abstract class Material {
    protected _isOpaque                : boolean;
    protected _renderBothFaces         : boolean;
    protected _needsUpdate             : boolean;
    protected _config                  : Array<string>;
    protected _shader             : Shader;

    public readonly id                 : string;

    constructor(shader: ShaderStruct) {
        this._shader = new Shader(shader);
        
        this.id = createUUID();
        this._isOpaque = true;
        this._renderBothFaces = false;
        this._needsUpdate = false;
        this._config = [];

        this._shader.includes = this._config;
    }

    public abstract render(renderer: Renderer, instance: Instance, geometry: Geometry, camera: Camera): void;
    public abstract get isReady(): boolean;

    public get isOpaque(): boolean {
        return this._isOpaque;
    }

    public addConfig(configName: string): Material {
        if (this._config.indexOf(configName) == -1) {
            this._config.push(configName);
            this._needsUpdate = true;
        }

        return this;
    }

    public removeConfig(configName: string): Material {
        const ind = this._config.indexOf(configName);
        if (ind != -1) {
            this._config.splice(ind, 1);
            this._needsUpdate = true;
        }

        return this;
    }

    public setOpaque(opaque: boolean): Material {
        this._isOpaque = opaque;
        return this;
    }

    public setCulling(bothFaces: boolean): Material {
        this._renderBothFaces = bothFaces;
        return this;
    }

    public destroy(): void {
        this._shader.destroy();
        
        this._config = null;
        this._shader = null;
    }

    public get shader(): Shader {
        return this._shader;
    }
}

export default Material;