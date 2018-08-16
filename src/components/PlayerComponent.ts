import Component from "../engine/Component";

class PlayerComponent extends Component {
    public static COMPONENT_NAME        : string = "PlayerComponent";

    constructor() {
        super(PlayerComponent.COMPONENT_NAME);
    }

    update() {
        super.update();
    }
}

export default PlayerComponent;