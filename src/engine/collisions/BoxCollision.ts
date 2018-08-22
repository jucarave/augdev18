import Instance from "../entities/Instance";
import { createUUID, Pivot } from "../Utils";

class BoxCollision {
    public readonly id              : string;
    public readonly x1              : number;
    public readonly y1              : number;
    public readonly x2              : number;
    public readonly y2              : number;
    public readonly instance               : Instance;

    constructor(instance: Instance, width: number, height: number, pivot: Pivot = 'M') {
        this.id = createUUID();

        this.instance = instance;

        if (pivot.charAt(1) == 'L') {
            this.x1 = 0;
            this.x2 = width;
        } else if (pivot.charAt(1) == 'M' || pivot == 'M') {
            this.x1 = -width / 2.0;
            this.x2 = width / 2.0;
        } else if (pivot.charAt(1) == 'R') {
            this.x1 = -width;
            this.x2 = 0;
        }

        if (pivot.charAt(0) == 'B') {
            this.y1 = 0;
            this.y2 = height;
        } else if (pivot.charAt(0) == 'M') {
            this.y1 = -height / 2.0;
            this.y2 = height / 2.0;
        } else if (pivot.charAt(0) == 'T') {
            this.y1 = -height;
            this.y2 = 0;
        }
    }

    public overlaps(col: BoxCollision): boolean {
        if (col.id == this.id) { return false; }

        const ax1 = this.instance.position.x + this.x1,
            ax2 = this.instance.position.x + this.x2,
            ay1 = this.instance.position.y + this.y1,
            ay2 = this.instance.position.y + this.y2;

        const bx1 = col.instance.position.x + this.x1,
            bx2 = col.instance.position.x + this.x2,
            by1 = col.instance.position.y + this.y1,
            by2 = col.instance.position.y + this.y2;

        if (ax2 < bx1 || ax1 >= bx2 || ay2 < by1 || ay1 >= by2) {
            return false;
        }

        return true;
    }

    public overlapsArray(col: Array<number>): boolean {
        const ax1 = this.instance.position.x + this.x1,
            ax2 = this.instance.position.x + this.x2,
            ay1 = this.instance.position.y + this.y1,
            ay2 = this.instance.position.y + this.y2;

        if (ax2 < col[0] || ax1 >= col[0]+col[2] || ay2 < col[1] || ay1 >= col[1]+col[3]) {
            return false;
        }
        
        return true;
    }
}

export default BoxCollision;