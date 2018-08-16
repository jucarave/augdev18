import Renderer from './Renderer';
import Vector4 from './math/Vector4';
import {createUUID } from './Utils';
import Animation2D from './Animation2D';

interface RendererTextureMap {
    [index: string]             : WebGLTexture;
}

interface AnimationMap {
    [index: string]             : Animation2D;
}

class Texture {
    private _src               : string;
    private _img               : HTMLImageElement;
    private _canvas            : HTMLCanvasElement;
    private _imageData         : ImageData;
    private _ready             : boolean;
    private _textureMap        : RendererTextureMap;
    private _animations        : AnimationMap;

    public readonly id         : string;

    constructor(src: string|HTMLCanvasElement|ImageData, callback?: Function) {
        this.id = createUUID();

        this._textureMap = {};
        this._animations = {};
        this._ready = false;
        
        if ((<HTMLCanvasElement>src).getContext) {
            this._canvas = <HTMLCanvasElement>src;
            this._img = null;
            this._imageData = null;
            this._src = null;

            this._ready = true;
        } else if ((<ImageData>src).data) {
            this._imageData = <ImageData>src;
            this._canvas = null;
            this._img = null;
            this._src = null;

            this._ready = true;
        } else {
            this._canvas = null;
            this._imageData = null;
            this._src = <string>src;

            this._img = new Image();
            this._img.src = this._src;
            this._img.onload = () => {
                this._ready = true;
    
                if (callback) {
                    callback(this);
                }
            };
        }
    }

    private _parseTexture(renderer: Renderer): void {
        const gl = renderer.GL;

        if (!this._textureMap[renderer.id]) {
            this._textureMap[renderer.id] = gl.createTexture();
        }

        const texture = this._textureMap[renderer.id];

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas || this._img || this._imageData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public getUVS(x: number|Vector4, y?: number, w?: number, h?: number): Vector4 {
        let _x: number;

        if ((<Vector4>x).length !== undefined) {
            _x = (<Vector4>x).x;
            y = (<Vector4>x).y;
            w = (<Vector4>x).z;
            h = (<Vector4>x).w;
        }

        return new Vector4(
            _x / this.width,
            y / this.height,
            w / this.width,
            h / this.height
        );
    }

    public getTexture(renderer: Renderer): WebGLTexture {
        if (!this._textureMap[renderer.id]) {
            this._parseTexture(renderer);
        }

        return this._textureMap[renderer.id];
    }

    public plotPixel(x: number, y: number, color: Vector4): Texture {
        if (this._imageData == null) { throw new Error("Can only plot to a imageData texture"); }

        const ind = (x + y * this._imageData.width) * 4;
        
        this._imageData.data[ind] = color.x;
        this._imageData.data[ind + 1] = color.y;
        this._imageData.data[ind + 2] = color.z;
        this._imageData.data[ind + 3] = color.w;

        return this;
    }

    public createAnimation(code: string): Animation2D {
        const animation = new Animation2D();
        this._animations[code] = animation;

        return animation;
    }

    public getAnimation(code: string): Animation2D {
        if (!this._animations[code]) { throw new Error("Animation [" + code + "] not found!"); }

        return this._animations[code];
    }

    public get isReady(): boolean {
        return this._ready;
    }

    public get width(): number {
        if (this._canvas) {
            return this._canvas.width;
        } else if (this._imageData) {
            return this._imageData.width;
        } else {
            return this._img.width;
        }
    }

    public get height(): number {
        if (this._canvas) {
            return this._canvas.height;
        } else if (this._imageData) {
            return this._imageData.height;
        } else {
            return this._img.height;
        }
    }

    public static createDataTexture(width: number, height: number): Texture {
        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d"),
            data = ctx.createImageData(width, height);

        return new Texture(data);
    }
}

export default Texture;