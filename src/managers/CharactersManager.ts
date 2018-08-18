import SpriteGeometry from "../engine/geometries/SpriteGeometry";
import DataManager from "./DataManager";
import SpriteMaterial from "../engine/materials/SpriteMaterial";
import Instance from "../engine/entities/Instance";
import CharacterComponent from "../components/CharacterComponent";
import PlayerComponent from "../components/PlayerComponent";

class CharactersManager {
    private _createCharacter(code: string, cloth: string): Instance {
        const geo = new SpriteGeometry(16, 16, 'BM');
        const tex = DataManager.getTexture("characters");
        const mat = new SpriteMaterial(tex);
        const inst = new Instance(geo, mat);
        
        const characterComponent = new CharacterComponent(code);
        characterComponent.cloth = cloth;
        inst.addComponent(characterComponent);

        return inst;
    }

    public createGunman(cloth: string = 'classicCloth'): Instance {
        const inst = this._createCharacter("gunman", cloth);

        inst.addComponent(new PlayerComponent());

        return inst;
    }

    public createCivilian(cloth: string = 'civilianCloth'): Instance {
        const inst = this._createCharacter("civilian", cloth);

        return inst;
    }
}

export default new CharactersManager;