import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import { degToRad } from '../Utils';
import Instance from './Instance';

class Camera extends Instance {
    private _viewMatrix              : Matrix4;
    private _viewMatrixNeedsUpdate   : boolean;

    public screenSize            : Vector3;
    
    public readonly projection          : Matrix4;

    constructor(projection: Matrix4) {
        super(null, null);

        this.projection = projection;
        this._viewMatrix = Matrix4.createIdentity();

        this.screenSize = new Vector3(0.0);

        this._needsUpdate = true;
        this._viewMatrixNeedsUpdate = true;
    }

    public getViewMatrix(): Matrix4 {
        if (!this._viewMatrixNeedsUpdate) {
            return this._viewMatrix;
        }

        const p = this.globalPosition;

        this._viewMatrix.copy(Matrix4.createTranslate(-p.x, -p.y, -p.z));
        this._viewMatrix.multiply(this.globalRotation.inverse.getRotationMatrix());

        this._viewMatrixNeedsUpdate = false;

        return this._viewMatrix;
    }

    public emmitNeedsUpdate(): void {
        super.emmitNeedsUpdate();

        this._viewMatrixNeedsUpdate = true;
    }

    public static createPerspective(fovDegrees: number, ratio: number, znear: number, zfar: number): Camera {
        const fov = degToRad(fovDegrees);
        return new Camera(Matrix4.createPerspective(fov, ratio, znear, zfar));
    }

    public static createOrthographic(width: number, height: number, znear: number, zfar: number): Camera {
        let ret = new Camera(Matrix4.createOrtho(width, height, znear, zfar));
        ret.screenSize.set(width, height, 0);

        return ret;
    }
}

export default Camera;