const Texture = {
    vertexShader: {
        definitions: `
            #ifdef USE_TEXTURE
                attribute vec2 aTexCoords;
                varying vec2 vTexCoords;
            #endif
        `,

        passVaryings: `
            #ifdef USE_TEXTURE
                vTexCoords = aTexCoords;
            #endif
        `
    },

    fragmentShader: {
        definitions: `
            #ifdef USE_TEXTURE
                uniform vec4 uUV;
                uniform vec2 uRepeat;
                uniform sampler2D uTexture;
                varying vec2 vTexCoords;
            #endif
        `,

        readTextureColor: `
            #ifdef USE_TEXTURE
                vec2 coords = mod(clamp(vTexCoords, 0.0, 1.0) * uRepeat, 1.0) * uUV.zw + uUV.xy;
                outColor *= texture2D(uTexture, coords);
            #endif
        `
    }
}

export default Texture;