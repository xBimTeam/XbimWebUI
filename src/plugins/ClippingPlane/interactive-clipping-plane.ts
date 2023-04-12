import { mat4, vec3 } from "gl-matrix";
import { NavigationMode, Viewer } from "../../viewer";
import { IPlugin } from "../plugin";
import { fshader } from "./fshader";
import { vshader } from "./vshader";
import { CameraType } from "../../camera";
import { quat } from "gl-matrix";
import { quat2 } from "gl-matrix";
import { VectorUtils } from "../../common/vector-utils";

export class InteractiveClippingPlane implements IPlugin {
    private viewer: Viewer;
    private indices: Uint16Array;
    private vertices: Float32Array;
    private colours: Float32Array;
    private ids: Float32Array;

    private ARROW = 1;
    private HORIZONTAL = 2;
    private VERTICAL = 3;
    private PLANE = 4;

    private arrowColour = [1.0, 0.0, 0.0, 1.0];
    private horizontalColour = [0.0, 1.0, 0.0, 1.0];
    private verticalColour = [0.0, 0.0, 1.0, 1.0];
    private planeColour = [0.0, 0.0, 0.8, 0.3];

    private program: WebGLProgram;
    private vertex_buffer: WebGLBuffer;
    private colours_buffer: WebGLBuffer;
    private id_buffer: WebGLBuffer;
    private index_buffer: WebGLBuffer;

    private coordinatesAttributePointer: number;
    private coloursAttributePointer: number;
    private idsAttributePointer: number;

    private mvUniformPointer: WebGLUniformLocation;
    private pUniformPointer: WebGLUniformLocation;
    private idCodingUniformPointer: WebGLUniformLocation;
    private idSelectedIdUniformPointer: WebGLUniformLocation;
    private hoverPickColourUniformPointer: WebGLUniformLocation;
    private initialized = false;
    private transformation: mat4 = mat4.create();
    private mvMatrix: mat4 = mat4.create();
    private _hoverPickColour: number[] = [10, 150, 112, 255];

    /**
     * Set to true to stop rendering of this plugin
     */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) {
        this._stopped = value;
        if (value === false) {
            var region = this.viewer.getMergedRegion();
            var size = Math.sqrt(region.bbox[3] * region.bbox[3] + region.bbox[4] * region.bbox[4] + region.bbox[5] * region.bbox[5])
            this.setActive();
            const controlsSize = Math.min(this.viewer.unitsInMeter * 2, size * 0.1);
            this.bufferGeometry(controlsSize, size)

            this.updateTransformationFromPlane();
            this.applyCurrentPlane();
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
        this.pUniformPointer = gl.getUniformLocation(this.program, "uPMatrix");
        this.mvUniformPointer = gl.getUniformLocation(this.program, "uMvMatrix");
        this.idCodingUniformPointer = gl.getUniformLocation(this.program, "uColorCoding");
        this.idSelectedIdUniformPointer = gl.getUniformLocation(this.program, "uSelectedId");
        this.hoverPickColourUniformPointer = gl.getUniformLocation(this.program, 'uHoverPickColour');

        this.bufferGeometry(1, 1);

        this.initEvents();

        this.initialized = true;
        this.updateTransformationFromPlane();
        this.applyCurrentPlane();
    }

    onBeforeDraw(width: number, height: number): void {
        // this.applyCurrentPlane();
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
        gl.uniform1f(this.idCodingUniformPointer, -1);
        this.draw(gl);
    }

    private draw(gl: WebGLRenderingContext): void {
        if (this.stopped) {
            return;
        }

        if (!this.initialized) {
            return;
        }

        // set uniforms
        mat4.multiply(this.mvMatrix, this.viewer.mvMatrix, this.transformation)
        gl.uniformMatrix4fv(this.pUniformPointer, false, this.viewer.pMatrix);
        gl.uniformMatrix4fv(this.mvUniformPointer, false, this.mvMatrix);
        gl.uniform4fv(this.hoverPickColourUniformPointer,
            new Float32Array(
                [
                    this._hoverPickColour[0] / 255.0,
                    this._hoverPickColour[1] / 255.0,
                    this._hoverPickColour[2] / 255.0,
                    this._hoverPickColour[3] / 255.0
                ]));

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

    private bufferGeometry(size: number, planeSize: number): void {
        const segments = 50;

        const planeVertices = this.computePlaneVertices(planeSize);
        const arrowVerticesA = this.computeArrowVertices(size / 3.0, size, size / 1000.0);
        const arrowVerticesB = this.computeArrowVertices(size / 3.0, size, size / -1000.0);
        const arrowIndices = this.computeArrowIndices();

        const planeIndices = this.computePlaneIndices();
        const horizontalRingVertices = this.computeRingVertices(size * 0.9, size * 0.5, segments, (a, b) => [a, b, 0]);
        const verticalRingVertices = this.computeRingVertices(size * 0.9, size * 0.5, segments, (a, b) => [a, 0, b]);
        const ringIndices = this.computeRingIndices(segments);

        const vertices: number[] = [];
        vertices.push(...arrowVerticesA);
        vertices.push(...arrowVerticesB);
        vertices.push(...horizontalRingVertices);
        vertices.push(...verticalRingVertices);
        vertices.push(...planeVertices);
        this.vertices = new Float32Array(vertices);

        const indices: number[] = [];
        indices.push(...arrowIndices);
        indices.push(...arrowIndices.map(idx => idx + arrowVerticesA.length / 3))
        indices.push(...ringIndices.map(idx => idx + arrowVerticesA.length / 3 * 2))
        indices.push(...ringIndices.map(idx => idx + arrowVerticesA.length / 3 * 2 + horizontalRingVertices.length / 3 - 2));
        indices.push(...planeIndices.map(idx => idx + arrowVerticesA.length / 3 * 2 + horizontalRingVertices.length / 3 * 2));
        this.indices = new Uint16Array(indices);

        const ids: number[] = [];
        ids.push(...arrowVerticesA.filter((_, i) => i % 3 === 0).map(() => this.ARROW));
        ids.push(...arrowVerticesA.filter((_, i) => i % 3 === 0).map(() => this.ARROW));
        ids.push(...horizontalRingVertices.filter((_, i) => i % 3 === 0).map(() => this.HORIZONTAL));
        ids.push(...verticalRingVertices.filter((_, i) => i % 3 === 0).map(() => this.VERTICAL));
        ids.push(...planeVertices.filter((_, i) => i % 3 === 0).map(() => this.PLANE));
        this.ids = new Float32Array(ids);


        const colours: number[] = [];
        colours.push(...arrowVerticesA.filter((_, i) => i % 3 === 0).flatMap(() => this.arrowColour));
        colours.push(...arrowVerticesA.filter((_, i) => i % 3 === 0).flatMap(() => this.arrowColour));
        colours.push(...horizontalRingVertices.filter((_, i) => i % 3 === 0).flatMap(() => this.horizontalColour));
        colours.push(...verticalRingVertices.filter((_, i) => i % 3 === 0).flatMap(() => this.verticalColour));
        colours.push(...planeVertices.filter((_, i) => i % 3 === 0).flatMap(() => this.planeColour));
        this.colours = new Float32Array(colours);

        // bind buffers
        const gl = this.viewer.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colours_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colours, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.id_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.ids, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }

    private initEvents(): void {
        let action = -1;
        let lastMouseX: number = null;
        let lastMouseY: number = null;
        let lastNavigation: NavigationMode;
        let origin: vec3; 
        let originInPlaneSpace: vec3;
        
        this.viewer.canvas.addEventListener('pointerdown', event => {
            // don't do anything if this plugin is not active
            if (this.stopped || this.viewer.plugins.indexOf(this) < 0) {
                return;
            }

            const data = this.viewer.getEventDataFromEvent(event, true);
            // not an interaction with this UI control
            if (data.model !== 1000010 || data.id == this.PLANE) {
                return;
            }

            action = data.id;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            lastNavigation = this.viewer.navigationMode;
            origin = data.xyz;
            this.viewer.navigationMode = 'none'; 
 
            originInPlaneSpace = vec3.transformMat4(vec3.create(), origin, mat4.invert(mat4.create(), this.transformation));
        });

        window.addEventListener('pointerup', event => {
            if (action === -1) return;
            this.snapToMainAxes();
            this.applyCurrentPlane();
            action = -1;
            this.viewer.navigationMode = lastNavigation;
        });
        
        window.addEventListener('pointermove', event => {
             
            if (action === -1) {
                this.viewer.gl.uniform1f(this.idSelectedIdUniformPointer, action);
                return;
            }
            this.viewer.gl.uniform1f(this.idSelectedIdUniformPointer, action);
             
            var newX = event.clientX;
            var newY = event.clientY;

            var deltaX = newX - lastMouseX;
            var deltaY = newY - lastMouseY;
 
 
            lastMouseX = newX;
            lastMouseY = newY;
            const camera = this.viewer.getCameraPosition();
            
            const distance = vec3.distance(camera, origin);
             
            switch (action) {
                case this.ARROW:
                    let c = 0;
                    if (this.viewer.camera === CameraType.ORTHOGONAL) {
                        c = this.viewer.cameraProperties.height / this.viewer.height;
                    } else {
                        const fov = this.viewer.cameraProperties.fov * Math.PI / 180;
                        const h = 2 * distance * Math.tan(fov / 2.0);
                        c = h / this.viewer.height;
                    }

                    const draggingOffset = this.getDragOffset(c, deltaX, deltaY);
                    mat4.translate(this.transformation, this.transformation, draggingOffset);

                    break;
                case this.HORIZONTAL:
                    let angle = this.getRotatingAngle(deltaX, deltaY, originInPlaneSpace);
                    mat4.rotateZ(this.transformation, this.transformation, angle);
                    break;
                case this.VERTICAL: 
                    angle = this.getRotatingAngle(deltaX, deltaY, originInPlaneSpace, true);
                    mat4.rotateY(this.transformation, this.transformation, angle);
                    break;
            }

            this.applyCurrentPlane();
        });
    }

    private getRotatingAngle(deltaX: number, deltaY: number, originInPlaneSpace: vec3, vertical: boolean = false) : number {

        // project the rotating point origin to screen to work with 
        // screen mouse movemnt vectors 
        const modelViewRotation = mat4.getRotation(quat.create(), this.mvMatrix);
        const screenProjectedOrigin = vec3.transformQuat(vec3.create(), originInPlaneSpace, modelViewRotation);
        
        // reverse the angle according to if we are top or bottom of the plane of rotation 
        const camera = this.viewer.getCameraPosition();
        const planeOfRevert = vertical? this.getTangentPlaneEquation() : this.getPrependicularPlaneEquation();
        const topOrBottom = (planeOfRevert[0]*camera[0]) + (planeOfRevert[1]*camera[1]) + (planeOfRevert[2]*camera[2]) + (planeOfRevert[3]);
        
        // mouse movement vector
        const displacmentVector = vec3.fromValues(deltaX, -deltaY, 0);

        // move the rotating origin point with the displacement vector
        const displacedOrigin = vec3.add(vec3.create(), screenProjectedOrigin, displacmentVector);

        // calculate the angle bwteen the original vector and the rotated one
        const angle = vec3.angle(screenProjectedOrigin, displacedOrigin);

        const speed = (displacmentVector.length * this.viewer.unitsInMeter) / 100 ;

        // we use the vector perpendicular to the plane of rotation to determine 
        // if we are rotating clockwise or anti-clockwise 
        const signVector = vec3.cross(vec3.create(), displacedOrigin, screenProjectedOrigin);
        vec3.normalize(signVector, signVector);
      
        return (vertical? -1 : 1) * (topOrBottom > 0 ? -1 : 1) * signVector[2] * speed * angle;
    }
    
    private getDragOffset(speed: number, deltaX: number, deltaY: number) : vec3{
         
        const dragAxis = vec3.fromValues(1, 0, 0); 
         
        // we use this projected screen normal to map mouse movement
        // to actual drag axis
        const modelViewRotation = mat4.getRotation(quat.create(), this.mvMatrix); 
        const projectedNormal = vec3.transformQuat(vec3.create(), dragAxis, modelViewRotation);
        vec3.normalize(projectedNormal, projectedNormal)
        
        // calculate offset based on the projected axis orientation
        const offset = (deltaX * projectedNormal[0]) - (deltaY * projectedNormal[1]);
         
        // scale the dragging axis with the deduced offset and speed factor
        vec3.scale(dragAxis, dragAxis, offset * speed);

        return dragAxis;
    }

    private updateTransformationFromPlane() {
        if (this.viewer == null || this.stopped || this.viewer.plugins.indexOf(this) === -1 || this.viewer.activeHandles.length === 0) {
            return;
        }

        const plane = this.viewer.getClip()?.PlaneA;
        // no plane is defined, so we shall place it in the middle
        if (plane == null) {
            const region = this.viewer.getMergedRegion();
            this.transformation = mat4.translate(mat4.create(), mat4.create(), region.centre);
            return;
        } 
 
        // noraml, tangent and binormal of the plane
        const normal = vec3.normalize(vec3.create(), vec3.fromValues(plane[0], plane[1], plane[2]));
        const tangent = this.getTangent(normal);
        const binormal = vec3.cross(vec3.create(), normal, tangent);
        vec3.normalize(binormal, binormal);

        // plane point
        const planePoint = this.getPlanePoint(normal, plane[3]); 

        // build transformation
        const transform = mat4.fromValues(
            normal[0], normal[1], normal[2], 0,
            tangent[0], tangent[1], tangent[2], 0,
            binormal[0], binormal[1], binormal[2], 0,
            planePoint[0], planePoint[1], planePoint[2], 1);
          
            
        if(this.transformation && this.isTransformationsHasSameOrientation(this.transformation, transform, plane)){
            return;
        }
        
        this.transformation = transform;
        
    }

    private  isTransformationsHasSameOrientation (transform1 :mat4, transform2: mat4, plane: number[]) : boolean{
        const tolerance = 0.001; 
        // if the two planes has same normal
        if (Math.abs(transform1[0] - transform2[0]) < tolerance && Math.abs(transform1[1] - transform2[1]) < tolerance && 
            Math.abs(transform1[2] - transform2[2]) < tolerance && Math.abs(transform1[3] - transform2[3]) < tolerance) {
                // if the new transform placment lies on the older plane
                return Math.abs((plane[0] * transform2[12]) + (plane[1] * transform2[13]) + (plane[2] * transform2[14]) + plane[3]) < tolerance;
            }
    }

    private getPlanePoint(normal: vec3, dval: number): vec3 {

        const regionCentre = this.viewer.getMergedRegion()?.centre ?? vec3.create();
        
        let planePoint : vec3 = null;
        if(normal[2] != 0){
            const acc = (normal[0] * regionCentre[0]) + (normal[1] * regionCentre[1]) + dval;
            planePoint = vec3.fromValues(regionCentre[0], regionCentre[1], -1 * (acc / normal[2]));
        }
        else if(normal[1] != 0){
            const acc = (normal[0] * regionCentre[0]) + (normal[2] * regionCentre[2]) + dval;
            planePoint = vec3.fromValues(regionCentre[0], -1 * (acc / normal[1]), regionCentre[2]);
        }
        else if(normal[0] != 0){
            const acc = (normal[1] * regionCentre[1]) + (normal[2] * regionCentre[2]) + dval;
            planePoint = vec3.fromValues(-1 * (acc/ normal[0]), regionCentre[1], regionCentre[2]);
        }

        return planePoint;
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

    private applyCurrentPlane(): void {
        if (this.viewer == null || this.stopped || this.viewer.plugins.indexOf(this) === -1 || this.viewer.activeHandles.length === 0) {
            return;
        }
        const plane = this.getPlaneEquation();
        this.viewer.setClippingPlaneA(plane);
    }

    private snapToMainAxes(): void {
        const rotation = mat4.getRotation(quat.create(), this.transformation);
        const normal = vec3.transformQuat(vec3.create(), vec3.fromValues(1, 0, 0), rotation);

        const tolerance = Math.PI / 180.0 * 5;
        if (vec3.angle(normal, vec3.fromValues(0, 0, 1)) < tolerance) {
            const translation = mat4.getTranslation(vec3.create(), this.transformation);
            const yRoration = quat.rotateY(quat.create(), quat.create(), - Math.PI / 2.0);
            mat4.fromRotationTranslation(this.transformation, yRoration, translation);
        }
        if (vec3.angle(normal, vec3.fromValues(0, 0, -1)) < tolerance) {
            const translation = mat4.getTranslation(vec3.create(), this.transformation);
            const yRoration = quat.rotateY(quat.create(), quat.create(), Math.PI / 2.0);
            mat4.fromRotationTranslation(this.transformation, yRoration, translation);
        }
    }

    private getPlaneEquation(): number[] {
        const wcs = this.viewer.getCurrentWcs();
        const point = vec3.transformMat4(vec3.create(), vec3.create(), this.transformation);
        const normal = this.getPlaneNormal();
        //compute normal equation of the plane
        const d = 0.0 - normal[0] * (point[0] + wcs[0]) - normal[1] * (point[1] + wcs[1]) - normal[2] * (point[2] + wcs[2]);
        return [normal[0], normal[1], normal[2], d];
    }

    private getPrependicularPlaneEquation(): number[] {
        const wcs = this.viewer.getCurrentWcs();
        const point = vec3.transformMat4(vec3.create(), vec3.create(), this.transformation);
        const normal = this.getPlaneBinormal();
        const d = 0.0 - normal[0] * (point[0] + wcs[0]) - normal[1] * (point[1] + wcs[1]) - normal[2] * (point[2] + wcs[2]);
        return [normal[0], normal[1], normal[2], d];
    }

    private getTangentPlaneEquation(): number[] {
        const wcs = this.viewer.getCurrentWcs();
        const point = vec3.transformMat4(vec3.create(), vec3.create(), this.transformation);
        const normal = this.getPlaneTangent();
        const d = 0.0 - normal[0] * (point[0] + wcs[0]) - normal[1] * (point[1] + wcs[1]) - normal[2] * (point[2] + wcs[2]);
        return [normal[0], normal[1], normal[2], d];
    }

    private getPlaneNormal(): vec3 {
        const rotation = mat4.getRotation(quat.create(), this.transformation);
        const normal = vec3.transformQuat(vec3.create(), vec3.fromValues(1, 0, 0), rotation);
        return normal;
    }

    private getPlaneBinormal(): vec3 {
        const rotation = mat4.getRotation(quat.create(), this.transformation);
        const normal = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, 1), rotation);
        return normal;
    }

    private getPlaneTangent(): vec3 {
        const rotation = mat4.getRotation(quat.create(), this.transformation);
        const normal = vec3.transformQuat(vec3.create(), vec3.fromValues(0, -1, 0), rotation);
        return normal;
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
            viewer.error('Could not initialise shaders for a navigation cube plugin');
        }
    }

    private setActive(): WebGLRenderingContext {
        var gl = this.viewer.gl;
        gl.useProgram(this.program);
        return gl;
    }

    private computeArrowVertices(width: number, length: number, offset: number): number[] {
        const arrowRight = [
            0, offset, -width / 2.0,      // 0
            length, offset, -width / 2.0, // 1
            length, offset, width / 2.0,  // 2
            0, offset, width / 2.0,       // 3
            length, offset, -width,     // 4
            length + width, offset, 0,    // 5
            length, offset, width       // 6
        ];
        const arrowLeft = arrowRight.map((v, i) => i % 3 === 0 ? -1 * v : v);
        return arrowRight.concat(arrowLeft);
    }

    private computeArrowIndices(): number[] {
        return [
            0, 1, 2,
            0, 2, 3,
            4, 5, 6,

            9, 8, 7,
            9, 7, 10,
            13, 12, 11
        ];
    }

    private computeRingVertices(outerRadius: number, innerRadius: number, segments: number, pt: (a: number, b: number) => number[]): number[] {
        const vertices: number[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = Math.PI * 2.0 / segments * i;
            const a1 = Math.cos(angle) * innerRadius;
            const b1 = Math.sin(angle) * innerRadius;
            const a2 = Math.cos(angle) * outerRadius;
            const b2 = Math.sin(angle) * outerRadius;

            const pt1 = pt(a1, b1);
            const pt2 = pt(a2, b2);

            vertices.push(...pt1);
            vertices.push(...pt2);
        }
        return vertices;
    }

    private computeRingIndices(segments: number): number[] {
        const indices: number[] = [];
        for (let i = 0; i <= segments; i++) {
            const offset = i * 2
            indices.push(
                0 + offset, 1 + offset, 2 + offset,
                1 + offset, 3 + offset, 2 + offset);
        }
        return indices;
    }

    private computePlaneVertices(size: number): number[] {
        return [
            0, -size / 2.0, -size / 2.0,
            0, size / 2.0, -size / 2.0,
            0, size / 2.0, size / 2.0,
            0, -size / 2.0, size / 2.0
        ];
    }

    private computePlaneIndices(): number[] {
        return [
            0, 1, 2,
            0, 2, 3
        ];
    }
}