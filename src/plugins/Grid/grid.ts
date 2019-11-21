import { IPlugin } from '../plugin';
import { Viewer } from '../../viewer';
import { vshader } from './vshader';

export class Grid implements IPlugin {

    private viewer: Viewer;
    private program: WebGLProgram;
    private vertex_buffer: WebGLBuffer;
    private coordinatesAttributePointer: number;
    private mvUniformPointer: WebGLUniformLocation;
    private pUniformPointer: WebGLUniformLocation;
    private colourUniformPointer: WebGLUniformLocation;
    private initialized = false;

    /**
     * Factor used to make the grid bigger than the current region
     */
    public factor = 1.5;
    /**
     * Fragment of Z height to be used as a Z offset bellow the model
     */
    public zFactor = 5.0;

    /**
     * Number of lines to be drawn
     */
    public numberOfLines = 10.0;

    /**
     * Colour of the grid
     */
    public colour = [0.0, 0.0, 0.0, 0.6];

    /**
     * Set to true to stop rendering of this plugin
     */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) {
        this._stopped = value;
        if (this.viewer) {
            this.viewer.draw();
        }
    }
    private _stopped = false;

    public init(viewer: Viewer): void {
        this.viewer = viewer;

        const gl = viewer.gl;

        this._initShader();
        gl.useProgram(this.program);

        // create vertex buffer
        this.vertex_buffer = gl.createBuffer();

        // Get the attribute location
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        this.coordinatesAttributePointer = gl.getAttribLocation(this.program, "coordinates");
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);

        // Enable the attribute
        gl.enableVertexAttribArray(this.coordinatesAttributePointer);

        // get uniform locations
        this.colourUniformPointer = gl.getUniformLocation(this.program, "uColour");
        this.pUniformPointer = gl.getUniformLocation(this.program, "uPMatrix");
        this.mvUniformPointer = gl.getUniformLocation(this.program, "uMvMatrix");

        this.initialized = true;
    }

    private _initShader(): void {

        var gl = this.viewer.gl;
        var viewer = this.viewer;
        var compile = (shader, code) => {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                let msg = gl.getShaderInfoLog(shader);
                viewer.error(msg);
                return null;
            }
        };

        //fragment shader
        // Fragment shader source code
        const fragCode =
            'precision mediump float; uniform vec4 uColour;' +
            'void main(void) {' +
            'gl_FragColor = uColour;' +
            '}';
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        compile(fragmentShader, fragCode);

        //vertex shader (the more complicated one)
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        compile(vertexShader, vshader);

        //link program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            viewer.error('Could not initialise shaders for a navigation cube plugin');
        }
    }

    public onAfterDraw(width: number, height: number): void {
        if (!this.initialized || this.stopped) {
            return;
        }
        const region = this.viewer.getMergedRegion();
        if (!region || region.population < 1) {
            return;
        }
        const size = Math.max(region.bbox[3], region.bbox[4]) * this.factor;
        if (size < 0.1) {
            return;
        }

        const spacing = size / (this.numberOfLines + 1);

        const x = region.bbox[0] + region.bbox[3] / 2.0 - size / 2.0;
        const y = region.bbox[1] + region.bbox[4] / 2.0 - size / 2.0;
        const z = region.bbox[2] - region.bbox[5] / this.zFactor;

        const vertices: number[] = [];

        // x lines
        for (let i = 1; i < this.numberOfLines + 1; i++) {
            vertices.push(x); // start x
            vertices.push(y + i * spacing); // start y
            vertices.push(z); // start z

            vertices.push(x + size); // end x
            vertices.push(y + i * spacing); // end y
            vertices.push(z); // end z
        }

        // y lines
        for (let i = 1; i < this.numberOfLines + 1; i++) {
            vertices.push(x + i * spacing); // start x
            vertices.push(y); // start y
            vertices.push(z); // start z

            vertices.push(x + i * spacing); // end x
            vertices.push(y + size); // end y
            vertices.push(z); // end z
        }

        const gl = this.viewer.gl;
        gl.useProgram(this.program);

        // set uniforms
        gl.uniformMatrix4fv(this.pUniformPointer, false, this.viewer.pMatrix);
        gl.uniformMatrix4fv(this.mvUniformPointer, false, this.viewer.mvMatrix);
        gl.uniform4fv(this.colourUniformPointer, this.colour);


        // Bind vertex buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        // Pass the vertex data to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        // Point an attribute to the currently bound VBO
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Draw lines
        gl.drawArrays(gl.LINES, 0, vertices.length / 3);
    }

    // tslint:disable: no-empty
    public onBeforeDraw(width: number, height: number): void { }

    public onBeforeDrawId(): void { }

    public onAfterDrawId(): void { }

    public onAfterDrawModelId(): void { }
}