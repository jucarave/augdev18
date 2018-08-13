import { VERTICE_SIZE } from '../Constants';
import Renderer from '../Renderer';

interface BufferMap {
    vertexBuffer?               : WebGLBuffer;
    texCoordsBuffer?            : WebGLBuffer;
    indexBuffer?                : WebGLBuffer;
    glContext                   : WebGLRenderingContext;
}

interface RendererBufferMap {
    [index: string] : BufferMap;
}

class Geometry {
    private _vertices                : Array<number>;
    private _triangles               : Array<number>;
    private _texCoords               : Array<number>;
    private _buffers                 : RendererBufferMap;
    private _indexLength             : number;
    private _boundingBox             : Array<number>;
    
    constructor() {
        this._vertices = [];
        this._texCoords = [];
        this._triangles = [];
        this._buffers = {};
        this._boundingBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    }

    public addVertice(x: number, y: number, z: number): Geometry {
        this._vertices.push(x, y, z);

        // Calculate bounding box
        this._boundingBox = [
            Math.min(this._boundingBox[0], x),
            Math.min(this._boundingBox[1], y),
            Math.min(this._boundingBox[2], z),
            Math.max(this._boundingBox[3], x),
            Math.max(this._boundingBox[4], y),
            Math.max(this._boundingBox[5], z)
        ];

        return this;
    }
    
    public addTexCoord(x: number, y: number): Geometry {
        this._texCoords.push(x, y);
        return this;
    }

    public addTriangle(vert1: number, vert2: number, vert3: number): Geometry {
        if (this._vertices[vert1 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert1 + "] not found!")}
        if (this._vertices[vert2 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert2 + "] not found!")}
        if (this._vertices[vert3 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert3 + "] not found!")}

        this._triangles.push(vert1, vert2, vert3);

        return this;
    }

    public build(renderer: Renderer): void {
        const gl = renderer.GL,
            bufferMap: BufferMap = { glContext: gl };

        bufferMap.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);

        if (this._triangles.length > 0) {
            bufferMap.texCoordsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);
        }

        bufferMap.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._triangles), gl.STATIC_DRAW);

        this._indexLength = this._triangles.length;

        this._buffers[renderer.id] = bufferMap;
    }

    public destroy(): void {
        for (let i in this._buffers){
            const bufferMap = this._buffers[i],
                gl = bufferMap.glContext;

            gl.deleteBuffer(bufferMap.vertexBuffer);
            gl.deleteBuffer(bufferMap.texCoordsBuffer);
            gl.deleteBuffer(bufferMap.indexBuffer);
        }
    }

    public getBuffer(renderer: Renderer): BufferMap {
        if (!this._buffers[renderer.id]) {
            this.build(renderer);
        }

        return this._buffers[renderer.id];
    }

    public get boundingBox(): Array<number> {
        return this._boundingBox;
    }

    public get indexLength(): number {
        return this._indexLength;
    }
}

export default Geometry;