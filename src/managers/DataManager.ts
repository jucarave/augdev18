import Texture from "../engine/Texture";
import { waitTexturesToLoad, loadJSON } from "../engine/Utils";

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

    private _parseAnimations(tex: Texture, code: string, animationsData: any) {
        const spriteSize = 16;
        
        for (let j in animationsData) {
            const anim = tex.createAnimation(code + j),
                frames = animationsData[j];

            anim.speed = frames[0];
            for (let k=1,frame;frame=frames[k];k++) {
                const x = frame[0] * spriteSize,
                    y = frame[1] * spriteSize;

                anim.addFrame([
                    x / tex.width,
                    y / tex.height,
                    spriteSize / tex.width,
                    spriteSize / tex.height
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
    
                    this._parseAnimations(this._textures[ind], i, chara.animations);

                    const spriteCode = chara.spriteIndex.replace("img/", "").replace(".png", "");

                    if (this._texturesByCode[spriteCode] === undefined) {
                        this._texturesByCode[spriteCode] = ind;
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