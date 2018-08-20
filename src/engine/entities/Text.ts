import Texture from '../Texture';
import SpriteMaterial from '../materials/SpriteMaterial';
import SpriteGeometry from '../geometries/SpriteGeometry';
import Vector3 from '../math/Vector3';
import Quaternion from '../math/Quaternion';
import { roundUpPowerOf2, Pivot } from '../Utils';
import Instance from './Instance';

export interface TextOptions {
    size?: number;
    stroke?: boolean;
    fill?: boolean;
    fillColor?: string;
    strokeColor?: string;
    position?: Vector3;
    rotation?: Quaternion;
    pivot?: Pivot
}

const OptionsDefault: TextOptions = {
    size: 12,
    stroke: false,
    fill: true,
    fillColor: '#FFFFFF',
    strokeColor: '#FFFFFF',
    position: new Vector3(0.0, 0.0, 0.0),
    rotation: new Quaternion(),
    pivot: 'M'
};

class Text extends Instance {
    private _text               : string;
    private _font               : string;
    private _options            : TextOptions;
    private _texture            : Texture;
    
    constructor(text: string, font: string, options?: TextOptions) {
        super();

        this._text = text;
        this._font = font;
        this._material = new SpriteMaterial(null);
        this._options = this._mergeOptions(options);

        this._printText();

        this.position.copy(this._options.position);
        this.rotation.copy(this._options.rotation);
    }

    private _mergeOptions(options: TextOptions): TextOptions {
        if (!options) { return OptionsDefault; }

        if (!options.size) { options.size = OptionsDefault.size; }
        if (!options.stroke) { options.stroke = OptionsDefault.stroke; }
        if (!options.fill) { options.fill = OptionsDefault.fill; }
        if (!options.fillColor) { options.fillColor = OptionsDefault.fillColor; }
        if (!options.strokeColor) { options.strokeColor = OptionsDefault.strokeColor; }
        if (!options.position) { options.position = OptionsDefault.position; }
        if (!options.rotation) { options.rotation = OptionsDefault.rotation; }

        return options;
    }

    private _printText(): void {
        const canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        ctx.font = this._options.size + "px " + this._font;
        
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        let size = ctx.measureText(this._text);

        canvas.width = roundUpPowerOf2(size.width);
        canvas.height = roundUpPowerOf2(this._options.size);
        ctx.font = this._options.size + "px " + this._font;

        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        if (this._options.fill) {
            ctx.fillStyle = this._options.fillColor;
            ctx.fillText(this._text, 4, this._options.size);
        }

        if (this._options.stroke) {
            ctx.strokeStyle = this._options.strokeColor;
            ctx.strokeText(this._text, 4, this._options.size);
        }

        const uvs = [0, 0, (size.width + 4) / canvas.width, (this._options.size + 8) / canvas.height],
            texture = new Texture(canvas),
            material = <SpriteMaterial>this._material,
            geometry = new SpriteGeometry(size.width / 10, this._options.size / 10, this._options.pivot);

        material.texture = texture;
        material.uvs = [uvs[0], uvs[1], uvs[2], uvs[3]];
        material.setOpaque(false);

        this._texture = texture;

        this._geometry = geometry;
    }

    public rename(text: string): void {
        this._text = text;

        this._texture.destroy();

        this._printText();
    }
}

export default Text;