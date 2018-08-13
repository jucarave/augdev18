import Vector3 from './Vector3';
import Matrix4 from './Matrix4';

type gimbalOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZYX' | 'ZXY';

class Euler extends Vector3 {
    private _matrix         : Matrix4;
    private _needsUpdate    : boolean;

    public order            : gimbalOrder;

    constructor(order: gimbalOrder = 'ZYX') {
        super(0, 0, 0);

        this.order = order;
        this._matrix = Matrix4.createIdentity();

        this.onChange = () => this._needsUpdate = true;
    }

    public getRotationMatrix(): Matrix4 {
        if (!this._needsUpdate) {
            return this._matrix;
        }

        this._matrix.setIdentity();

        for (let i=0;i<3;i++) {
            const axis = this.order.charAt(i);

            if (axis == 'X') {
                this._matrix.multiply(Matrix4.createXRotation(this.x));
            } else if (axis == 'Y') {
                this._matrix.multiply(Matrix4.createYRotation(this.y));
            } else if (axis == 'Z') {
                this._matrix.multiply(Matrix4.createZRotation(this.z));
            }
        }

        return this._matrix;
    }

    public lookToDirection(direction: Vector3): void {
        let directionNormal = direction.clone().normalize();

        const pitch = Math.asin(directionNormal.y);
        const yaw = Math.atan2(-directionNormal.z, directionNormal.x);

        this.y = yaw;
        this.z = -pitch;
    }
}

export default Euler;