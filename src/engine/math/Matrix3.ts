import Vector3 from '../math/Vector3';
import Matrix4 from './Matrix4';

const MATRIX_LENGTH = 9;

class Matrix3 {
    public data                 : Array<number>;
    public inUse                : boolean;

    constructor(...values: Array<number>) {
        this.data = new Array(MATRIX_LENGTH);

        if (values.length == 0) { return; }

        if (values.length != MATRIX_LENGTH) {
            throw new Error(`Matrix3 needs ${MATRIX_LENGTH} values to be created`);
        }

        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = values[i];
        }
    }

    public set(...values: Array<number>): Matrix3 {
        if (values.length != MATRIX_LENGTH) {
            throw new Error(`Matrix3 needs ${MATRIX_LENGTH} values to be created`);
        }

        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = values[i];
        }

        return this;
    }

    public copy(matrix: Matrix3): Matrix3 {
        for (let i=0;i<MATRIX_LENGTH;i++) {
            this.data[i] = matrix.data[i];
        }

        return this;
    }

    public multiply(matrixB: Matrix3): Matrix3 {
        let T: Array<number> = matrixB.data;

        let C1 = new Vector3(T[0], T[3], T[6]);
        let C2 = new Vector3(T[1], T[4], T[7]);
        let C3 = new Vector3(T[2], T[5], T[8]);

        T = this.data;
        let R1 = new Vector3(T[0], T[1], T[2]);
        let R2 = new Vector3(T[3], T[4], T[5]);
        let R3 = new Vector3(T[6], T[7], T[8]);

        this.set(
            Vector3.dot(R1, C1), Vector3.dot(R1, C2), Vector3.dot(R1, C3),
            Vector3.dot(R2, C1), Vector3.dot(R2, C2), Vector3.dot(R2, C3),
            Vector3.dot(R3, C1), Vector3.dot(R3, C2), Vector3.dot(R3, C3)
        );

        return this;
    }

    public multiplyVector(vector: Vector3): Vector3 {
        const T = this.data;

        return vector.set(
            vector.x * T[0] + vector.y * T[3] + vector.z * T[6],
            vector.x * T[1] + vector.y * T[4] + vector.z * T[7],
            vector.x * T[2] + vector.y * T[5] + vector.z * T[8]
        );
    }

    public scale(scalar: number): Matrix3 {
        const m = this.data,
            s = scalar;

        this.set(
            m[0]*s, m[1]*s, m[2]*s,
            m[3]*s, m[4]*s, m[5]*s,
            m[6]*s, m[7]*s, m[8]*s
        );

        return this;
    }

    public setScale(x: number, y: number, z: number): Matrix3 {
        this.set(
            x, 0, 0,
            0, y, 0,
            0, 0, z
        );

        return this;
    }

    public setIdentity(): Matrix3 {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );

        return this;
    }

    public printDebug(): void {
        let str: string = "";

        for (let i=0;i<MATRIX_LENGTH;i++) {
            let n = this.data[i];

            if (i % 3 == 0) { 
                str += "\n" + n.toFixed(2); 
            } else {
                str += " " + n.toFixed(2);
            }
        }

        console.log(str.trim());
    }

    public invert(): Matrix3 {
        const m = this.data,
            determinant = this.determinant;

        if (determinant == 0) return null;
        
        const m00 = m[4]*m[8]-m[5]*m[7],
            m01 = m[2]*m[7]-m[1]*m[8],
            m02 = m[1]*m[5]-m[2]*m[4],

            m10 = m[5]*m[6]-m[3]*m[8],
            m11 = m[0]*m[8]-m[2]*m[6],
            m12 = m[2]*m[3]-m[0]*m[5],

            m20 = m[3]*m[7]-m[4]*m[6],
            m21 = m[1]*m[6]-m[0]*m[7],
            m22 = m[0]*m[4]-m[1]*m[3];

        this.set(
            m00, m01, m02,
            m10, m11, m12,
            m20, m21, m22
        );
        
        this.scale(1 / determinant);
        
        return this;
    }

    public transpose(): Matrix3 {
        const m = this.data;

        this.set(
            m[0], m[3], m[6], 
            m[1], m[4], m[7], 
            m[2], m[5], m[8]
        );

        return this;
    }

    public setFromMatrix4(matrix: Matrix4): Matrix3 {
        const m = matrix.data;

        this.set(
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]
        );

        return this;
    }

    public get determinant(): number {
        const m = this.data;

        return (m[0] * m[4] * m[8]) + (m[1] * m[5] * m[6]) + (m[2] * m[3] * m[7])
            - (m[6] * m[4] * m[2]) - (m[7] * m[5] * m[0]) - (m[8] * m[3] * m[1]);
    }

    public static createIdentity(): Matrix3 {
        return new Matrix3(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    }

    public static createScale(x: number, y: number, z: number): Matrix3 {
        return new Matrix3(
            x, 0, 0,
            0, y, 0,
            0, 0, z
        );
    }

    public static createXRotation(radians: number): Matrix3 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix3(
             1, 0, 0,
             0, C,-S,
             0, S, C
        );
    }

    public static createYRotation(radians: number): Matrix3 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix3(
             C, 0,-S,
             0, 1, 0,
             S, 0, C
        );
    }

    public static createZRotation(radians: number): Matrix3 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix3(
             C,-S, 0,
             S, C, 0,
             0, 0, 1
        );
    }
}

export default Matrix3;