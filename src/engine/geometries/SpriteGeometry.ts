import Geometry from './Geometry';

type Pivot = 'TL' | 'TM' | 'TR' | 'ML' | 'M' | 'MR' | 'BL' | 'BM' | 'BR';

class SpriteGeometry extends Geometry {
    constructor(width: number, height: number, pivot: Pivot = 'M') {
        super();

        this._buildGeometry(width, height, pivot);
    }

    private _buildGeometry(width: number, height: number, pivot: Pivot): void {
        let x1, y1, x2, y2;
        if (pivot.charAt(1) == 'L') {
            x1 = 0;
            x2 = width;
        } else if (pivot.charAt(1) == 'M' || pivot == 'M') {
            x1 = -width / 2.0;
            x2 = width / 2.0;
        } else if (pivot.charAt(1) == 'R') {
            x1 = -width;
            x2 = 0;
        }

        if (pivot.charAt(0) == 'B') {
            y1 = 0;
            y2 = height;
        } else if (pivot.charAt(0) == 'M') {
            y1 = -height / 2.0;
            y2 = height / 2.0;
        } else if (pivot.charAt(0) == 'T') {
            y1 = -height;
            y2 = 0;
        }

        this.addVertice(x1, y1, 0.0);
        this.addVertice(x2, y1, 0.0);
        this.addVertice(x1, y2, 0.0);
        this.addVertice(x2, y2, 0.0);

        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);

        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);
    }

}

export default SpriteGeometry;