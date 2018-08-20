import Component from "../engine/Component";
import Input, { Callback } from "../engine/Input";
import CharacterComponent from "./CharacterComponent";
import InventoryComponent from "./InventoryComponent";

type KEYS = 'UP' | 'LEFT' | 'DOWN' | 'RIGHT' | 'ATTACK';

class PlayerComponent extends Component {
    private _callbacks                  : Array<Callback>;
    private _characterComponent         : CharacterComponent;
    private _inventoryComponent         : InventoryComponent;

    public static COMPONENT_NAME        : string = "PlayerComponent";

    constructor() {
        super(PlayerComponent.COMPONENT_NAME);

        this._callbacks = [];
    }

    private _keycodeToName(keyCode: number): KEYS {
        if (keyCode == 65) { return 'LEFT'; } else 
        if (keyCode == 87) { return 'UP'; } else 
        if (keyCode == 68) { return 'RIGHT'; } else 
        if (keyCode == 83) { return 'DOWN'; } else
        if (keyCode == 75) { return 'ATTACK'; }
    }

    private _handleKeydown(ev: KeyboardEvent): void {
        const key = this._keycodeToName(ev.keyCode);

        if (this._inventoryComponent.isOpen) {
            if (this._inventoryComponent.keys[key] == 2) { return; }

            this._inventoryComponent.keys[key] = 1;
        } else {
            if (this._characterComponent.keys[key] == 2) { return; }

            this._characterComponent.keys[key] = 1;
        }
    }

    private _handleKeyup(ev: KeyboardEvent): void {
        if (ev.keyCode == 73) {
            this._inventoryComponent.switchInventory();
            return;
        }

        const key = this._keycodeToName(ev.keyCode);
        if (this._inventoryComponent.isOpen) {
            this._inventoryComponent.keys[key] = 0;
        } else {
            this._characterComponent.keys[key] = 0;
        }
    }

    public init(): void {
        this._inventoryComponent = this._instance.getComponent<InventoryComponent>(InventoryComponent.COMPONENT_NAME);
        this._characterComponent = this._instance.getComponent<CharacterComponent>(CharacterComponent.COMPONENT_NAME);

        this._callbacks.push(Input.onKeyDown((ev: KeyboardEvent) => this._handleKeydown(ev) ));
        this._callbacks.push(Input.onKeyUp((ev: KeyboardEvent) => this._handleKeyup(ev) ));
    }

    public destroy(): void {
        for (let i=0,call:Callback;call=this._callbacks[i];i++) {
            Input.removeCallback(call);
        }
    }
}

export default PlayerComponent;