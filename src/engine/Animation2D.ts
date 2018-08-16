class Animation2D {
    private _frames             : Array<Array<number>>;
    private _frameIndex         : number;

    public speed                : number;

    constructor() {
        this._frames = [];
        this._frameIndex = 0;

        this.speed = 1;
    }

    public addFrame(uvs: Array<number>): Animation2D {
        this._frames.push(uvs);

        return this;
    }

    public getCurrentFrame(): Array<number> {
        return this._frames[this._frameIndex << 0];
    }

    public update(): void {
        this._frameIndex += this.speed;

        if (this._frameIndex >= this._frames.length) {
            this._frameIndex = 0;
        }
    }
}

export default Animation2D;