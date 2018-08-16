import { ShaderStruct } from './Shader';
import { createUUID } from '../Utils';
import Texture from './glsl/Texture';

const MainShader : ShaderStruct = {
    id: createUUID(),

    vertexShader: `
        precision mediump float;

        attribute vec3 aVertexPosition;

        uniform mat4 uProjection;
        uniform mat4 uPosition;

        ${Texture.vertexShader.definitions}

        void main(void) {
            vec4 position = vec4(aVertexPosition, 1.0);

            gl_Position = uProjection * uPosition * position;

            ${Texture.vertexShader.passVaryings}
        }
    `,

    fragmentShader: `
        precision mediump float;

        ${Texture.fragmentShader.definitions}

        void main(void) {
            vec4 outColor = vec4(1.0);

            ${Texture.fragmentShader.readTextureColor}

            gl_FragColor = outColor;
        }
    `
};

export default MainShader;