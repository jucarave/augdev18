import Instance from "../engine/entities/Instance";

abstract class Weapon {
    public continousAttack          : boolean;

    constructor() {
        this.continousAttack = true;
    }

    public abstract attack(instance: Instance): void;
}

export default Weapon;