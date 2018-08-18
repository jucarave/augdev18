import Component from "../engine/Component";
import Instance from "../engine/entities/Instance";
import SpriteGeometry from "../engine/geometries/SpriteGeometry";
import DataManager from "../DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Scene from "../engine/Scene";

type Face = 'D' | 'R' | 'L' | 'U';

class CharacterComponent extends Component {
    private _material                   : SpriteMaterial;
    private _characterCode              : string;
    private _clothMat                   : SpriteMaterial;
    private _clothInst                  : Instance;
    private _clothCode                  : string;
    private _action                     : string;
    private _face                       : Face;
    private _scene                      : Scene;

    public keys = {
        UP: 0,
        LEFT: 0,
        RIGHT: 0,
        DOWN: 0
    };

    public static COMPONENT_NAME        : string = "CharacterComponent";

    constructor(characterCode: string) {
        super(CharacterComponent.COMPONENT_NAME);

        this._face = "D";
        this._action = "stand";
        this._characterCode = characterCode;
        this._clothCode = null;

        this._createCloths();
    }

    private _createCloths(): void {
        const geo = new SpriteGeometry(16, 16);
        const tex = DataManager.getTexture("characters");
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        inst.visible = false;

        this._clothMat = mat;
        this._clothInst = inst;
    }

    private _getFacingDirection(hor: number, ver: number): string {
        if (ver > 0) { this._face = "U"; } else 
        if (hor > 0) { this._face = "R"; } else 
        if (hor < 0) { this._face = "L"; } else 
        if (ver < 0) { this._face = "D"; }

        return this._face;
    }

    private _getAnimationCode(prefix: string, action: string): string {
        return prefix + action + this._face;
    }

    private _updateMovement(): void {
        const hor = this.keys.RIGHT - this.keys.LEFT,
            ver = this.keys.UP - this.keys.DOWN;
            
        let x = 0.0,
            y = 0.0;

        this._action = "stand";

        if (hor != 0.0) {
            x = hor * 0.5;
            this._action = "walk";
        } else if (ver != 0.0) {
            y = ver * 0.5;
            this._action = "walk";
        }

        this._instance.position.add(x, y, 0);
        this._getFacingDirection(x, y);
    }

    public init(scene: Scene): void {
        this._material = <SpriteMaterial>this._instance.material;

        this._scene = scene;

        this._instance.addChild(this._clothInst);
        this._scene.addInstance(this._clothInst);
    }

    public update(): void {
        super.update();

        this._updateMovement();

        this._material.playAnimation(this._getAnimationCode(this._characterCode, this._action));

        if (this._clothCode) {
            this._clothMat.playAnimation(this._getAnimationCode(this._clothCode, this._action));
        }
    }

    public set cloth(clothCode: string) {
        this._clothCode = clothCode;

        this._clothInst.visible = (clothCode !== null);
    }
}

export default CharacterComponent;