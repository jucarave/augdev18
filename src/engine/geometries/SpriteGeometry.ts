import Geometry from './Geometry';

class SpriteGeometry extends Geometry {
    constructor(width: number, height: number) {
        super();

        this._buildGeometry(width, height);
    }

    private _buildGeometry(width: number, height: number): void {
        const w = width / 2.0,
            h = height / 2.0;

        this.addVertice(-w, -h, 0.0);
        this.addVertice( w, -h, 0.0);
        this.addVertice(-w,  h, 0.0);
        this.addVertice( w,  h, 0.0);

        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);

        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);
    }

}

export default SpriteGeometry;