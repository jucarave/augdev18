import SpriteGeometry from "../engine/geometries/SpriteGeometry";
import DataManager from "./DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Instance from "../engine/entities/Instance";
import CharacterComponent from "../components/CharacterComponent";
import PlayerComponent from "../components/PlayerComponent";
import BoxCollision from "../engine/collisions/BoxCollision";
import Knife from "../weapons/Knife";

class CharactersManager {
    private _createCharacter(code: string, cloth: string): Instance {
        const geo = new SpriteGeometry(16, 16, 'BM');
        const tex = DataManager.getTexture("characters");
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);

        inst.collision = new BoxCollision(inst, 10, 4, 'BM');
        
        const characterComponent = new CharacterComponent(code);
        characterComponent.cloth = cloth;
        inst.addComponent(characterComponent);

        return inst;
    }

    public createGunman(cloth: string = 'classicCloth'): Instance {
        const inst = this._createCharacter("gunman", cloth);

        inst.addComponent(new PlayerComponent());

        const characterComponent = inst.getComponent<CharacterComponent>(CharacterComponent.COMPONENT_NAME),
            knife = new Knife();

        characterComponent.addWeapon(knife);
        characterComponent.equipWeapon(knife);

        return inst;
    }

    public createCivilian(cloth: string = 'civilianCloth'): Instance {
        const inst = this._createCharacter("civilian", cloth);

        return inst;
    }
}

export default new CharactersManager;