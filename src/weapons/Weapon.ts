import Scene from "../engine/Scene";

abstract class Weapon {
    public continousAttack          : boolean;
    public readonly name            : string;

    constructor(name: string) {
        this.continousAttack = true;

        this.name = name;
    }

    public abstract attack(scene: Scene, bulletX: number, bulletY: number): void;
}

export default Weapon;