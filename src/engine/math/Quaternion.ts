import { default as Vector3 } from './Vector3';
import Matrix4 from './Matrix4';

class Quaternion {
    private _s                   : number;
    private _imaginary           : Vector3;
    private _axisX               : Vector3;
    private _axisY               : Vector3;
    private _axisZ               : Vector3;
    private _rotationMatrix      : Matrix4;
    
    public _onChange             : Array<Function>;
    public local                 : boolean;

    constructor(scalar: number = 1, imaginary: Vector3 = new Vector3(0, 0, 0)) {
        this._s = scalar;
        this._imaginary = imaginary;

        this._axisX = Vector3.RIGHT.clone();
        this._axisY = Vector3.DOWN.clone();
        this._axisZ = Vector3.BACK.clone();

        this._rotationMatrix = Matrix4.createIdentity();

        this._onChange = [];

        this.local = false;
    }

    private _callOnChange(): void {
        for (let i=0,onChange;onChange=this._onChange[i];i++) {
            onChange();
        }
    }

    public copy(q: Quaternion): Quaternion {
        this._s = q.s;
        this._imaginary.copy(q.imaginary);

        return this;
    }

    public sum(q: Quaternion): Quaternion {
        this._s += q.s;
        this._imaginary.sum(q.imaginary);

        this._callOnChange();

        return this;
    }

    public multiplyScalar(s: number): Quaternion {
        this._s *= s;
        this._imaginary.multiply(s);

        this._callOnChange();

        return this;
    }

    public multiplyQuaternion(q: Quaternion): Quaternion {
        const sA = this.s,
            sB = q.s,
            
            imaginaryB = q.imaginary.clone(),
            
            cross = Vector3.cross(this.imaginary, q.imaginary);

        this._s = sA * sB - Vector3.dot(this._imaginary, imaginaryB);

        this._imaginary.multiply(sB).sum(imaginaryB.multiply(sA)).sum(cross);

        this._callOnChange();

        return this;
    }

    public normalize(): Quaternion {
        const norm = this.norm;
        if (norm != 0) {
            this.multiplyScalar(1 / this.norm);
        }

        this._callOnChange();

        return this;
    }

    public rotateX(radians: number): Quaternion {
        const axis = (this.local)? this._axisX : Vector3.RIGHT,
            rotation = Quaternion.createRotationOnAxis(radians, axis);

        this.multiplyQuaternion(rotation);
        this._axisY.rotateOnQuaternion(rotation).normalize();
        this._axisZ.rotateOnQuaternion(rotation).normalize();

        return this;
    }

    public rotateY(radians: number): Quaternion {
        const axis = (this.local)? this._axisY : Vector3.DOWN,
            rotation = Quaternion.createRotationOnAxis(radians, axis);

        this.multiplyQuaternion(rotation);
        this._axisX.rotateOnQuaternion(rotation).normalize();
        this._axisZ.rotateOnQuaternion(rotation).normalize();

        return this;
    }

    public rotateZ(radians: number): Quaternion {
        const axis = (this.local)? this._axisZ : Vector3.BACK,
            rotation = Quaternion.createRotationOnAxis(radians, axis);

        this.multiplyQuaternion(rotation);
        this._axisX.rotateOnQuaternion(rotation).normalize();
        this._axisY.rotateOnQuaternion(rotation).normalize();

        return this;
    }

    public getRotationMatrix(): Matrix4 {
        const ret = this._rotationMatrix.setIdentity(),
        
            qx = this._imaginary.x,
            qy = this._imaginary.y,
            qz = this._imaginary.z,
            qw = this._s,
            
            m11 = 1 - 2*qy*qy - 2*qz*qz,        m12 = 2*qx*qy - 2*qz*qw,        m13 = 2*qx*qz + 2*qy*qw,
            m21 = 2*qx*qy + 2*qz*qw,            m22 = 1 - 2*qx*qx - 2*qz*qz,    m23 = 2*qy*qz - 2*qx*qw,
            m31 = 2*qx*qz - 2*qy*qw,            m32 = 2*qy*qz + 2*qx*qw,        m33 = 1 - 2*qx*qx - 2*qy*qy;

        ret.set(
            m11, m12, m13, 0,
            m21, m22, m23, 0,
            m31, m32, m33, 0,
              0,   0,   0, 1
        );

        return ret;
    }

    public setIdentity(): Quaternion {
        this._s = 1;
        this._imaginary.multiply(0);

        this._axisX.copy(Vector3.RIGHT);
        this._axisY.copy(Vector3.DOWN);
        this._axisZ.copy(Vector3.BACK);

        this._callOnChange();

        return this;
    }
    
    public lookToDirection(direction: Vector3): void {
        let directionNormal = direction.clone().normalize();

        const pitch = Math.asin(directionNormal.y);
        const yaw = Math.atan2(-directionNormal.z, directionNormal.x);

        this.setIdentity();

        this.rotateY(yaw-Math.PI/2);
        this.rotateX(-pitch);
    }

    public slerp(q: Quaternion, time: number): Quaternion {
        const im = this._imaginary;

        let qIm = q.imaginary,
            cosHalfTheta = this._s * q.s + Vector3.dot(im, qIm);

        if (Math.abs(cosHalfTheta) >= 1.0) {
            return this;
        }

        if (cosHalfTheta < 0.0) {
            q = q.clone().multiplyScalar(-1);
            qIm = q.imaginary;
            cosHalfTheta = -cosHalfTheta;
        }

        const halfTheta = Math.acos(cosHalfTheta),
            sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta*cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {
            this._s = this._s * 0.5 + q.s * 0.5;
            this._imaginary.set(
                im.x * 0.5 + qIm.x * 0.5,
                im.y * 0.5 + qIm.y * 0.5,
                im.z * 0.5 + qIm.z * 0.5
            );

            return this;
        }

        const ratioA = Math.sin((1 - time) * halfTheta) / sinHalfTheta,
            ratioB = Math.sin(time * halfTheta) / sinHalfTheta;

        this._s = this._s * ratioA + q.s * ratioB;
        this._imaginary.set(
            im.x * ratioA + qIm.x * ratioB,
            im.y * ratioA + qIm.y * ratioB,
            im.z * ratioA + qIm.z * ratioB
        );

        return this;
    }

    public clone(): Quaternion {
        return new Quaternion(this._s, this._imaginary.clone());
    }

    public get norm(): number {
        const s2 = this._s * this._s,
            v2 = Vector3.dot(this._imaginary, this._imaginary);

        return Math.sqrt(s2 + v2);
    }

    public get conjugate(): Quaternion {
        return new Quaternion(this._s, this._imaginary.clone().multiply(-1));
    }

    public get inverse(): Quaternion {
        const norm = this.norm;
        return this.conjugate.multiplyScalar( 1 / (norm * norm));
    }

    public get s(): number { return this._s; }
    public set s(s: number) {
        this._s = s;
        this._callOnChange();
    }

    public get imaginary(): Vector3 { return this._imaginary; }

    public set onChange(onChange: Function) {
        this._onChange.push(onChange);
    }

    public static createRotationOnAxis(radians: number, axis: Vector3): Quaternion {
        const angle = radians * 0.5,
            ret = new Quaternion(radians, axis.clone().normalize());

        ret.s = Math.cos(angle);
        ret.imaginary.multiply(Math.sin(angle));

        return ret;
    }
}

export default Quaternion;