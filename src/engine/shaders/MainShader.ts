import { ShaderStruct } from './Shader';
import { createUUID } from '../Utils';

const MainShader : ShaderStruct = {
    id: createUUID(),

    vertexShader: `
        precision mediump float;

        attribute vec3 aVertexPosition;

        uniform mat4 uProjection;
        uniform mat4 uPosition;

        void main(void) {
            vec4 position = vec4(aVertexPosition, 1.0);

            gl_Position = uProjection * uPosition * position;
        }
    `,

    fragmentShader: `
        void main(void) {
            gl_FragColor = vec4(1.0);
        }
    `
};

export default MainShader;