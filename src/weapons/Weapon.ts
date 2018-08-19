import Scene from "../engine/Scene";

abstract class Weapon {
    public continousAttack          : boolean;

    constructor() {
        this.continousAttack = true;
    }

    public abstract attack(scene: Scene, bulletX: number, bulletY: number): void;
}

export default Weapon;