import { mat4, vec3, mat3 } from "gl-matrix";
import { NavigationMode, Viewer } from "../../viewer";
import { IPlugin } from "../plugin";
import { fshader } from "./fshader";
import { vshader } from "./vshader";
import { CameraType } from "../../camera";
import { quat } from "gl-matrix";
import { ClippingPlane } from "../../bcf/clipping-plane";
import { SectionBox } from "../../section-box";
import { sortAxisAlignedPlanes } from "./plane-sorting";
import { BoxFrame, facePlane, faceAxis, frameCorners, frameFromSectionBox, localToWorld, moveFace, rotatedYaw, worldDirection } from "./box-frame";

export class InteractiveSectionBox implements IPlugin {
    /**
     * Set to true to render the translucent face fill in addition to the edges
     */
    public showFill = true;

    /**
     * The colour of the section box faces
     */
    public boxColour = [0.5, 0.5, 0.6, 0.05];

    /**
     * The colour used when dragging an active section box face
     */
    public hoverPickColour: number[] = [10, 150, 112, 255];

    /** Handle size as a fraction of the canvas height, clamped to the pixel range below */
    public handleScreenFraction = 0.3;
    public handleMinPixels = 10;
    public handleMaxPixels = 20;

    /**
     * Set to false to hide the rotation handles (rotation about the vertical axis)
     */
    public rotationEnabled = true;

    /**
     * Colour of the rotation handles
     */
    public rotationHandleColour = [0.95, 0.6, 0.1];

    /** Rotation snaps to this many degrees unless Shift is held */
    public rotationSnapDegrees = 5;

    private viewer: Viewer;
    private vertices: Float32Array;
    private colours: Float32Array;

    private TOP = 1;
    private BOTTOM = 2; 
    private FRONT = 3;
    private BACK = 4;
    private RIGHT = 5;
    private LEFT = 6;

    
    private currentInteraction: number = -1;

    private program: WebGLProgram;
    private vertex_buffer: WebGLBuffer;
    private colours_buffer: WebGLBuffer;
    private id_buffer: WebGLBuffer;
    private index_buffer: WebGLBuffer;
    private edge_vertex_buffer: WebGLBuffer;
    private edge_dist_buffer: WebGLBuffer;
    private edge_id_buffer: WebGLBuffer;
    private edgeDashUniformPointer: WebGLUniformLocation;
    private readonly edgeVertexCount = 24;

    private handle_vertex_buffer: WebGLBuffer;
    private handle_colour_buffer: WebGLBuffer;
    private handle_id_buffer: WebGLBuffer;
    private handle_index_buffer: WebGLBuffer;
    private handleIndexCount = 0;
    // handle ids are face id + offset so they can be told apart from the faces
    private readonly HANDLE_ID_OFFSET = 10;
    // rotation handle ids (one per vertical edge) are ROTATE_ID_BASE + 1..4
    private readonly ROTATE_ID_BASE = 20;
    private hoverInteraction = -1;

    private edgeDashPeriod = 0;

    
    private edgeColourUniformPointer: WebGLUniformLocation;

    // corner index pairs of the 12 box edges (corner order as in buildBoxQuadsFromCorners)
    private readonly edgeCorners = [
        0, 1, 1, 3, 3, 2, 2, 0,
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 2, 6, 3, 7
    ];

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
    

    

    private readonly modelId = 1000011;

    /**
     * Set to true to stop rendering of this plugin
     */
    public get stopped(): boolean { return this._stopped; }
    public set stopped(value: boolean) {
        this._stopped = value;
        if (value === true && this.viewer) {
            this.hoverInteraction = -1;
            this.viewer.canvas.style.cursor = '';
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        }
        if (value === false) {
            if (this.viewer && !this.unsubscribe) {
                this.unsubscribe = this.viewer.sectionBox.addChangeListener(() => this.onSectionBoxChanged());
            }
            try {
                this.setSectionBox();
            } catch (e) {
                console.warn((e as Error).message);
            }
            this.setActive();
            this.bufferGeometry();
        }
        if (this.viewer) {
            this.viewer.draw();
        }
    }
    private _stopped = true;
    private hasBox = false;
    private frame: BoxFrame = { centre: [0, 0, 0], half: [1, 1, 1], yaw: 0 };
    private syncing = false;
    private unsubscribe: () => void = null;

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
        this.edgeColourUniformPointer = gl.getUniformLocation(this.program, 'uEdgeColour');
        this.edgeDashUniformPointer = gl.getUniformLocation(this.program, 'uDashPeriod');
        this.handle_vertex_buffer = gl.createBuffer();
        this.handle_colour_buffer = gl.createBuffer();
        this.handle_id_buffer = gl.createBuffer();
        this.handle_index_buffer = gl.createBuffer();
        this.edge_vertex_buffer = gl.createBuffer();
        this.edge_dist_buffer = gl.createBuffer();
        this.edge_id_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_id_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.edgeVertexCount), gl.STATIC_DRAW);

        this.bufferGeometry();
        
        this.initEvents();
        this.initialized = true;
    }

    /**
     * Sets the viewer's section box from 6 clipping planes forming a box (axis-aligned, or rotated about Z only)
     * and binds this tool to it. Convenience wrapper; the tool otherwise follows `viewer.sectionBox` automatically.
     */
    public setClippingPlanes(planes: ClippingPlane[]): void {
        let toSet = planes;
        try {
            toSet = sortAxisAlignedPlanes(planes);
        } catch (e) {
            // not axis-aligned: pass as is, setToPlanes validates it and setSectionBox checks it is Z-rotated only
        }
        this.syncing = true;
        try {
            if (!this.viewer.sectionBox.setToPlanes(toSet)) {
                throw new Error('The supplied clipping planes do not form a box.');
            }
        } finally {
            this.syncing = false;
        }
        this.setSectionBox();
    }

    /**
     * Binds the tool to the viewer's section box (or sets it from the supplied box first).
     * Clears the tool's box when the section box is not set.
     * @throws when the section box is tilted about the X or Y axis; only boxes rotated about Z can be edited
     */
    public setSectionBox(box?: SectionBox): void {
        if (box && box !== this.viewer.sectionBox) {
            this.syncing = true;
            try {
                this.viewer.sectionBox.setToBox(box);
            } finally {
                this.syncing = false;
            }
        }

        const current = this.viewer.sectionBox;
        if (!current.isSet) {
            this.hasBox = false;
        } else if (current.isZRotationOnly) {
            this.frame = frameFromSectionBox(current.location, current.lengthX, current.lengthY, current.lengthZ, current.rotationZ);
            this.hasBox = true;
        } else if (current.isAxisAligned) {
            // e.g. rotated by 90 degrees about X: the box is upright in the world frame with permuted extents
            const planes = sortAxisAlignedPlanes(current.toClippingPlanes());
            const loc = (i: number) => planes[i].location;
            this.frame = {
                centre: [(loc(2)[0] + loc(3)[0]) / 2, (loc(4)[1] + loc(5)[1]) / 2, (loc(0)[2] + loc(1)[2]) / 2],
                half: [(loc(2)[0] - loc(3)[0]) / 2, (loc(5)[1] - loc(4)[1]) / 2, (loc(0)[2] - loc(1)[2]) / 2],
                yaw: 0
            };
            this.hasBox = true;
        } else {
            this.hasBox = false;
            throw new Error('The section box is tilted. Only section boxes rotated about the vertical (Z) axis can be edited interactively.');
        }

        this.updateTransformations();
        if (!this.stopped && this.initialized) {
            this.bufferGeometry();
        }
        this.viewer.draw();
    }

    private updateTransformations(): void {
        for (let i = 0; i < 6; i++) {
            const plane = facePlane(this.frame, i);
            this.transformations[i] = this.getTransformationFromPlane(
                vec3.fromValues(plane.direction[0], plane.direction[1], plane.direction[2]),
                vec3.fromValues(plane.location[0], plane.location[1], plane.location[2]));
        }
    }

    private onSectionBoxChanged(): void {
        if (this.syncing) {
            return;
        }
        try {
            this.setSectionBox();
        } catch (e) {
            console.warn((e as Error).message);
        }
    }

    // the 8 corners of the box in the order expected by buildBoxQuadsFromCorners/edgeCorners
    private getCorners(): vec3[] {
        if (!this.hasBox) {
            return [];
        }
        return frameCorners(this.frame).map(c => vec3.fromValues(c[0], c[1], c[2]));
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
        this.draw(gl, true);
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

    private draw(gl: WebGLRenderingContext, drawEdges = false): void {
        if (this.stopped) {
            return;
        }

        if (!this.initialized || !this.hasBox) {
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
                    this.hoverPickColour[0] / 255.0,
                    this.hoverPickColour[1] / 255.0,
                    this.hoverPickColour[2] / 255.0,
                    this.hoverPickColour[3] / 255.0
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
        // Faces are only drawn in the picking passes unless fill is enabled
        if (drawEdges ? this.showFill : true) {
            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        if (drawEdges) {
            this.drawEdges(gl);
        }

        this.drawHandles(gl, !drawEdges);
    }

    private drawHandles(gl: WebGLRenderingContext, idPass: boolean): void {
        if (this.getCorners().length === 0) {
            return;
        }
        // size depends on the current camera so geometry is refreshed for every pass
        this.bufferHandles();
        if (this.handleIndexCount === 0) {
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_vertex_buffer);
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_colour_buffer);
        gl.vertexAttribPointer(this.coloursAttributePointer, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_id_buffer);
        gl.vertexAttribPointer(this.idsAttributePointer, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.handle_index_buffer);

        const previousDepthFunc = gl.getParameter(gl.DEPTH_FUNC);

        // Handles are always shown and always pickable, regardless of what is in front of them.
        // Using the depth of the occluding model made them flicker whenever the model was drawn at reduced
        // detail (while navigating), so occlusion is deliberately ignored. Back-face culling provides the
        // correct self-occlusion of each (convex) handle.
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.depthFunc(gl.ALWAYS);

        if (idPass) {
            gl.drawElements(gl.TRIANGLES, this.handleIndexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            const active = this.currentInteraction > 0 ? this.currentInteraction : this.hoverInteraction;
            const activeId = active > this.ROTATE_ID_BASE ? active : active + this.HANDLE_ID_OFFSET;
            gl.uniform1f(this.idSelectedIdUniformPointer, active > 0 ? activeId : -1);
            gl.uniform1f(this.idCodingUniformPointer, -2);
            gl.uniform4fv(this.edgeColourUniformPointer, new Float32Array([0, 0, 0, 1]));
            gl.depthMask(false);
            gl.drawElements(gl.TRIANGLES, this.handleIndexCount, gl.UNSIGNED_SHORT, 0);
            gl.depthMask(true);
            gl.uniform1f(this.idCodingUniformPointer, 0);
        }

        gl.disable(gl.CULL_FACE);
        gl.depthFunc(previousDepthFunc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    }

    private bufferHandles(): void {
        const gl = this.viewer.gl;
        const corners = this.getCorners();
        const wcs = this.viewer.getCurrentWcs();
        const frame = this.frame;
        const centre = vec3.fromValues(frame.centre[0] - wcs[0], frame.centre[1] - wcs[1], frame.centre[2] - wcs[2]);
        const maxExtent = Math.max(frame.half[0], frame.half[1], frame.half[2]) * 2;
        // local box axes in the world
        const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(a => {
            const w = worldDirection(frame, a);
            return vec3.fromValues(w[0], w[1], w[2]);
        });

        // Handle size is defined in screen pixels so it's independent of box shape and camera distance
        const viewerHeight = Math.max(this.viewer.height, 1);
        const pixels = Math.min(Math.max(viewerHeight * this.handleScreenFraction, this.handleMinPixels), this.handleMaxPixels);
        const isOrtho = this.viewer.camera === CameraType.ORTHOGONAL;
        const fov = this.viewer.cameraProperties.fov * Math.PI / 180;
        const worldPerPixelAt = (point: vec3): number => {
            if (isOrtho) {
                return this.viewer.cameraProperties.height / viewerHeight;
            }
            const viewDepth = Math.abs(vec3.transformMat4(vec3.create(), point, this.viewer.mvMatrix)[2]);
            return (2 * viewDepth * Math.tan(fov / 2)) / viewerHeight;
        };

        const positions: number[] = [];
        const colours: number[] = [];
        const ids: number[] = [];
        const indices: number[] = [];
        const segments = 12;
        const tints = [[0.2, 0.4, 0.9], [0.2, 0.4, 0.9], [0.9, 0.25, 0.25], [0.9, 0.25, 0.25], [0.2, 0.7, 0.3], [0.2, 0.7, 0.3]];

        let id = 0;
        let tint = tints[0];
        const push = (p: vec3, shade: number) => {
            positions.push(p[0], p[1], p[2]);
            colours.push(tint[0] * shade, tint[1] * shade, tint[2] * shade, 0.95);
            ids.push(id);
            return positions.length / 3 - 1;
        };
        const vertexAt = (i: number) => vec3.fromValues(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        // emits the triangle wound so that it faces away from the interior reference point
        const tri = (a: number, b: number, c: number, ref: vec3) => {
            const pa = vertexAt(a), pb = vertexAt(b), pc = vertexAt(c);
            const normal = vec3.cross(vec3.create(), vec3.sub(vec3.create(), pb, pa), vec3.sub(vec3.create(), pc, pa));
            const centroid = vec3.scale(vec3.create(), vec3.add(vec3.create(), vec3.add(vec3.create(), pa, pb), pc), 1 / 3);
            if (vec3.dot(normal, vec3.sub(vec3.create(), centroid, ref)) >= 0) {
                indices.push(a, b, c);
            } else {
                indices.push(a, c, b);
            }
        };

        for (let face = 0; face < 6; face++) {
            const axis = faceAxis(face);
            const wn = worldDirection(frame, this.normals[face]);
            const n = vec3.fromValues(wn[0], wn[1], wn[2]);
            const origin = vec3.scaleAndAdd(vec3.create(), centre, n, frame.half[axis]);
            // never let a handle dwarf the box itself
            const size = Math.min(pixels * worldPerPixelAt(origin), maxExtent * 0.25);

            const u = axes[(axis + 1) % 3];
            const v = axes[(axis + 2) % 3];

            id = face + 1 + this.HANDLE_ID_OFFSET;
            tint = tints[face];
            const ring = (radius: number, height: number, shade: number) => {
                const first = positions.length / 3;
                for (let s = 0; s < segments; s++) {
                    const a = (s / segments) * Math.PI * 2;
                    const p = vec3.scaleAndAdd(vec3.create(), origin, n, height);
                    vec3.scaleAndAdd(p, p, u, Math.cos(a) * radius);
                    vec3.scaleAndAdd(p, p, v, Math.sin(a) * radius);
                    push(p, shade);
                }
                return first;
            };

            // A single closed cone pointing outwards, lifted slightly off the face
            const coneStart = size * 0.1;
            const coneBase = ring(size * 0.5, coneStart, 1.0);
            const coneBaseCentre = push(vec3.scaleAndAdd(vec3.create(), origin, n, coneStart), 1.0);
            const tip = push(vec3.scaleAndAdd(vec3.create(), origin, n, coneStart + size * 1.4), 1.0);
            const coneRef = vec3.scaleAndAdd(vec3.create(), origin, n, coneStart + size * 0.3);

            for (let s = 0; s < segments; s++) {
                const next = (s + 1) % segments;
                tri(coneBaseCentre, coneBase + s, coneBase + next, coneRef);
                tri(coneBase + s, coneBase + next, tip, coneRef);
            }
        }

        if (this.rotationEnabled) {
            tint = this.rotationHandleColour;
            // flat discs at the top end of the four vertical edges, pushed outwards from the box
            for (let corner = 0; corner < 4; corner++) {
                const sx = corner < 2 ? 1 : -1;
                const sy = corner % 2 === 0 ? 1 : -1;
                const local = [sx * frame.half[0], sy * frame.half[1], frame.half[2]];
                const wp = localToWorld(frame, local);
                const edgePoint = vec3.fromValues(wp[0] - wcs[0], wp[1] - wcs[1], wp[2] - wcs[2]);
                const size = Math.min(pixels * worldPerPixelAt(edgePoint), maxExtent * 0.25);
                const disc = edgePoint;
                const radius = size * 0.3;
                const half = size * 0.1;
                id = this.ROTATE_ID_BASE + corner + 1;

                const ringAt = (z: number, shade: number) => {
                    const first = positions.length / 3;
                    for (let s = 0; s < segments; s++) {
                        const a = (s / segments) * Math.PI * 2;
                        const p = vec3.scaleAndAdd(vec3.create(), disc, axes[2], z);
                        vec3.scaleAndAdd(p, p, axes[0], Math.cos(a) * radius);
                        vec3.scaleAndAdd(p, p, axes[1], Math.sin(a) * radius);
                        push(p, shade);
                    }
                    return first;
                };
                const top = ringAt(half, 1.0);
                const bottom = ringAt(-half, 0.7);
                const topCentre = push(vec3.scaleAndAdd(vec3.create(), disc, axes[2], half), 1.0);
                const bottomCentre = push(vec3.scaleAndAdd(vec3.create(), disc, axes[2], -half), 0.7);
                for (let s = 0; s < segments; s++) {
                    const next = (s + 1) % segments;
                    tri(topCentre, top + s, top + next, disc);
                    tri(bottomCentre, bottom + s, bottom + next, disc);
                    tri(top + s, top + next, bottom + s, disc);
                    tri(top + next, bottom + next, bottom + s, disc);
                }
            }
        }

        this.handleIndexCount = indices.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_colour_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.handle_id_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ids), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.handle_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    }

    private drawEdges(gl: WebGLRenderingContext): void {
        gl.uniform1f(this.idCodingUniformPointer, -1);
        gl.uniform1f(this.edgeDashUniformPointer, this.edgeDashPeriod);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_vertex_buffer);
        gl.vertexAttribPointer(this.coordinatesAttributePointer, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_dist_buffer);
        gl.vertexAttribPointer(this.coloursAttributePointer, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_id_buffer);
        gl.vertexAttribPointer(this.idsAttributePointer, 1, gl.FLOAT, false, 0, 0);

        // occluded parts of the edges: faint
        gl.depthFunc(gl.GREATER);
        gl.depthMask(false);
        gl.uniform4fv(this.edgeColourUniformPointer, new Float32Array([0.35, 0.4, 0.5, 0.25]));
        gl.drawArrays(gl.LINES, 0, this.edgeVertexCount);

        // visible parts of the edges
        gl.depthFunc(gl.LEQUAL);
        gl.uniform4fv(this.edgeColourUniformPointer, new Float32Array([0.35, 0.4, 0.5, 0.8]));
        gl.drawArrays(gl.LINES, 0, this.edgeVertexCount);

        gl.depthMask(true);
        gl.depthFunc(gl.LESS);
        gl.uniform1f(this.idCodingUniformPointer, 0);
        gl.uniform1f(this.edgeDashUniformPointer, 0);
    }

    private bufferEdges(): void {
        const gl = this.viewer.gl;
        const corners = this.getCorners();
        const wcs = this.viewer.getCurrentWcs();
        const positions: number[] = [];
        const dists: number[] = [];
        let totalLength = 0;
        for (let i = 0; i < this.edgeCorners.length; i += 2) {
            const a = corners[this.edgeCorners[i]];
            const b = corners[this.edgeCorners[i + 1]];
            const length = vec3.distance(a, b);
            totalLength += length;
            positions.push(a[0] - wcs[0], a[1] - wcs[1], a[2] - wcs[2]);
            positions.push(b[0] - wcs[0], b[1] - wcs[1], b[2] - wcs[2]);
            dists.push(0, 0, 0, 0, length, 0, 0, 0);
        }
        // dash length scales with the box so the pattern looks the same at any model scale
        this.edgeDashPeriod = (totalLength / 12) / 40;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edge_dist_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dists), gl.DYNAMIC_DRAW);
    }

    private bufferGeometry(): void {
        if (!this.hasBox) return;
        this.bufferEdges();
        const plansVertices: number[] = this.buildBoxQuadsFromCorners(this.getCorners());
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
        let startYaw = 0;
        let startAngle = 0;

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
            this.currentInteraction = data.id > this.ROTATE_ID_BASE ? data.id
                : data.id > this.HANDLE_ID_OFFSET ? data.id - this.HANDLE_ID_OFFSET : data.id;
            this.hoverInteraction = -1;
            this.viewer.canvas.style.cursor = 'grabbing';
            if (this.currentInteraction > this.ROTATE_ID_BASE) {
                startYaw = this.frame.yaw;
                startAngle = this.getPointerAngle(event);
            }
        });

        let hoverFrame: number = null;
        let lastHoverEvent: PointerEvent = null;
        this.viewer.canvas.addEventListener('pointermove', event => {
            if (this.stopped || this.currentInteraction !== -1 || event.buttons !== 0) {
                return;
            }
            lastHoverEvent = event;
            if (hoverFrame !== null) {
                return;
            }
            hoverFrame = requestAnimationFrame(() => {
                hoverFrame = null;
                if (this.stopped || this.currentInteraction !== -1) {
                    return;
                }
                const data = this.viewer.getEventDataFromEvent(lastHoverEvent, true);
                const hover = data.model === this.modelId && data.id > this.HANDLE_ID_OFFSET
                    ? (data.id > this.ROTATE_ID_BASE ? data.id : data.id - this.HANDLE_ID_OFFSET) : -1;
                if (hover !== this.hoverInteraction) {
                    this.hoverInteraction = hover;
                    this.viewer.canvas.style.cursor = hover > 0 ? 'grab' : '';
                    this.viewer.draw();
                }
            });
        });

        this.viewer.canvas.addEventListener('pointerleave', () => {
            if (this.hoverInteraction !== -1 && this.currentInteraction === -1) {
                this.hoverInteraction = -1;
                this.viewer.canvas.style.cursor = '';
                this.viewer.draw();
            }
        });

        window.addEventListener('pointerup', event => {
            if (this.currentInteraction === -1) return;
            this.currentInteraction = -1;
            this.viewer.canvas.style.cursor = '';
            this.viewer.navigationMode = lastNavigation;
            origin = null;
            this.viewer.draw();
        });
        
        window.addEventListener('pointermove', event => {
             
            if (this.currentInteraction === -1) {
                return;
            }
            if (this.currentInteraction > this.ROTATE_ID_BASE) {
                const angle = this.getPointerAngle(event);
                this.frame.yaw = rotatedYaw(startYaw, startAngle, angle, !event.shiftKey, this.rotationSnapDegrees * Math.PI / 180);
                this.applySectionBox();
                this.bufferGeometry();
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
            const distanceMoved = this.getDragDistance(c, deltaX, deltaY);
            const minSide = this.viewer.activeHandles[0].meter / 10;
            moveFace(this.frame, planeIndex, distanceMoved, minSide);

            this.applySectionBox();
            this.bufferGeometry();
        });
    }

    /**
     * Angle of the pointer around the box centre, measured on the horizontal plane through the box centre.
     * Falls back to the angle on screen when the view ray is nearly parallel to that plane.
     */
    private getPointerAngle(event: PointerEvent): number {
        const rect = this.viewer.canvas.getBoundingClientRect();
        const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = 1 - ((event.clientY - rect.top) / rect.height) * 2;

        const wcs = this.viewer.getCurrentWcs();
        const centre = vec3.fromValues(this.frame.centre[0] - wcs[0], this.frame.centre[1] - wcs[1], this.frame.centre[2] - wcs[2]);
        const viewProjection = mat4.multiply(mat4.create(), this.viewer.pMatrix, this.viewer.mvMatrix);
        const inverse = mat4.invert(mat4.create(), viewProjection);
        if (inverse) {
            const near = vec3.transformMat4(vec3.create(), vec3.fromValues(ndcX, ndcY, -1), inverse);
            const far = vec3.transformMat4(vec3.create(), vec3.fromValues(ndcX, ndcY, 1), inverse);
            const dir = vec3.sub(vec3.create(), far, near);
            vec3.normalize(dir, dir);
            if (Math.abs(dir[2]) > 1e-3) {
                const t = (centre[2] - near[2]) / dir[2];
                const hit = vec3.scaleAndAdd(vec3.create(), near, dir, t);
                return Math.atan2(hit[1] - centre[1], hit[0] - centre[0]);
            }
        }

        const projected = vec3.transformMat4(vec3.create(), centre, viewProjection);
        return Math.atan2(ndcY - projected[1], ndcX - projected[0]);
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

    // distance the dragged face should move along its outward normal for a pointer movement on screen
    private getDragDistance(speed: number, deltaX: number, deltaY: number): number {
        const normal = worldDirection(this.frame, this.normals[this.currentInteraction - 1]);
        const mv = this.viewer.mvMatrix;
        const projected = vec3.fromValues(
            mv[0] * normal[0] + mv[4] * normal[1] + mv[8] * normal[2],
            mv[1] * normal[0] + mv[5] * normal[1] + mv[9] * normal[2],
            mv[2] * normal[0] + mv[6] * normal[1] + mv[10] * normal[2]);
        vec3.normalize(projected, projected);
        return ((deltaX * projected[0]) - (deltaY * projected[1])) * speed;
    }

    private applySectionBox() {
        this.updateTransformations();

        const box = new SectionBox(null);
        box.location = vec3.fromValues(this.frame.centre[0], this.frame.centre[1], this.frame.centre[2]);
        box.lengthX = this.frame.half[0] * 2;
        box.lengthY = this.frame.half[1] * 2;
        box.lengthZ = this.frame.half[2] * 2;
        box.rotationX = 0;
        box.rotationY = 0;
        box.rotationZ = this.frame.yaw * 180 / Math.PI;

        this.syncing = true;
        try {
            this.viewer.sectionBox.setToBox(box);
        } finally {
            this.syncing = false;
        }
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
}