import Vector4 from './Vector4';
import Quaternion from './Quaternion';
import Vector3 from './Vector3';

const MATRIX_LENGTH = 16;

class Matrix4 {
    public data                 : Array<number>;
    public inUse                : boolean;

    constructor(...values: Array<number>) {
        this.data = new Array(MATRIX_LENGTH);

        if (values.length == 0) { return; }

        if (values.length != MATRIX_LENGTH) {
            throw new Error(`Matrix4 needs ${MATRIX_LENGTH} values to be created`);
        }

        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = values[i];
        }
    }

    public set(...values: Array<number>): Matrix4 {
        if (values.length != MATRIX_LENGTH) {
            throw new Error(`Matrix4 needs ${MATRIX_LENGTH} values to be created`);
        }

        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = values[i];
        }

        return this;
    }

    public copy(matrix: Matrix4): Matrix4 {
        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = matrix.data[i];
        }

        return this;
    }

    public multiply(matrixB: Matrix4): Matrix4 {
        let T: Array<number> = matrixB.data;

        let C1 = new Vector4(T[0], T[4], T[8], T[12]);
        let C2 = new Vector4(T[1], T[5], T[9], T[13]);
        let C3 = new Vector4(T[2], T[6], T[10], T[14]);
        let C4 = new Vector4(T[3], T[7], T[11], T[15]);

        T = this.data;
        let R1 = new Vector4(T[0], T[1], T[2], T[3]);
        let R2 = new Vector4(T[4], T[5], T[6], T[7]);
        let R3 = new Vector4(T[8], T[9], T[10], T[11]);
        let R4 = new Vector4(T[12], T[13], T[14], T[15]);

        this.set(
            Vector4.dot(R1, C1), Vector4.dot(R1, C2), Vector4.dot(R1, C3), Vector4.dot(R1, C4),
            Vector4.dot(R2, C1), Vector4.dot(R2, C2), Vector4.dot(R2, C3), Vector4.dot(R2, C4),
            Vector4.dot(R3, C1), Vector4.dot(R3, C2), Vector4.dot(R3, C3), Vector4.dot(R3, C4),
            Vector4.dot(R4, C1), Vector4.dot(R4, C2), Vector4.dot(R4, C3), Vector4.dot(R4, C4)
        );

        return this;
    }

    public multiplyVector(vector: Vector4): Vector4 {
        const T = this.data;

        return vector.set(
            vector.x * T[0] + vector.y * T[4] + vector.z * T[8] + vector.w * T[12],
            vector.x * T[1] + vector.y * T[5] + vector.z * T[9] + vector.w * T[13],
            vector.x * T[2] + vector.y * T[6] + vector.z * T[10] + vector.w * T[14],
            vector.x * T[3] + vector.y * T[7] + vector.z * T[11] + vector.w * T[15]
        );
    }

    public scale(scalar: number): Matrix4 {
        const m = this.data,
            s = scalar;

        this.set(
            m[0]*s, m[1]*s, m[2]*s, m[3]*s,
            m[4]*s, m[5]*s, m[6]*s, m[7]*s,
            m[8]*s, m[9]*s, m[10]*s, m[11]*s,
            m[12]*s, m[13]*s, m[14]*s, m[15]*s
        );

        return this;
    }

    public translate(x: number, y: number, z: number = 0, relative: boolean = false): Matrix4 {
        if (relative) {
            this.data[12] += x;
            this.data[13] += y;
            this.data[14] += z;
        } else {
            this.data[12] = x;
            this.data[13] = y;
            this.data[14] = z;
        }

        return this;
    }

    public setScale(x: number, y: number, z: number): Matrix4 {
        this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );

        return this;
    }

    public setIdentity(): Matrix4 {
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        return this;
    }

    public printDebug(): void {
        let str: string = "";

        for (let i=0;i<MATRIX_LENGTH;i++) {
            let n = this.data[i];

            if (i % 4 == 0) { 
                str += "\n" + n.toFixed(4); 
            } else {
                str += " " + n.toFixed(4);
            }
        }

        console.log(str.trim());
    }

    public invert(): Matrix4 {
        const m = this.data,
            determinant = this.determinant;

        if (determinant == 0) return null;

        const m00 = m[4+2]*m[8+3]*m[12+1] - m[4+3]*m[8+2]*m[12+1] + m[4+3]*m[8+1]*m[12+2] - m[4+1]*m[8+3]*m[12+2] - m[4+2]*m[8+1]*m[12+3] + m[4+1]*m[8+2]*m[12+3],
            m01 = m[3]*m[8+2]*m[12+1] - m[2]*m[8+3]*m[12+1] - m[3]*m[8+1]*m[12+2] + m[1]*m[8+3]*m[12+2] + m[2]*m[8+1]*m[12+3] - m[1]*m[8+2]*m[12+3],
            m02 = m[2]*m[4+3]*m[12+1] - m[3]*m[4+2]*m[12+1] + m[3]*m[4+1]*m[12+2] - m[1]*m[4+3]*m[12+2] - m[2]*m[4+1]*m[12+3] + m[1]*m[4+2]*m[12+3],
            m03 = m[3]*m[4+2]*m[8+1] - m[2]*m[4+3]*m[8+1] - m[3]*m[4+1]*m[8+2] + m[1]*m[4+3]*m[8+2] + m[2]*m[4+1]*m[8+3] - m[1]*m[4+2]*m[8+3],
            m10 = m[4+3]*m[8+2]*m[12] - m[4+2]*m[8+3]*m[12] - m[4+3]*m[8]*m[12+2] + m[4]*m[8+3]*m[12+2] + m[4+2]*m[8]*m[12+3] - m[4]*m[8+2]*m[12+3],
            m11 = m[2]*m[8+3]*m[12] - m[3]*m[8+2]*m[12] + m[3]*m[8]*m[12+2] - m[0]*m[8+3]*m[12+2] - m[2]*m[8]*m[12+3] + m[0]*m[8+2]*m[12+3],
            m12 = m[3]*m[4+2]*m[12] - m[2]*m[4+3]*m[12] - m[3]*m[4]*m[12+2] + m[0]*m[4+3]*m[12+2] + m[2]*m[4]*m[12+3] - m[0]*m[4+2]*m[12+3],
            m13 = m[2]*m[4+3]*m[8] - m[3]*m[4+2]*m[8] + m[3]*m[4]*m[8+2] - m[0]*m[4+3]*m[8+2] - m[2]*m[4]*m[8+3] + m[0]*m[4+2]*m[8+3],
            m20 = m[4+1]*m[8+3]*m[12] - m[4+3]*m[8+1]*m[12] + m[4+3]*m[8]*m[12+1] - m[4]*m[8+3]*m[12+1] - m[4+1]*m[8]*m[12+3] + m[4]*m[8+1]*m[12+3],
            m21 = m[3]*m[8+1]*m[12] - m[1]*m[8+3]*m[12] - m[3]*m[8]*m[12+1] + m[0]*m[8+3]*m[12+1] + m[1]*m[8]*m[12+3] - m[0]*m[8+1]*m[12+3],
            m22 = m[1]*m[4+3]*m[12] - m[3]*m[4+1]*m[12] + m[3]*m[4]*m[12+1] - m[0]*m[4+3]*m[12+1] - m[1]*m[4]*m[12+3] + m[0]*m[4+1]*m[12+3],
            m23 = m[3]*m[4+1]*m[8] - m[1]*m[4+3]*m[8] - m[3]*m[4]*m[8+1] + m[0]*m[4+3]*m[8+1] + m[1]*m[4]*m[8+3] - m[0]*m[4+1]*m[8+3],
            m30 = m[4+2]*m[8+1]*m[12] - m[4+1]*m[8+2]*m[12] - m[4+2]*m[8]*m[12+1] + m[4]*m[8+2]*m[12+1] + m[4+1]*m[8]*m[12+2] - m[4]*m[8+1]*m[12+2],
            m31 = m[1]*m[8+2]*m[12] - m[2]*m[8+1]*m[12] + m[2]*m[8]*m[12+1] - m[0]*m[8+2]*m[12+1] - m[1]*m[8]*m[12+2] + m[0]*m[8+1]*m[12+2],
            m32 = m[2]*m[4+1]*m[12] - m[1]*m[4+2]*m[12] - m[2]*m[4]*m[12+1] + m[0]*m[4+2]*m[12+1] + m[1]*m[4]*m[12+2] - m[0]*m[4+1]*m[12+2],
            m33 = m[1]*m[4+2]*m[8] - m[2]*m[4+1]*m[8] + m[2]*m[4]*m[8+1] - m[0]*m[4+2]*m[8+1] - m[1]*m[4]*m[8+2] + m[0]*m[4+1]*m[8+2];
        
        this.set(
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        );

        this.scale(1 / determinant);

        return this;
    }

    public transpose(): Matrix4 {
        const m = this.data;

        this.set(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        );

        return this;
    }

    public getQuaternion(): Quaternion {
        const q = new Quaternion(),
            m = this.data,
            tr = m[0] + m[5] + m[10];

        if (tr > 0) { 
            const S = Math.sqrt(tr+1.0) * 2;
            q.s = 0.25 * S;
            q.imaginary.set(
                (m[8+1] - m[4+2]) / S,
                (m[0+2] - m[8+0]) / S, 
                (m[4+0] - m[0+1]) / S
            ); 
        } else if ((m[0] > m[4+1]) && (m[0] > m[8+2])) { 
            const S = Math.sqrt(1.0 + m[0] - m[4+1] - m[8+2]) * 2;
            q.s = (m[8+1] - m[4+2]) / S;
            q.imaginary.set(
                0.25 * S,
                (m[1] + m[4]) / S,
                (m[2] + m[8]) / S
            );
        } else if (m[4+1] > m[8+2]) { 
            const S = Math.sqrt(1.0 + m[4+1] - m[0] - m[8+2]) * 2;
            q.s = (m[2] - m[8]) / S;
            q.imaginary.set(
                (m[1] + m[4]) / S, 
                0.25 * S,
                (m[4+2] + m[8+1]) / S
            );
        } else { 
            const S = Math.sqrt(1.0 + m[8+2] - m[0] - m[4+1]) * 2;
            q.s = (m[4] - m[1]) / S;
            q.imaginary.set(
                (m[2] + m[8]) / S,
                (m[4+2] + m[8+1]) / S,
                0.25 * S
            );
        }

        return q;
    }

    public getTranslation(): Vector3 {
        const m = this.data;

        return new Vector3(
            m[12],
            m[13],
            m[14]
        );
    }

    public get determinant(): number {
        const m = this.data;

        return m[3]*m[4+2]*m[8+1]*m[12] - m[2]*m[4+3]*m[8+1]*m[12] - m[3]*m[4+1]*m[8+2]*m[12] + m[1]*m[4+3]*m[8+2]*m[12]+
        m[2]*m[4+1]*m[8+3]*m[12] - m[1]*m[4+2]*m[8+3]*m[12] - m[3]*m[4+2]*m[8]*m[12+1] + m[2]*m[4+3]*m[8]*m[12+1]+
        m[3]*m[4]*m[8+2]*m[12+1] - m[0]*m[4+3]*m[8+2]*m[12+1] - m[2]*m[4]*m[8+3]*m[12+1] + m[0]*m[4+2]*m[8+3]*m[12+1]+
        m[3]*m[4+1]*m[8]*m[12+2] - m[1]*m[4+3]*m[8]*m[12+2] - m[3]*m[4]*m[8+1]*m[12+2] + m[0]*m[4+3]*m[8+1]*m[12+2]+
        m[1]*m[4]*m[8+3]*m[12+2] - m[0]*m[4+1]*m[8+3]*m[12+2] - m[2]*m[4+1]*m[8]*m[12+3] + m[1]*m[4+2]*m[8]*m[12+3]+
        m[2]*m[4]*m[8+1]*m[12+3] - m[0]*m[4+2]*m[8+1]*m[12+3] - m[1]*m[4]*m[8+2]*m[12+3] + m[0]*m[4+1]*m[8+2]*m[12+3];
    }

    public static createIdentity(): Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    public static createScale(x: number, y: number, z: number): Matrix4 {
        return new Matrix4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    }

    public static createOrtho(width: number, height: number, znear: number, zfar: number): Matrix4 {
        let l = -width / 2.0,
            r = width / 2.0,
            b = -height / 2.0,
            t = height / 2.0,
            
            A = 2.0 / (r - l),
            B = 2.0 / (t - b),
            C = -2 / (zfar - znear),
            
            X = -(r + l) / (r - l),
            Y = -(t + b) / (t - b),
            Z = -(zfar + znear) / (zfar - znear);

        return new Matrix4(
            A, 0, 0, 0,
            0, B, 0, 0,
            0, 0, C, 0,
            X, Y, Z, 1
        );
    }

    public static createPerspective(fov: number, ratio: number, znear: number, zfar: number): Matrix4 {
        let S = 1 / Math.tan(fov / 2),
            R = S * ratio,
            A = -(zfar) / (zfar - znear),
            B = -(zfar * znear) / (zfar - znear);
        
        return new Matrix4(
            S, 0, 0,  0,
            0, R, 0,  0,
            0, 0, A, -1,
            0, 0, B,  0
        );
    }

    public static createTranslate(x: number, y: number, z: number): Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
    }

    public static createXRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             1, 0, 0, 0,
             0, C,-S, 0,
             0, S, C, 0,
             0, 0, 0, 1
        );
    }

    public static createYRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             C, 0,-S, 0,
             0, 1, 0, 0,
             S, 0, C, 0,
             0, 0, 0, 1
        );
    }

    public static createZRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             C,-S, 0, 0,
             S, C, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1
        );
    }

    public static createFromArray(data: Array<number>): Matrix4 {
        const d = data;
        return new Matrix4(
            d[0], d[1], d[2], d[3],
            d[4], d[5], d[6], d[7],
            d[8], d[9], d[10], d[11],
            d[12], d[13], d[14], d[15]
        );
    }
}

export default Matrix4;