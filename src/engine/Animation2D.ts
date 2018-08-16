class Animation2D {
    private _frames             : Array<Array<number>>;

    public speed                : number;

    constructor() {
        this._frames = [];
        this.speed = 1.0;
    }

    public addFrame(uvs: Array<number>): Animation2D {
        this._frames.push(uvs);

        return this;
    }

    public getFrame(frameIndex: number): Array<number> {
        return this._frames[frameIndex << 0];
    }

    public get length(): number {
        return this._frames.length;
    }
}

export default Animation2D;