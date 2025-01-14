import { mat4, vec3, mat3 } from "gl-matrix";
import { NavigationMode, Viewer } from "../../viewer";
import { IPlugin } from "../plugin";
import { fshader } from "./fshader";
import { vshader } from "./vshader";
import { CameraType } from "../../camera";
import { quat } from "gl-matrix";
import { ClippingPlane } from "../../bcf/clipping-plane";

export class InteractiveSectionBox implements IPlugin {
    private viewer: Viewer;
    private vertices: Float32Array;
    private colours: Float32Array;
    private size = 2;

    private TOP = 1;
    private BOTTOM = 2; 
    private FRONT = 3;
    private BACK = 4;
    private RIGHT = 5;
    private LEFT = 6;

    private boxColour = [0.5, 0.5, 0.6, 0.1];
    private currentInteraction: number = -1;

    private program: WebGLProgram;
    private vertex_buffer: WebGLBuffer;
    private colours_buffer: WebGLBuffer;
    private id_buffer: WebGLBuffer;
    private index_buffer: WebGLBuffer;

    private coordinatesAttributePointer: number;
    private coloursAttributePointer: number;
    private idsAttributePointer: number;

    private mvUniformPointer: WebGLUniformLocation;
    private transformsUniformPointers: WebGLUniformLocation[];
    private pUniformPointer: WebGLUniformLocation;
    private inverseProjectionUniformPointer: WebGLUniformLocation;
    private idCodingUniformPointer: WebGLUniformLocation;
    private idSelectedIdUniformPointer: WebGLUniformLocation;
    private hoverPickColourUniformPointer: WebGLUniformLocation;
    private viewportDimensions: WebGLUniformLocation;
    private initialized = false;
 
    private transformations: mat4[] = [
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create(),
        mat4.create()
    ];

    private normals: vec3[] = [
        vec3.fromValues(0, 0, 1), 
        vec3.fromValues(0, 0, -1),
        vec3.fromValues(1, 0, 0),
        vec3.fromValues(-1, 0, 0),
        vec3.fromValues(0, -1, 0),
        vec3.fromValues(0, 1, 0),
    ];

    private indices = new Uint16Array([
        // Front face (facing -y)
        0, 1, 2, 0, 2, 3,
        // Back face (facing +y) 
        4, 5, 6, 4, 6, 7,
        // Top face (facing +z)
        8, 9, 10, 8, 10, 11,
        // Bottom face (facing -z)
        12, 13, 14, 12, 14, 15,
        // Right face (facing +x)
        16, 17, 18, 16, 18, 19,
        // Left face (facing -x)
        20, 21, 22, 20, 22, 23,
    ]);
    
    private ids = new Float32Array([
        this.TOP, // Front face
        this.TOP,
        this.TOP,
        this.TOP,
        this.BOTTOM, // Back face
        this.BOTTOM,
        this.BOTTOM,
        this.BOTTOM,
        this.FRONT, // Top face
        this.FRONT,
        this.FRONT,
        this.FRONT,
        this.BACK, // Bottom face
        this.BACK,
        this.BACK,
        this.BACK,
        this.RIGHT, // Right face
        this.RIGHT,
        this.RIGHT,
        this.RIGHT,
        this.LEFT, // Left face
        this.LEFT,
        this.LEFT,
        this.LEFT,
    ]);
    

    private _hoverPickColour: number[] = [10, 150, 112, 255];

    private readonly modelId = 1000011;

    /**
     * Set to true to stop rendering of this plugin
     */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) {
        this._stopped = value;
        if (value === false) {
            this.setActive();
            this.bufferGeometry();
            // this.setClippingPlanes()
        }
        if (this.viewer) {
            this.viewer.draw();
        }
    }
    private _stopped = true;

    init(viewer: Viewer): void {
        this.viewer = viewer;

        const gl = viewer.gl;

        this.initShader();
        gl.useProgram(this.program);

        // create vertex buffer
        this.index_buffer = gl.createBuffer();
        this.vertex_buffer = gl.createBuffer();
        this.colours_buffer = gl.createBuffer();
        this.id_buffer = gl.createBuffer();

        // Get the attribute location
        this.coordinatesAttributePointer = gl.getAttribLocation(this.program, "aVertex");
        this.coloursAttributePointer = gl.getAttribLocation(this.program, "aColour");
        this.idsAttributePointer = gl.getAttribLocation(this.program, "aId");

        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colours_buffer);
        gl.vertexAttribPointer(this.coloursAttributePointer, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.id_buffer);
        gl.vertexAttribPointer(this.idsAttributePointer, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Enable the attributes
        gl.enableVertexAttribArray(this.coordinatesAttributePointer);
        gl.enableVertexAttribArray(this.coloursAttributePointer);
        gl.enableVertexAttribArray(this.idsAttributePointer);

        // get uniform locations
        this.transformsUniformPointers = new Array(6);
        this.pUniformPointer = gl.getUniformLocation(this.program, "uPMatrix");
        this.mvUniformPointer = gl.getUniformLocation(this.program, "uMvMatrix");

        this.inverseProjectionUniformPointer = gl.getUniformLocation(this.program, "inverseProjectionMatrix");
        this.viewportDimensions = gl.getUniformLocation(this.program, "viewportDimensions");
 
        for (let i = 0; i < this.transformations.length; i++) {
            this.transformsUniformPointers[i] = gl.getUniformLocation(this.program, `transformations[${i}]`);
        }
    
        this.idCodingUniformPointer = gl.getUniformLocation(this.program, "uColorCoding");
        this.idSelectedIdUniformPointer = gl.getUniformLocation(this.program, "uSelectedId");
        this.hoverPickColourUniformPointer = gl.getUniformLocation(this.program, 'uHoverPickColour');

        this.bufferGeometry();
        
        this.initEvents();
        this.initialized = true;
    }

    public setClippingPlanes(planes: ClippingPlane[]): void {

        planes = this.sortPlanes(planes);
        for (let index = 0; index < this.transformations.length; index++) {
   
          const { direction, location } = planes[index];
           this.transformations[index] = this.getTransformationFromPlane(vec3.fromValues(direction[0], direction[1], direction[2]), vec3.fromValues(location[0], location[1], location[2]));
        }
    }

    private sortPlanes(
        planes: ClippingPlane[]
      ): ClippingPlane[] {
        if (planes.length !== 6) {
          throw new Error('Expected exactly 6 planes.');
        }
      
        let top: ClippingPlane | undefined;
        let bottom: ClippingPlane | undefined;
        let front: ClippingPlane | undefined;
        let back: ClippingPlane | undefined;
        let left: ClippingPlane | undefined;
        let right: ClippingPlane | undefined;
      
        for (const plane of planes) {
          const [dx, dy, dz] = plane.direction;
      
          if (dx === 0 && dy === 0 && dz === 1) {
            // +Z => top
            top = plane;
          } else if (dx === 0 && dy === 0 && dz === -1) {
            // -Z => bottom
            bottom = plane;
          } else if (dx === 1 && dy === 0 && dz === 0) {
            // +X => front (as per your mapping)
            front = plane;
          } else if (dx === -1 && dy === 0 && dz === 0) {
            // -X => back
            back = plane;
          } else if (dx === 0 && dy === -1 && dz === 0) {
            // -Y => left
            left = plane;
          } else if (dx === 0 && dy === 1 && dz === 0) {
            // +Y => right
            right = plane;
          } else {
            console.warn('Unrecognized plane direction:', plane.direction);
          }
        }
      
        if (!top || !bottom || !front || !back || !left || !right) {
          throw new Error('One or more planes could not be classified.');
        }
      
        return [top, bottom, front, back, left, right];
    }
      

    private getNormal(face: number) : vec3 {
       return this.normals[face];
    }


    onBeforeDraw(width: number, height: number): void {
    }

    onAfterDraw(width: number, height: number): void {
        if (this.stopped) {
            return;
        }
        var gl = this.setActive();

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        //set uniform for colour coding to false
        gl.uniform1f(this.idCodingUniformPointer, 0);
        this.draw(gl);
    }

    onBeforeDrawId(): void { }

    onAfterDrawId(): void {
        if (this.stopped) {
            return;
        }

        var gl = this.setActive();
        // UI control identity colour coding
        gl.uniform1f(this.idCodingUniformPointer, 1);   
        this.draw(gl);
    }

    onAfterDrawModelId(): void {
        if (this.stopped) {
            return;
        }
        var gl = this.setActive();

        // model ID colour coding
        gl.uniform1f(this.idCodingUniformPointer, this.modelId);
        this.draw(gl);
    }

    private draw(gl: WebGLRenderingContext): void {
        if (this.stopped) {
            return;
        }

        if (!this.initialized) {
            return;
        }

        gl.uniformMatrix4fv(this.pUniformPointer, false, this.viewer.pMatrix);
        gl.uniformMatrix4fv(this.mvUniformPointer, false, this.viewer.mvMatrix);
        gl.uniformMatrix4fv(this.inverseProjectionUniformPointer, false, mat4.invert(mat4.create(), this.viewer.pMatrix));
        gl.uniform2fv(this.viewportDimensions, new Float32Array([this.viewer.width, this.viewer.height]));
        for (let i = 0; i < this.transformations.length; i++) {
            gl.uniformMatrix4fv(this.transformsUniformPointers[i], false, this.transformations[i]);
        } 

        gl.uniform4fv(this.hoverPickColourUniformPointer,
            new Float32Array(
                [
                    this._hoverPickColour[0] / 255.0,
                    this._hoverPickColour[1] / 255.0,
                    this._hoverPickColour[2] / 255.0,
                    this._hoverPickColour[3] / 255.0
                ]));

        this.viewer.gl.uniform1f(this.idSelectedIdUniformPointer, this.currentInteraction);

        //bind data buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.id_buffer);
        gl.vertexAttribPointer(this.idsAttributePointer, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colours_buffer);
        gl.vertexAttribPointer(this.coloursAttributePointer, 4, gl.FLOAT, false, 0, 0);

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        //draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    private bufferGeometry(): void {
        if(this.viewer.sectionBox.boxVertices.length == 0) return;
         const plansVertices: number[] = this.buildBoxQuadsFromCorners(this.viewer.sectionBox.boxVertices);
        this.vertices = new Float32Array(plansVertices);
        const colours: number[] = [];
        colours.push(...plansVertices.filter((_, i) => i % 3 === 0).flatMap(() => this.boxColour));
        this.colours = new Float32Array(colours);

        // bind buffers
        const gl = this.viewer.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colours_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colours, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.id_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.ids, gl.STATIC_DRAW);

    }

    private initEvents(): void {
        let lastMouseX: number = null;
        let lastMouseY: number = null;
        let lastNavigation: NavigationMode;
        let origin: vec3 = vec3.create(); 
        let rotation: quat;


        this.viewer.canvas.addEventListener('pointerdown', event => {
            if (this.stopped || this.viewer.plugins.indexOf(this) < 0 || event.button !== 0) {
                return;
            }
            const data = this.viewer.getEventDataFromEvent(event, true);
             
            if (data.model !== this.modelId) {
                return;
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            lastNavigation = this.viewer.navigationMode;
            if(data.xyz) origin = data.xyz;
            this.viewer.navigationMode = 'none';
            this.currentInteraction = data.id;
            rotation = mat4.getRotation(quat.create(), this.transformations[this.currentInteraction - 1]); 
        });

        window.addEventListener('pointerup', event => {
            if (this.currentInteraction === -1) return;
            this.currentInteraction = -1;
            this.viewer.navigationMode = lastNavigation;
            origin = null;
        });
        
        window.addEventListener('pointermove', event => {
             
            if (this.currentInteraction === -1) {
                return;
            }
            const data = this.viewer.getEventDataFromEvent(event, true);
            if(!origin){
                origin = data.xyz? data.xyz : vec3.create();
            }

            var newX = event.clientX;
            var newY = event.clientY;
            var deltaX = newX - lastMouseX;
            var deltaY = newY - lastMouseY;
 
            const planeIndex = this.currentInteraction - 1;
            const oldTransform = mat4.clone(this.transformations[planeIndex]);
        
            lastMouseX = newX;
            lastMouseY = newY; 
            const camera = this.viewer.getCameraPosition();
            const distance = vec3.distance(camera, origin);

            let c = 0;
            if (this.viewer.camera === CameraType.ORTHOGONAL) {
                c = this.viewer.cameraProperties.height / this.viewer.height;
            } else {
                const fov = this.viewer.cameraProperties.fov * Math.PI / 180;
                const h = 2 * distance * Math.tan(fov / 2.0);
                c = h / this.viewer.height;
            }
            const draggingOffset = this.getDragOffset(c, deltaX, deltaY, rotation);
            mat4.translate(this.transformations[planeIndex], this.transformations[planeIndex], draggingOffset);
            
            if (!this.clampPlanes(this.currentInteraction)) {
                this.transformations[planeIndex] = oldTransform;
            }

            this.applySectionBox();
            this.bufferGeometry();
        });
    }
  
    private buildBoxQuadsFromCorners(corners: vec3[]): number[] {
        if (corners.length !== 8) {
          throw new Error('Expected exactly 8 corners for a box.');
        }
        const vertices: number[] = [];
        const wcs = this.viewer.getCurrentWcs();
      
        function pushQuad(a: vec3, b: vec3, c: vec3, d: vec3) {
          vertices.push(a[0] - wcs[0], a[1] - wcs[1], a[2] - wcs[2]);
          vertices.push(b[0] - wcs[0], b[1] - wcs[1], b[2] - wcs[2]);
          vertices.push(c[0] - wcs[0], c[1] - wcs[1], c[2] - wcs[2]);
          vertices.push(d[0] - wcs[0], d[1] - wcs[1], d[2] - wcs[2]);
        }
        const c0 = corners[0]; // top-left-front
        const c1 = corners[1]; // top-left-back
        const c2 = corners[2]; // top-right-front
        const c3 = corners[3]; // top-right-back
        const c4 = corners[4]; // bottom-left-front
        const c5 = corners[5]; // bottom-left-back
        const c6 = corners[6]; // bottom-right-front
        const c7 = corners[7]; // bottom-right-back
      
        // Face 1: Top    (c0, c1, c3, c2)
        pushQuad(c0, c1, c3, c2);
      
        // Face 2: Bottom (c4, c6, c7, c5)
        pushQuad(c4, c6, c7, c5);

        // Face 3: Left   (c0, c4, c5, c1)
        pushQuad(c0, c4, c5, c1);
      
        // Face 4: Right  (c2, c3, c7, c6)
        pushQuad(c2, c3, c7, c6);
      
        // Face 5: Front  (c0, c2, c6, c4)
        pushQuad(c0, c2, c6, c4);
      
        // Face 6: Back   (c1, c5, c7, c3)
        pushQuad(c1, c5, c7, c3);
      
        return vertices;
    }

    private getDragOffset(speed: number, deltaX: number, deltaY: number, rotation: quat) : vec3{
         
        let dragAxis = this.getNormal(this.currentInteraction - 1);
        dragAxis = vec3.transformQuat(vec3.create(), dragAxis, rotation);
        const modelViewRotation = mat4.getRotation(quat.create(), mat4.multiply(mat4.create(), this.viewer.mvMatrix, this.transformations[this.currentInteraction - 1]));
        const projectedNormal = vec3.transformQuat(vec3.create(), dragAxis, modelViewRotation);
        vec3.normalize(projectedNormal, projectedNormal)
        const offset = (deltaX * projectedNormal[0]) - (deltaY * projectedNormal[1]);
        vec3.scale(dragAxis, dragAxis, offset * speed);
        return dragAxis;
    }

    private applySectionBox() {
    
        this.viewer.sectionBox.setToPlanes(this.transformations.map((t,i) => {
            var plane = new ClippingPlane();
            let normal = this.getNormal(i);
            plane.direction = [normal[0], 
                             normal[1], 
                             normal[2]];
            plane.location = [t[12], t[13], t[14]];
            return plane;
        }));
    }
 
    private initShader(): void {
        const gl = this.viewer.gl;
        const viewer = this.viewer;
        const compile = (shader: WebGLShader, code: string) => {
            gl.shaderSource(shader, code);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                let msg = gl.getShaderInfoLog(shader);
                viewer.error(msg);
                return null;
            }
        };

        // compile shaders
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        compile(fragmentShader, fshader);

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        compile(vertexShader, vshader);

        //link program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            viewer.error('Could not initialise shaders for interactive section box plugin');
        }
    }

    private setActive(): WebGLRenderingContext {
        var gl = this.viewer.gl;
        gl.useProgram(this.program);
        return gl;
    }

    private getTransformationFromPlane(normal: vec3, planePoint: vec3) : mat4 {
        const tangent = this.getTangent(normal);
        const binormal = vec3.cross(vec3.create(), normal, tangent);
        vec3.normalize(binormal, binormal);
   
        const transform = mat4.fromValues(
            normal[0], normal[1], normal[2], 0,
            tangent[0], tangent[1], tangent[2], 0,
            binormal[0], binormal[1], binormal[2], 0,
            planePoint[0], planePoint[1], planePoint[2], 1);
        return transform;
    }

    private getTangent(normal: vec3): vec3 { 

        const between = (x: number, min: number, max: number) => {
            return x > min && x < max;
        }

        const x = vec3.fromValues(1, 0, 0);
        const y = vec3.fromValues(0, 1, 0);
        const z = vec3.fromValues(0, 0, 1);
        
        let tangent : vec3 = null;
        if(between(vec3.angle(normal, z), 0, Math.PI)) {
            tangent = vec3.cross(vec3.create(), normal, z);
        }
        else if(between(vec3.angle(normal, x), 0, Math.PI)){
             tangent = vec3.cross(vec3.create(), normal, x);
        }
        else if(between(vec3.angle(normal, y), 0, Math.PI)){
            tangent = vec3.cross(vec3.create(), normal, y);
        }

        vec3.normalize(tangent, tangent);
    
        return tangent;
    }

    private clampPlanes(currentInteraction: number): boolean {
   
        const topZ = this.transformations[0][14];
        const bottomZ = this.transformations[1][14];
        const front = this.transformations[2][12];
        const back = this.transformations[3][12];
        const left = this.transformations[4][13];
        const right = this.transformations[5][13];
        const minSide = this.viewer.activeHandles[0].meter / 10;

        if (topZ - bottomZ <= minSide && (currentInteraction == this.TOP || currentInteraction == this.BOTTOM)) {
            console.log("cla top", topZ, bottomZ)

            return false;
        }
        
        if (front - back <= minSide && (currentInteraction == this.FRONT || currentInteraction == this.BACK )) {
            return false;
        }

        if (right - left <= minSide && (currentInteraction == this.LEFT || currentInteraction == this.RIGHT)) {
            return false;
        }

    
        return true;
    }
    

}