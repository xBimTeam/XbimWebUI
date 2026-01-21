import { depth_fragment_shader } from "./depth_fragment_shader";
import { depth_vertex_shader } from "./depth_vertex_shader";
import { Framebuffer } from "../framebuffer";

export class DepthReader {

    // pointers
    private texUniform: WebGLUniformLocation;
    private vertAttrs: number
    
    // resources
    private program: WebGLProgram;
    private vertBuffer: WebGLBuffer;
    private fragmentShader: WebGLShader;
    private vertexShader: WebGLShader;

    // data
    private vertices = new Float32Array([
        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,
    ]);

    /**
     *
     */
    constructor(private gl: WebGLRenderingContext, private glVersion: number) {
        const compile = (shader: WebGLShader, code: string): boolean => {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const err = gl.getShaderInfoLog(shader);
                console.error(err);
                return false;
            }
            return true;
        }

        //fragment shader
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        const depth_fragment_shader_ws = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
    #define highp mediump
#endif

varying vec2 position;
uniform sampler2D texture;

vec4 packDepth(float depth)
{
    // See Aras Pranckevičius' post Encoding Floats to RGBA
    // http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * depth;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
    return enc;
}

void main() {
    float depth = texture2D(texture, position).x;
    gl_FragColor = packDepth(texture2D(texture, position).r);
    //[original code] gl_FragColor = vec4(depth, depth, depth, 1.0);
}
`;

        let fsCompiled = compile(this.fragmentShader, depth_fragment_shader_ws); //change for ws
        if (!fsCompiled) {
            throw new Error("Failed to compile depth reading fragment shader");
        }

        //vertex shader (the more complicated one)
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        let vsCompiled = compile(this.vertexShader, depth_vertex_shader);
        if (!vsCompiled) {
            throw new Error("Failed to compile depth reading vertex shader");
        }

        //link program
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);

        if (gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            gl.useProgram(this.program);
        } else {
            console.error('Could not initialise shaders ');
            return;
        }

        this.texUniform = gl.getUniformLocation(this.program, 'texture');
        this.vertAttrs = gl.getAttribLocation(this.program, 'point');

        // Create a buffer.
        this.vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);

        // Put a unit quad in the buffer
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    private draw(tex: WebGLTexture) {
        const gl = this.gl;
        gl.useProgram(this.program);

        // Tell the shader to get the texture from texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8ClampedArray([0,0,255,255]) );
        gl.uniform1i(this.texUniform, 0);

        // Setup the attributes to pull data from our buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
        gl.enableVertexAttribArray(this.vertAttrs);
        gl.vertexAttribPointer(this.vertAttrs, 2, gl.FLOAT, false, 0, 0);

        gl.clearColor(0, 0, 0, 0); //zero colour for no-values
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        // draw the quad (2 triangles, 6 vertices)
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    public getDepths( points: {x: number, y: number}[], tex: WebGLTexture, width: number, height: number): number[] {
        const gl = this.gl;
        gl.useProgram(this.program);

        //create framebuffer for off-screen rendering
        const fb = new Framebuffer(gl, width, height, false, this.glVersion);
        gl.viewport(0, 0, width, height);

        // draw and get results
        this.draw(tex);

        // all components should be the same (therefore just using [0])
        var depths = points.map(p => fb.getPixelAsFloat(p.x, p.y)) ;

        // free resources
        fb.delete();
        return depths;
    }

    public getDepth(x: number, y: number, tex: WebGLTexture, width: number, height: number): number {
        const depths = this.getDepths([{x,y}], tex, width, height);
        return depths[0];
    }

    /**
     * Deletes all WebGL resources
     */
    public delete(): void {
        const gl = this.gl;
        gl.deleteBuffer(this.vertBuffer);
        gl.deleteShader(this.fragmentShader);
        gl.deleteShader(this.vertexShader);
        gl.deleteProgram(this.program);
    }
}