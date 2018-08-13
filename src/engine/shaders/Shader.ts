import { createUUID } from '../Utils';
import Renderer from '../Renderer';

export interface ShaderStruct {
    id: string,
    vertexShader: string,
    fragmentShader: string
}

interface StructMap {
    [index: string]: Array<string>
}

interface Attributes {
    [index: string]: number
};

interface Uniforms {
    [index: string]: WebGLUniformLocation
}

interface Program {
    rendererId               : string;
    shaderId                 : string;
    gl                       : WebGLRenderingContext;
    config                   : Array<string>;
    references               : number;
    program?                 : WebGLProgram;
    uniforms?                : Uniforms;
    attributes?              : Attributes;
}

interface RendererProgramsMap {
    [index: string]: Program
}

const programsBucket: Array<Program> = []; 

class Shader {
    private _shaderInfo              : ShaderStruct;
    private _programs                : RendererProgramsMap;

    public attributesCount           : number;
    public includes                  : Array<string>;

    public readonly id               : string;

    public static maxAttribLength          : number;

    constructor(shader: ShaderStruct) {
        this.id = createUUID();

        this.includes = [];
        this._shaderInfo = shader;

        this._programs = {};
    }

    private _searchProgram(renderer: Renderer): Program {
        const rId = renderer.id,
            sId = this._shaderInfo.id;
        
        for (let i=0,program;program=programsBucket[i];i++) {
            if (program.rendererId == rId && program.shaderId == sId && program.config.length == this.includes.length) {
                let found = true;

                for (let j=0,len=this.includes.length;j<len;j++) {
                    if (program.config.indexOf(this.includes[j]) == -1) {
                        found = false;
                        j = len;
                    }
                }

                if (found) {
                    return program;
                }
            }
        }

        return null;
    }

    private _createProgram(renderer: Renderer): void {
        const search = this._searchProgram(renderer);
        if (search != null) {
            search.references += 1;
            this._programs[renderer.id] = search;

            return;
        }

        this._programs[renderer.id] = {
            rendererId: renderer.id,
            shaderId: this._shaderInfo.id,
            config: this.includes.slice(),
            gl: renderer.GL,
            references: 1
        };

        this._compileShaders(renderer, this._shaderInfo);
        this._getShaderAttributes(renderer, this._shaderInfo);
        this._getShaderUniforms(renderer, this._shaderInfo);

        programsBucket.push(this._programs[renderer.id]);
    }

    private _getSourceWithIncludes(shader: string): string {
        let ret = shader;

        for (let i=0,inc;inc=this.includes[i];i++) {
            ret = "#define " + inc + "\n" + ret;
        }

        return ret;
    }

    private _compileShaders(renderer: Renderer, shader: ShaderStruct): void {
        const gl: WebGLRenderingContext = renderer.GL;

        const vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, this._getSourceWithIncludes(shader.vertexShader));
        gl.compileShader(vShader);

        const fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, this._getSourceWithIncludes(shader.fragmentShader));
        gl.compileShader(fShader);

        const program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vShader));
            throw new Error("Error compiling vertex shader");
        }

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fShader));
            throw new Error("Error compiling fragment shader");
        }

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program));
            throw new Error("Error linking the program");
        }

        this._programs[renderer.id].program = program;
    }

    private _getShaderAttributes(renderer: Renderer, shader: ShaderStruct): void {
        const code: Array<string> = shader.vertexShader.split(/\n/g),
            gl: WebGLRenderingContext = renderer.GL,
            program = this._programs[renderer.id].program;

        let attribute: string;
        let location: number;

        this.attributesCount = 0;

        let attributes: Attributes = {};

        for (let i = 0, len = code.length; i < len; i++) {
            const c: Array<string> = code[i].trim().split(/ /g);

            if (c[0] == 'attribute') {
                attribute = c.pop().replace(/;/g, "");
                location = gl.getAttribLocation(program, attribute);

                attributes[attribute] = location;
                this.attributesCount += 1;
            }
        }

        this._programs[renderer.id].attributes = attributes;

        Shader.maxAttribLength = Math.max(Shader.maxAttribLength, this.attributesCount);
    }

    private _getShaderUniforms(renderer: Renderer, shader: ShaderStruct): void {
        let code: Array<string> = shader.vertexShader.split(/\n/g);
        code = code.concat(shader.fragmentShader.split(/\n/g));

        const gl: WebGLRenderingContext = renderer.GL,
            program = this._programs[renderer.id].program;

        let uniform: string;
        let location: WebGLUniformLocation;
        let usedUniforms: Array<string> = [];

        let uniforms: Uniforms = {};

        let structMap: StructMap = {};
        let lastStruct: string = null;

        let defines: any = {};

        for (let i = 0, len = code.length; i < len; i++) {
            const c: Array<string> = code[i].trim().split(/ /g);
            if (c[0] == "") { continue; }

            if (c[0] == "struct") {
                lastStruct = c[1];
                structMap[lastStruct] = [];
            } else if (c[0] == "uniform") {
                uniform = c.pop().replace(/;/g, "");
                let size: number = 0;

                if (uniform.indexOf("[") != -1) {
                    const ind = uniform.indexOf("[");
                    const sizeStr = uniform.substring(ind+1, uniform.indexOf("]"));

                    size = (defines[sizeStr])? parseInt(defines[sizeStr]) : parseInt(sizeStr);
                    uniform = uniform.substring(0, ind);
                }
                
                const type: string = c.pop();

                if (structMap[type]) {
                    const struct = structMap[type];
                    for (let k=0;k<Math.max(size, 1);k++) {
                        for (let j=0,prop;prop=struct[j];j++) {
                            let uniformProperty = uniform + ((size > 0)? "[" + k + "]" : "")  + "." + prop;
                            if (usedUniforms.indexOf(uniformProperty) != -1) { continue; }

                            location = gl.getUniformLocation(program, uniformProperty);
                            usedUniforms.push(uniformProperty);
                            uniforms[uniformProperty] = location;
                        }
                    }
                } else {
                    for (let k=0;k<Math.max(size, 1);k++) {
                        let uniformProperty = uniform + ((size > 0)? "[" + k + "]" : "");
                        if (usedUniforms.indexOf(uniformProperty) != -1) { continue; }

                        location = gl.getUniformLocation(program, uniformProperty);
                        usedUniforms.push(uniformProperty);
                        uniforms[uniformProperty] = location;
                    }
                }
            } else if (c[0] == "#define"){
                defines[c[1]] = c[2];
            } else if (lastStruct != null) {
                let property: string = c.pop().replace(/;/g, "");
                if (property == "}") {
                    lastStruct = null;
                } else {
                    structMap[lastStruct].push(property);
                }
            }
        }

        this._programs[renderer.id].uniforms = uniforms;
    }

    public useProgram(renderer: Renderer): void {
        if (!this._programs[renderer.id]) {
            this._createProgram(renderer);
        }

        const program = this._programs[renderer.id].program;

        renderer.switchProgram(program);
    }

    public deleteProgram(rendererId: string): Shader {
        if (!this._programs[rendererId]) { return this; }

        const program = this._programs[rendererId];

        program.references -= 1;
        if (program.references <= 0) {
            programsBucket.splice(programsBucket.indexOf(program), 1);
            program.gl.deleteProgram(program.program);
        }

        this._programs[rendererId] = null;

        return this;
    }

    public getProgram(renderer: Renderer): Program {
        if (!this._programs[renderer.id]) {
            this._createProgram(renderer);
        }

        return this._programs[renderer.id];
    }

    public destroy(): void {
        for (let i in this._programs) {
            const program = this._programs[i];

            this.deleteProgram(program.rendererId);
        }

        this._programs = null;
        this.includes = null;
    }

    public equals(shader: Shader): boolean {
        if (this._shaderInfo.id == shader.shaderInfo.id && this.includes.length == shader.includes.length) {
            for (let j=0,len=this.includes.length;j<len;j++) {
                if (shader.includes.indexOf(this.includes[j]) == -1) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    public get shaderInfo(): ShaderStruct {
        return this._shaderInfo;
    }
}

Shader.maxAttribLength = 0;

export default Shader;