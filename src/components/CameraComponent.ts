import Component from "../engine/Component";
import Instance from "../engine/entities/Instance";

class CameraComponent extends Component {
    private _player                     : Instance;

    public static COMPONENT_NAME        : string = "CameraComponent";

    constructor(player: Instance) {
        super(CameraComponent.COMPONENT_NAME);

        this._player = player;
    }

    public update(): void {
        const p = this._player.position,
            x = Math.floor(p.x / 192) * 192 + 96,
            y = Math.floor((p.y + 8) / 108) * 108 + 54;

        this._instance.position.set(x, y, this._instance.position.z);
    }
}

export default CameraComponent;