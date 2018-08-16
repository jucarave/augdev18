import Renderer from '../Renderer';
import Geometry from '../geometries/Geometry';
import { VERTICE_SIZE, TEXCOORD_SIZE } from '../Constants';
import Instance from '../entities/Instance';
import Camera from '../entities/Camera';
import Material from './Material';
import MainShader from '../shaders/MainShader';
import Texture from '../Texture';

class SpriteMaterial extends Material {
    private _texture             : Texture;
    private _uvs                 : Array<number>;
    private _repeat              : Array<number>;
    
    constructor(texture: Texture) {
        super(MainShader);

        this._texture = texture;
        this._uvs = [0, 0, 1, 1];
        this._repeat = [1, 1];

        this.addConfig("USE_TEXTURE");
    }

    private _renderGeometry(renderer: Renderer, geometry: Geometry): void {
        const buffer = geometry.getBuffer(renderer),
            program = this._shader.getProgram(renderer);
        
        renderer.vertexAttribPointer(buffer.vertexBuffer, program.attributes["aVertexPosition"], VERTICE_SIZE);
        renderer.vertexAttribPointer(buffer.texCoordsBuffer, program.attributes["aTexCoords"], TEXCOORD_SIZE);

        renderer.drawElements(buffer.indexBuffer, geometry.indexLength);
    }

    private _renderInstanceProperties(renderer: Renderer, instance: Instance, camera: Camera): void {
        const gl = renderer.GL,
            program = this._shader.getProgram(renderer);

        gl.uniformMatrix4fv(program.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(program.uniforms["uPosition"], false, instance.worldMatrix.data);
    }

    private _renderTexture(renderer: Renderer): void {
        const gl = renderer.GL,
            program = this._shader.getProgram(renderer),
            animation = this._texture.animation;

        if (animation) {
            animation.update();
            gl.uniform4fv(program.uniforms["uUV"], animation.getCurrentFrame());
        }else {
            gl.uniform4fv(program.uniforms["uUV"], this._uvs);
        }

        gl.uniform2fv(program.uniforms["uRepeat"], this._repeat);
        
        renderer.bindTexture(this._texture, "baseTexture", program.uniforms["uTexture"]);
    }

    public render(renderer: Renderer, instance: Instance, geometry: Geometry, camera: Camera): void {
        this._shader.useProgram(renderer);

        this._renderInstanceProperties(renderer, instance, camera);
        this._renderTexture(renderer);
        this._renderGeometry(renderer, geometry);
    }

    public set uvs(uvs: Array<number>) {
        this._uvs = uvs;
    }

    public get isReady(): boolean {
        return true;
    }
}

export default SpriteMaterial;