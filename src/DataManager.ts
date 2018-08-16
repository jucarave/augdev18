import Texture from "./engine/Texture";
import { waitTexturesToLoad, loadJSON } from "./engine/Utils";

interface TexturesMap {
    [index: string]             : number;
}

class DataManager {
    private _textures           : Array<Texture>;
    private _texturesByCode     : TexturesMap;

    constructor() {
        this._textures = [];
        this._texturesByCode = {};
    }

    private _parseAnimations(tex: Texture, animationsData: any) {
        for (let j in animationsData) {
            const anim = tex.createAnimation(j),
                frames = animationsData[j];

            for (let k=0,frame;frame=frames[k];k++) {
                anim.addFrame([
                    frame[0] / tex.width,
                    frame[1] / tex.height,
                    frame[2] / tex.width,
                    frame[3] / tex.height
                ]);
            }
        }
    };

    public loadGameData(callback: Function): void {
        loadJSON("data/gameData.json", (data: any) => {
            const charactersData = data.characters;
            let loadedSprites: Array<string> = [];

            this._textures = [];

            for (let i in charactersData) {
                const chara = charactersData[i],
                    ind = loadedSprites.indexOf(chara.spriteIndex);

                if (ind == -1) {
                    const tex = new Texture(chara.spriteIndex, () => {});

                    loadedSprites.push(chara.spriteIndex);
                    this._textures.push(tex);
                }
            }

            waitTexturesToLoad(this._textures, () => {
                for (let i in charactersData) {
                    const chara = charactersData[i],
                        ind = loadedSprites.indexOf(chara.spriteIndex);
    
                    this._parseAnimations(this._textures[ind], chara.animations);

                    if (this._texturesByCode[chara.code] === undefined) {
                        this._texturesByCode[chara.code] = ind;
                    }
                }

                callback();
            });
        });
    }

    public getTexture(code: string): Texture {
        if (this._texturesByCode[code] === undefined) { throw new Error("Texture [" + code + "] not found!"); }

        return this._textures[this._texturesByCode[code]];
    }
}

export default new DataManager();