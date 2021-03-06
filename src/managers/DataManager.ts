import Texture from "../engine/Texture";
import { waitTexturesToLoad, loadJSON } from "../engine/Utils";

interface TexturesMap {
    [index: string]             : number;
}

interface CollisionsMap {
    [index: string]             : Array<Array<number>>;
}

class DataManager {
    private _textures           : Array<Texture>;
    private _texturesByCode     : TexturesMap;
    private _loadedSprites      : Array<string>;
    private _collisions         : CollisionsMap;

    constructor() {
        this._textures = [];
        this._texturesByCode = {};
        this._collisions = {};
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

    private _loadTexture(url: string): void {
        const tex = new Texture(url);

        const spriteCode = url.replace("img/", "").replace(".png", "");

        this._texturesByCode[spriteCode] = this._textures.length;
        this._textures.push(tex);
        this._loadedSprites.push(url);
    }

    private _parseLevels(levelData: any): void {
        for (let i in levelData) {
            const level = levelData[i];
            this._loadTexture(level.img);

            this._collisions[i] = level.collisions;
        }
    }

    public loadGameData(callback: Function): void {
        loadJSON("data/gameData.json", (data: any) => {
            const charactersData = data.characters;
            this._loadedSprites = [];
            this._textures = [];

            this._parseLevels(data.levels);
            this._loadTexture(data.ui);

            for (let i in charactersData) {

                const chara = charactersData[i],
                    ind = this._loadedSprites.indexOf(chara.spriteIndex);

                if (ind == -1) {
                    const tex = new Texture(chara.spriteIndex, () => {});

                    this._loadedSprites.push(chara.spriteIndex);
                    this._textures.push(tex);
                }
            }

            waitTexturesToLoad(this._textures, () => {
                for (let i in charactersData) {
                    const chara = charactersData[i],
                        ind = this._loadedSprites.indexOf(chara.spriteIndex);
    
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

    public getCollisions(code: string): Array<Array<number>> {
        return this._collisions[code];
    }
}

export default new DataManager();