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

    private _frameIndex          : number;
    private _animationIndex      : string;
    
    constructor(texture: Texture) {
        super(MainShader);

        this._texture = texture;
        this._uvs = [0, 0, 1, 1];
        this._repeat = [1, 1];
        this._frameIndex = 0;
        this._animationIndex = null;

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
            animation = (this._animationIndex)? this._texture.getAnimation(this._animationIndex) : null;

        if (animation) {
            gl.uniform4fv(program.uniforms["uUV"], animation.getFrame(this._frameIndex));
        }else {
            gl.uniform4fv(program.uniforms["uUV"], this._uvs);
        }

        gl.uniform2fv(program.uniforms["uRepeat"], this._repeat);
        
        renderer.bindTexture(this._texture, "baseTexture", program.uniforms["uTexture"]);
    }

    private _updateAnimation(): void {
        if (!this._animationIndex) { return; }

        const animation = this._texture.getAnimation(this._animationIndex);

        this._frameIndex += animation.speed;
        if (this._frameIndex >= animation.length) {
            this._frameIndex = 0;
        }
    }

    public playAnimation(animationIndex: string): void {
        if (this._animationIndex == animationIndex) { return; }
        
        this._texture.getAnimation(animationIndex);

        this._animationIndex = animationIndex;
        this._frameIndex = 0;
    }

    public render(renderer: Renderer, instance: Instance, geometry: Geometry, camera: Camera): void {
        this._shader.useProgram(renderer);

        this._updateAnimation();

        this._renderInstanceProperties(renderer, instance, camera);
        this._renderTexture(renderer);
        this._renderGeometry(renderer, geometry);
    }

    public set uvs(uvs: Array<number>) {
        this._uvs = uvs;
    }

    public set texture(texture: Texture) {
        this._texture = texture;
    }

    public get isReady(): boolean {
        return true;
    }
}

export default SpriteMaterial;