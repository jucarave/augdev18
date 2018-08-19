import Component from "../engine/Component";
import DataManager from "../managers/DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Renderer from "../engine/Renderer";
import Geometry from "../engine/geometries/Geometry";
import Camera from "../engine/entities/Camera";
import Scene from "../engine/Scene";
import Weapon from "../weapons/Weapon";

type Face = 'D' | 'R' | 'L' | 'U';
type Action = 'stand' | 'walk' | 'attack';

class CharacterComponent extends Component {
    private _scene                      : Scene;
    private _material                   : SpriteMaterial;
    private _characterCode              : string;
    private _clothMat                   : SpriteMaterial;
    private _clothCode                  : string;
    private _action                     : Action;
    private _face                       : Face;
    private _weapons                    : Array<Weapon>;
    private _currentWeapon              : Weapon;
    private _actionBusy                 : number;
    
    private _health                     : number;

    public keys = {
        UP: 0,
        LEFT: 0,
        RIGHT: 0,
        DOWN: 0,
        ATTACK: 0
    };

    public static COMPONENT_NAME        : string = "CharacterComponent";

    constructor(characterCode: string) {
        super(CharacterComponent.COMPONENT_NAME);

        this._face = "D";
        this._action = "stand";
        this._characterCode = characterCode;
        this._clothCode = null;
        this._weapons = [];
        this._currentWeapon = null;
        this._actionBusy = 0;

        this._health = 5;

        this._createCloths();
    }

    private _createCloths(): void {
        const tex = DataManager.getTexture("characters");
        const mat = new SpriteMaterial(tex);

        this._clothMat = mat;
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
        if (this._actionBusy > 0) { return; }

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
        if (this._scene.getCollision(this._instance)) {
            this._instance.position.add(-x, -y, 0);
            this._action = "stand";
        }

        this._getFacingDirection(x, y);
    }

    private _updateAttack(): void {
        if (this._actionBusy > 0) { return; }
        if (!this._currentWeapon) { return; }

        if (this.keys.ATTACK == 1) {
            let x = this._instance.position.x,
                y = this._instance.position.y;

            if (this._face == "R") { x += 16; } else if (this._face == "L") { x -= 16; }
            if (this._face == "U") { y += 8; } else if (this._face == "D") { y -= 4; }

            this._action = "attack";
            this._currentWeapon.attack(this._scene, x, y);
            
            this._actionBusy = 15;

            if (!this._currentWeapon.continousAttack) {
                this.keys.ATTACK = 2;
            }
        }
    }

    public addWeapon(weapon: Weapon): void {
        this._weapons.push(weapon);
    }

    public addDamage(damage: number): void {
        this._health -= damage;

        if (this._health < 0) {
            this._instance.collision = null;

            this._material.playAnimation(this._characterCode + "dead");

            if (this._clothCode) {
                this._clothMat.playAnimation(this._clothCode + "dead");
            }
        }
    }

    public equipWeapon(weapon: Weapon): void {
        this._currentWeapon = weapon;
    }

    public init(scene: Scene): void {
        this._scene = scene;
        this._material = <SpriteMaterial>this._instance.material;
    }

    public update(): void {
        super.update();

        if (this._health < 0) { return; }
        if (this._actionBusy > 0) { this._actionBusy -= 1; }

        this._updateAttack();
        this._updateMovement();

        this._material.playAnimation(this._getAnimationCode(this._characterCode, this._action));

        if (this._clothCode) {
            this._clothMat.playAnimation(this._getAnimationCode(this._clothCode, this._action));
        }
    }

    public render(renderer: Renderer, geometry: Geometry, camera: Camera): void {
        if (!this._clothCode) { return; }
        this._clothMat.render(renderer, this._instance, geometry, camera);
    }

    public set cloth(clothCode: string) {
        this._clothCode = clothCode;
    }

    public get weapons(): Array<Weapon> {
        return this._weapons;
    }

    public get face(): Face {
        return this._face;
    }
}

export default CharacterComponent;