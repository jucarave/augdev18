import Component from "../engine/Component";
import Scene from "../engine/Scene";
import SpriteGeometry from "../engine/geometries/SpriteGeometry";
import DataManager from "../managers/DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Instance from "../engine/entities/Instance";
import Text from '../engine/entities/Text';
import CharacterComponent from './CharacterComponent';
import { Pivot } from "../engine/Utils";

class InventoryComponent extends Component {
    private _scene                      : Scene;
    private _invInst                    : Instance;
    private _labels                     : Array<Text>;
    private _cursor                     : Instance;
    private _cursorSlot                 : number;
    private _characterComponent         : CharacterComponent;

    public keys = {
        UP: 0,
        LEFT: 0,
        RIGHT: 0,
        DOWN: 0,
        ATTACK: 0
    };

    public static COMPONENT_NAME        : string = "InventoryComponent";

    constructor() {
        super(InventoryComponent.COMPONENT_NAME);

        this._labels = [];
    }

    private _createText(text: string, x: number, y: number, pivot: Pivot = 'M'): Text {
        const ret = new Text(text, "Verdana", {size: 48, pivot: pivot});
        
        this._invInst.addChild(ret);
        ret.position.x += x;
        ret.position.y += y;

        this._scene.addInstance(ret, 2);

        return ret;
    }

    private _createCursor(): void {
        const geo = new SpriteGeometry(8, 8);
        const tex = DataManager.getTexture("ui");
        const mat = new SpriteMaterial(tex);
        
        mat.uvs = [0,80/tex.height,8/tex.width,8/tex.height];

        this._cursor = new Instance(geo, mat);
        this._invInst.addChild(this._cursor);

        this._scene.addInstance(this._cursor, 2);

        this._cursor.position.add(-56, 32, 0);

        this._cursorSlot = 0;
    }

    private _createInventoryInstance(): void {
        const geo = new SpriteGeometry(128, 80);
        const tex = DataManager.getTexture("ui");
        const mat = new SpriteMaterial(tex);

        mat.uvs = [0,0,128/tex.width,80/tex.height];

        this._invInst = new Instance(geo, mat);
        this._invInst.visible = false;

        this._scene.addInstance(this._invInst, 2);

        this._createText("K: Select Item                  I: Close Inventory", 0, -32);

        for (let i=0;i<10;i++) {
            this._labels.push(this._createText("Label Item " + (i + 1), -48, 32 - i*6, 'ML'));
        }

        this._labels[0].rename("No weapon");
    }

    private _updateTextLabels(): void {
        const inventory = this._characterComponent.weapons;

        for (let i=1;i<10;i++) {
            const wInd = i - 1;

            if (inventory[wInd]) {
                this._labels[i].visible = true;
                this._labels[i].rename(inventory[wInd].name);
            } else {
                this._labels[i].visible = false;
            }
        }
    }

    private _updateActions(): void {
        if (this.keys.DOWN == 1) {
            this._cursorSlot += 1;
            this.keys.DOWN = 2;
        } else if (this.keys.UP == 1) {
            this._cursorSlot -= 1;
            this.keys.UP = 2;
        }

        if (this._cursorSlot < 0) { this._cursorSlot = this._characterComponent.weapons.length; }
        if (this._cursorSlot >= this._characterComponent.weapons.length + 1) { this._cursorSlot = 0; }

        this._cursor.position.set(-56, 32 - this._cursorSlot * 6, 0);
    }

    public switchInventory(): void {
        this._invInst.visible = !this._invInst.visible;

        const p = this._scene.getCamera(0).position;
        this._invInst.position.set(p.x, p.y, 0.0);

        if (this._invInst.visible) {
            this._updateTextLabels();
        }
    }

    public init(scene: Scene): void {
        this._scene = scene;

        this._characterComponent = this._instance.getComponent<CharacterComponent>(CharacterComponent.COMPONENT_NAME);

        this._createInventoryInstance();
        this._createCursor();
    }

    public update(): void {
        this._updateActions();
    }

    public get isOpen(): boolean {
        return this._invInst.visible;
    }
}

export default InventoryComponent;