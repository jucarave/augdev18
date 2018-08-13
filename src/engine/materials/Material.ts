import { ShaderStruct } from '../shaders/Shader';
import Shader from '../shaders/Shader';
import Renderer from '../Renderer';
import Geometry from '../geometries/Geometry';
import { VERTICE_SIZE } from '../Constants';
import Instance from '../entities/Instance';
import Camera from '../entities/Camera';

class Material {
    private _shader             : Shader;

    constructor(shader: ShaderStruct) {
        this._shader = new Shader(shader);
    }

    private _renderGeometry(renderer: Renderer, geometry: Geometry): void {
        const buffer = geometry.getBuffer(renderer),
            program = this._shader.getProgram(renderer);
        
        renderer.vertexAttribPointer(buffer.vertexBuffer, program.attributes["aVertexPosition"], VERTICE_SIZE);

        renderer.drawElements(buffer.indexBuffer, geometry.indexLength);
    }

    private _renderInstanceProperties(renderer: Renderer, instance: Instance, camera: Camera): void {
        const gl = renderer.GL,
            program = this._shader.getProgram(renderer);

        gl.uniformMatrix4fv(program.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(program.uniforms["uPosition"], false, instance.worldMatrix.data);
    }

    public render(renderer: Renderer, instance: Instance, geometry: Geometry, camera: Camera): Material {
        this._shader.useProgram(renderer);

        this._renderInstanceProperties(renderer, instance, camera);
        this._renderGeometry(renderer, geometry);

        return this;
    }

    public get isReady(): boolean {
        return true;
    }
}

export default Material;