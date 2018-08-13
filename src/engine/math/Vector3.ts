import Quaternion from './Quaternion';

export default class Vector3 {
    private _x                  : number;
    private _y                  : number;
    private _z                  : number;
    private _onChange           : Array<Function>;

    public readonly array                : Array<number>;

    public static readonly LEFT         = new Vector3(-1.0, 0.0, 0.0);
    public static readonly RIGHT        = new Vector3(1.0, 0.0, 0.0);
    public static readonly UP           = new Vector3(0.0, 1.0, 0.0);
    public static readonly DOWN         = new Vector3(0.0, -1.0, 0.0);
    public static readonly FORWARD      = new Vector3(0.0, 0.0, -1.0);
    public static readonly BACK         = new Vector3(0.0, 0.0, 1.0);

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this._onChange = [];
        this.array = [x, y, z];
        this.set(x, y, z);
    }

    private _callOnChange(): void {
        this.array[0] = this.x;
        this.array[1] = this.y;
        this.array[2] = this.z;

        for (let i=0,onChange;onChange=this._onChange[i];i++) {
            onChange();
        }
    }

    public clear(): Vector3 {
        this.set(0, 0, 0);

        return this;
    }

    public set(x: number, y: number, z: number): Vector3 {
        this._x = x;
        this._y = y;
        this._z = z;

        this._callOnChange();

        return this;
    }

    public add(x: number, y: number, z: number): Vector3 {
        this._x += x;
        this._y += y;
        this._z += z;

        this._callOnChange();

        return this;
    }

    public sum(vector: Vector3): Vector3 {
        this.add(vector.x, vector.y, vector.z);

        return this;
    }

    public copy(vector: Vector3): Vector3 {
        this._x = vector.x;
        this._y = vector.y;
        this._z = vector.z;

        this._callOnChange();

        return this;
    }

    public multiply(num: number): Vector3 {
        this._x *= num;
        this._y *= num;
        this._z *= num;

        this._callOnChange();

        return this;
    }

    public normalize(): Vector3 {
        let l = this.length;

        this.multiply(1 / l);

        return this;
    }

    public rotateOnQuaternion(quaternion: Quaternion): Vector3 {
        const q = quaternion.clone(),
            qInv = q.inverse,
            
            p = new Quaternion(0, this);

        qInv.multiplyQuaternion(p).multiplyQuaternion(q);

        this.copy(qInv.imaginary);

        return this;
    }

    public lerp(v: Vector3, time: number): Vector3 {
        this.set(
            this.x + (v.x - this.x) * time,
            this.y + (v.y - this.y) * time,
            this.z + (v.z - this.z) * time
        );
        
        return this;
    }

    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public equals(vector3: Vector3): boolean {
        return (this.x == vector3.x && this.y == vector3.y && this.z == vector3.z);
    }

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }

    public set x(x: number) { 
        this._x = x; 
        this._callOnChange();
    }

    public set y(y: number) { 
        this._y = y; 
        this._callOnChange();
    }

    public set z(z: number) { 
        this._z = z; 
        this._callOnChange();
    }

    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public set onChange(onChange: Function) {
        this._onChange.push(onChange);
    }

    public static cross(vectorA: Vector3, vectorB: Vector3): Vector3 {
        return new Vector3(
            vectorA.y * vectorB.z - vectorA.z * vectorB.y,
            vectorA.z * vectorB.x - vectorA.x * vectorB.z,
            vectorA.x * vectorB.y - vectorA.y * vectorB.x
        );
    }

    public static dot(vectorA: Vector3, vectorB: Vector3): number {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    }
}