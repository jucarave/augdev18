import Weapon from "./Weapon";
import Instance from "../engine/entities/Instance";
import BoxCollision from "../engine/collisions/BoxCollision";
import Scene from "../engine/Scene";
import CharacterComponent from "../components/CharacterComponent";

class Knife extends Weapon {
    private _bullet             : Instance;

    constructor() {
        super("Knife");

        this._bullet = new Instance(null, null);
        this._bullet.collision = new BoxCollision(this._bullet, 3, 3);

        this.continousAttack = false;
    }

    public attack(scene: Scene, x: number, y: number): void {
        this._bullet.position.set(x, y, 0);

        const coll = scene.getCollision(this._bullet);

        if (coll) {
            const characterComponent = coll.getComponent<CharacterComponent>(CharacterComponent.COMPONENT_NAME);
            
            if (characterComponent) {
                characterComponent.addDamage(3);
            }
        }
    }
}

export default Knife;