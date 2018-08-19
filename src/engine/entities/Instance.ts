import Renderer from '../Renderer';
import Camera from './Camera';
import Geometry from '../geometries/Geometry';
import Material from '../materials/Material';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import Quaternion from '../math/Quaternion';
import { createUUID } from '../Utils';
import Component from '../Component';
import Scene from '../Scene';
import BoxCollision from '../collisions/BoxCollision';

class Instance {
    protected _geometry           : Geometry;
    protected _material           : Material;
    protected _transform          : Matrix4;
    protected _worldMatrix        : Matrix4;
    protected _destroyed          : boolean;
    protected _needsUpdate        : boolean;
    protected _parent             : Instance;
    protected _children           : Array<Instance>
    protected _globalPosition     : Vector4;
    protected _components         : Array<Component>;
    protected _scene              : Scene;

    public visible                : boolean;
    public collision              : BoxCollision;

    public readonly id                  : string;
    public readonly position            : Vector3;
    public readonly rotation            : Quaternion;
    public readonly scale               : Vector3;
    
    constructor(geometry: Geometry = null, material: Material = null) {
        this.id = createUUID();

        this._transform = Matrix4.createIdentity();
        this._worldMatrix = Matrix4.createIdentity();
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._children = [];
        this._components = [];
        this._parent = null;
        this._destroyed = false;
        this._globalPosition = new Vector4(0.0, 0.0, 0.0, 0.0);

        this.visible = true;
        this.collision = null;

        this.position = new Vector3(0.0);
        this.position.onChange = () => this.emmitNeedsUpdate();

        this.rotation = new Quaternion();
        this.rotation.onChange = () => this.emmitNeedsUpdate();

        this.scale = new Vector3(1.0, 1.0, 1.0);
        this.scale.onChange = () => this.emmitNeedsUpdate();
    }
    
    public getTransformation(): Matrix4 {
        if (!this._needsUpdate) {
            return this._transform;
        }

        this._transform.setScale(this.scale.x, this.scale.y, this.scale.z);

        this._transform.multiply(this.rotation.getRotationMatrix());

        this._transform.translate(this.position.x << 0, this.position.y << 0, this.position.z << 0);

        if (this._parent) {
            this._transform.multiply(this._parent.getTransformation());
        }

        this._needsUpdate = false;

        return this._transform;
    }

    public setScene(scene: Scene): Instance {
        this._scene = scene;

        return this;
    }

    public addComponent(component: Component): Instance {
        this._components.push(component);

        component.setInstance(this);

        return this;
    }

    public getComponent<T>(code: string): T {
        for (let i=0,comp:Component;comp=this._components[i];i++) {
            if (comp.code == code) {
                return <T>(<any>comp);
            }
        }

        return null;
    }

    public init(): void {
        for (let i=0,comp:Component;comp=this._components[i];i++) {
            comp.init(this._scene);
        }
    }

    public update(): void {
        for (let i=0,comp:Component;comp=this._components[i];i++) {
            comp.update();
        }
    }

    public destroy(): void {
        for (let i=0,comp:Component;comp=this._components[i];i++) {
            comp.destroy();
        }

        for (let i=0,child:Instance;child=this._children[i];i++) {
            child.destroy();
        }

        this._components = null;
        this._transform = null;
        this._worldMatrix = null;
        this._needsUpdate = true;
        this._geometry = null;
        this._material = null;
        this._children = null;
        this._components = null;
        this._parent = null;
        this._globalPosition = null;
        this._destroyed = true;
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (!this.visible) { return; }

        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        this._worldMatrix.copy(this.getTransformation());
        this._worldMatrix.multiply(camera.getViewMatrix());

        this._material.render(renderer, this, this._geometry, camera);

        for (let i=0,comp:Component;comp=this._components[i];i++) {
            comp.render(renderer, this._geometry, camera);
        }
    }

    public addChild(instance: Instance): void {
        instance.removeParent();

        this._children.push(instance);
        instance._parent = this;

        const p = this.position;
        instance.position.add(-p.x, -p.y, -p.z);
    }

    public removeChild(instance: Instance): boolean {
        for (let i=0,child;child=this._children[i];i++) {
            if (child.id == instance.id) {
                this._children.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    public removeParent(): void {
        if (!this._parent) { return; }

        const p = this.globalPosition;
        this.position.set(p.x, p.y, p.z);

        this.rotation.copy(this.globalRotation);

        this._parent.removeChild(this);
        this._parent = null;
    }

    public isParent(ins: Instance): boolean {
        return ins === this._parent;
    }

    public get worldMatrix(): Matrix4 {
        return this._worldMatrix;
    }

    public get geometry(): Geometry {
        return this._geometry;
    }
    
    public get material(): Material {
        return this._material;
    }

    public get isDestroyed(): boolean {
        return this._destroyed;
    }

    public get needsUpdate(): boolean {
        return this._needsUpdate;
    }

    public get globalPosition(): Vector3 {
        if (!this._parent) { return this.position; }
        
        return this._globalPosition.xyz;
    }

    public get globalRotation(): Quaternion {
        if (!this._parent) { return this.rotation; }

        return this.rotation.clone().multiplyQuaternion(this._parent.globalRotation);
    }

    public emmitNeedsUpdate(): void {
        for (let i=0,child;child=this._children[i];i++) {
            child.emmitNeedsUpdate();
        }
        
        if (this._parent) {
            this._globalPosition.set(this.position.x, this.position.y, this.position.z, 1)
            const t = this._parent.getTransformation();
            this._globalPosition = t.multiplyVector(this._globalPosition);
        }

        this._needsUpdate = true;
    }
}

export default Instance;