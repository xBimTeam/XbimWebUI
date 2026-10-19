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
     * Sets the viewer's section box from 6 axis-aligned clipping planes and binds this tool to it.
     * Convenience wrapper; the tool otherwise follows `viewer.sectionBox` automatically.
     */
    public setClippingPlanes(planes: ClippingPlane[]): void {
        const sorted = sortAxisAlignedPlanes(planes);
        this.syncing = true;
        try {
            if (!this.viewer.sectionBox.setToPlanes(sorted)) {
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
     * @throws when the section box is rotated; only axis-aligned boxes can be edited
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
        } else {
            if (!current.isAxisAligned) {
                this.hasBox = false;
                throw new Error('The section box is rotated. Only axis-aligned section boxes can be edited interactively.');
            }
            const planes = sortAxisAlignedPlanes(current.toClippingPlanes());
            planes.forEach((p, i) => {
                this.transformations[i] = this.getTransformationFromPlane(this.normals[i], vec3.fromValues(p.location[0], p.location[1], p.location[2]));
            });
            this.hasBox = true;
        }

        if (!this.stopped && this.initialized) {
            this.bufferGeometry();
        }
        this.viewer.draw();
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
        const t = this.transformations;
        const corners: vec3[] = [];
        for (let bottom = 0; bottom < 2; bottom++) {
            for (let back = 0; back < 2; back++) {
                for (let right = 0; right < 2; right++) {
                    corners.push(vec3.fromValues(
                        t[back ? 3 : 2][12],
                        t[right ? 5 : 4][13],
                        t[bottom ? 1 : 0][14]));
                }
            }
        }
        return corners;
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
            gl.uniform1f(this.idSelectedIdUniformPointer, active > 0 ? active + this.HANDLE_ID_OFFSET : -1);
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
        const min = vec3.fromValues(Infinity, Infinity, Infinity);
        const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        corners.forEach(c => {
            for (let k = 0; k < 3; k++) {
                min[k] = Math.min(min[k], c[k] - wcs[k]);
                max[k] = Math.max(max[k], c[k] - wcs[k]);
            }
        });
        const centre = vec3.lerp(vec3.create(), min, max, 0.5);
        const maxExtent = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);

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

        for (let face = 0; face < 6; face++) {
            const n = this.normals[face];
            const axis = Math.abs(n[0]) > 0.5 ? 0 : Math.abs(n[1]) > 0.5 ? 1 : 2;
            const origin = vec3.clone(centre);
            origin[axis] = n[axis] > 0 ? max[axis] : min[axis];
            // never let a handle dwarf the box itself
            const size = Math.min(pixels * worldPerPixelAt(origin), maxExtent * 0.25);

            const u = vec3.fromValues(0, 0, 0);
            const v = vec3.fromValues(0, 0, 0);
            u[(axis + 1) % 3] = 1;
            v[(axis + 2) % 3] = 1;

            const id = face + 1 + this.HANDLE_ID_OFFSET;
            const tint = tints[face];
            const push = (p: vec3, shade: number) => {
                positions.push(p[0], p[1], p[2]);
                colours.push(tint[0] * shade, tint[1] * shade, tint[2] * shade, 0.95);
                ids.push(id);
                return positions.length / 3 - 1;
            };
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

            for (let s = 0; s < segments; s++) {
                const next = (s + 1) % segments;
                tri(coneBaseCentre, coneBase + s, coneBase + next, coneRef);
                tri(coneBase + s, coneBase + next, tip, coneRef);
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
            this.currentInteraction = data.id > this.HANDLE_ID_OFFSET ? data.id - this.HANDLE_ID_OFFSET : data.id;
            this.hoverInteraction = -1;
            this.viewer.canvas.style.cursor = 'grabbing';
            rotation = mat4.getRotation(quat.create(), this.transformations[this.currentInteraction - 1]); 
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
                    ? data.id - this.HANDLE_ID_OFFSET : -1;
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
    
        let planes = this.transformations.map((t,i) => {
            var plane = new ClippingPlane();
            let normal = this.getNormal(i);
            plane.direction = [normal[0], 
                             normal[1], 
                             normal[2]];
            plane.location = [t[12], t[13], t[14]];
            return plane;
        });
        planes = sortAxisAlignedPlanes(planes);
        
        this.syncing = true;
        try {
            this.viewer.sectionBox.setToPlanes(planes);
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

    private clampPlanes(currentInteraction: number): boolean {
   
        const topZ = this.transformations[0][14];
        const bottomZ = this.transformations[1][14];
        const front = this.transformations[2][12];
        const back = this.transformations[3][12];
        const left = this.transformations[4][13];
        const right = this.transformations[5][13];
        const minSide = this.viewer.activeHandles[0].meter / 10;

        if (topZ - bottomZ <= minSide && (currentInteraction == this.TOP || currentInteraction == this.BOTTOM)) {
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