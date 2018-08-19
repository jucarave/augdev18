import Weapon from "./Weapon";
import Instance from "../engine/entities/Instance";

class Knife extends Weapon {
    constructor() {
        super();

        this.continousAttack = false;
    }
    public attack(instance: Instance): void {
        instance;
    }
}

export default Knife;