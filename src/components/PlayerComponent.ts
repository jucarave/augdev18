import Component from "../engine/Component";
import Input, { Callback } from "../engine/Input";
import SpriteMaterial from "../engine/materials/SpriteMaterial";

type KEYS = 'UP' | 'LEFT' | 'DOWN' | 'RIGHT';

class PlayerComponent extends Component {
    private _callbacks                  : Array<Callback>;
    private _material                   : SpriteMaterial;
    private _face                       : string;
    private _keys = {
        UP: 0,
        LEFT: 0,
        RIGHT: 0,
        DOWN: 0
    };

    public static COMPONENT_NAME        : string = "PlayerComponent";

    constructor() {
        super(PlayerComponent.COMPONENT_NAME);

        this._callbacks = [];
        this._face = "D";
    }

    private _keycodeToName(keyCode: number): KEYS {
        if (keyCode == 65) { return 'LEFT'; } else 
        if (keyCode == 87) { return 'UP'; } else 
        if (keyCode == 68) { return 'RIGHT'; } else 
        if (keyCode == 83) { return 'DOWN'; }
    }

    private _getFacingDirection(hor: number, ver: number): string {
        if (ver > 0) { this._face = "U"; } else 
        if (hor > 0) { this._face = "R"; } else 
        if (hor < 0) { this._face = "L"; } else 
        if (ver < 0) { this._face = "D"; }

        return this._face;
    }

    private _handleKeydown(ev: KeyboardEvent): void {
        const key = this._keycodeToName(ev.keyCode);
        this._keys[key] = 1;
    }

    private _handleKeyup(ev: KeyboardEvent): void {
        const key = this._keycodeToName(ev.keyCode);
        this._keys[key] = 0;
    }

    private _updateMovement(): void {
        const hor = this._keys.RIGHT - this._keys.LEFT,
            ver = this._keys.UP - this._keys.DOWN;
            
        let action = "stand",
            x = 0.0,
            y = 0.0;

        if (hor != 0.0) {
            x = hor * 0.5;
            action = "walk";
        } else if (ver != 0.0) {
            y = ver * 0.5;
            action = "walk";
        }

        this._instance.position.add(x, y, 0);

        this._material.playAnimation(action + this._getFacingDirection(x, y));
    }

    public init(): void {
        this._material = <SpriteMaterial>this._instance.material;

        this._callbacks.push(Input.onKeyDown((ev: KeyboardEvent) => this._handleKeydown(ev) ));
        this._callbacks.push(Input.onKeyUp((ev: KeyboardEvent) => this._handleKeyup(ev) ));
    }

    public update(): void {
        super.update();

        this._updateMovement();
    }

    public destroy(): void {
        for (let i=0,call:Callback;call=this._callbacks[i];i++) {
            Input.removeCallback(call);
        }
    }
}

export default PlayerComponent;