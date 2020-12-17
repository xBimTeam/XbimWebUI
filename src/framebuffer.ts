import { DepthReader } from "./shaders/depth-reader";
import { vec3 } from "gl-matrix";

export class Framebuffer {
    public framebuffer: WebGLFramebuffer;
    public renderbuffer: WebGLRenderbuffer;
    public texture: WebGLTexture;
    public depthTexture: WebGLTexture;
    public isReady = true;

    private _disposed: boolean = false;
    private _depthReader: DepthReader;
    private _glVersion = 1;

    // only create depth reader when needed
    private get depthReader(): DepthReader {
        if (this._depthReader != null) {
            return this._depthReader;
        }

        this._depthReader = new DepthReader(this.gl, this.glVersion);
        return this._depthReader;
    }

    constructor(
        private gl: WebGLRenderingContext,
        public width: number,
        public height: number,
        private withDepth: boolean,
        private glVersion: number
    ) {
        // width and height should be whole numbers
        this.width = width = Math.floor(width);
        this.height = height = Math.floor(height);

        if (width === 0 || height === 0) {
            this.isReady = false;
            return;
        }


        this._glVersion = glVersion;
        //create framebuffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // create renderbuffer
        this.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        // allocate renderbuffer
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        this.texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        // Set the parameters so we can render any image size.        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        // Create the depth texture
        if (withDepth) {
            this.depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (this._glVersion === 1) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
            }
        }

        // attach renderbuffer and texture and depth texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        if (withDepth) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
        } else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
        }

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('this combination of attachments does not work');
        }
    }

    public bind(): void {
        if (!this.isReady)
            return;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    }

    /**
     * Returns one pixel at defined position
     */
    public getPixel(x: number, y: number): Uint8Array {
        if (!this.isReady)
            return null;
        var result = new Uint8Array(4);
        this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, result);
        return result;
    }

    public getDepth(x: number, y: number): number {
        if (!this.isReady)
            return null;
        if (this.withDepth) {
            return this.depthReader.getDepth(x, y, this.depthTexture, this.width, this.height);
        } else {
            return -1;
        }
    }

    public getDepths(points: { x: number, y: number }[]): number[] {
        if (this.withDepth && this.isReady) {
            return this.depthReader.getDepths(points, this.depthTexture, this.width, this.height);
        } else {
            return null;
        }
    }

    public getXYZArray(points: { x: number, y: number }[]): vec3[] {
        if (!this.withDepth || !this.isReady) {
            return null;
        }

        const depths = this.getDepths(points);

        return depths.map((depth, i) => {
            if (depth === 255) { // infinity (= nothing, no value)
                return null;
            }

            // convert values to clip space where x and y are [-1, 1] and z is [0, 1]
            const point = points[i];
            const xc = point.x / this.width * 2.0 - 1.0;
            const yc = point.y / this.height * 2.0 - 1.0;
            const zc = (depth / 255.0 - 0.5) * 2.0;

            return vec3.fromValues(xc, yc, zc);
        });
    }

    /**
     * Computes normalised X, Y, Z of event in the clip space
     * 
     * @param x X coordinate of the event
     * @param y Y coordinate of the event
     */
    public getXYZ(x: number, y: number): vec3 {
        if (!this.withDepth || !this.isReady) {
            return null;
        }

        return this.getXYZArray([{ x, y }])[0];
    }

    /**
     * Computes normalised X, Y, Z of event in the clip space with near and far bounds,
     * This can be used to refine near and far clipping planes for more precise evaluation
     * in the second pass.
     * 
     * @param x X coordinate of the event
     * @param y Y coordinate of the event
     */
    public getXYZRange(x: number, y: number): { near: vec3, middle: vec3, far: vec3 } {
        if (!this.withDepth || !this.isReady) {
            return null;
        }

        const depth = this.getDepth(x, y);
        if (depth === 255) { // infinity
            return null;
        }

        // convert values to clip space where x and y are [-1, 1] and z is [0, 1]
        const xc = x / this.width * 2.0 - 1.0;
        const yc = y / this.height * 2.0 - 1.0;
        const zc = (depth / 255.0 - 0.5) * 2.0;

        const depthNear = Math.max(depth - 1, 0);
        const zcn = (depthNear / 255.0 - 0.5) * 2.0;

        const depthFar = Math.min(depth + 1, 255);
        const zcf = (depthFar / 255.0 - 0.5) * 2.0;

        return {
            far: vec3.fromValues(xc, yc, zcf),
            near: vec3.fromValues(xc, yc, zcn),
            middle: vec3.fromValues(xc, yc, zc)
        };
    }

    public getId(x: number, y: number): number {
        if (!this.isReady)
            return null;

        const result = this.getPixel(x, y);

        //decode ID (bit shifting by multiplication)
        var hasValue = result[3] !== 0; //0 transparency is only for no-values
        if (hasValue) {
            var id = result[0] + result[1] * 256 + result[2] * 256 * 256;
            return id;
        } else {
            return null;
        }
    }

    public getIds(points: { x: number, y: number }[]): number[] {
        if (!this.isReady)
            return null;

        return points.map(p => {
            const result = this.getPixel(p.x, p.y);

            //decode ID (bit shifting by multiplication)
            var hasValue = result[3] !== 0; //0 transparency is only for no-values
            if (hasValue) {
                var id = result[0] + result[1] * 256 + result[2] * 256 * 256;
                return id;
            } else {
                return null;
            }
        });
    }

    public getImageDataArray(): Uint8ClampedArray {
        if (!this.isReady)
            return null;

        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);

        // Read the contents of the framebuffer
        var data = new Uint8Array(this.width * this.height * 4);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data);



        // Flip the image data vertically (discrepancy between coordinates)
        let transData = new Uint8ClampedArray(this.width * this.height * 4);
        for (let i = 0; i < this.height; i++) {
            let row = data.subarray(i * this.width * 4, (i + 1) * this.width * 4);
            let transIndex = this.height - i - 1;
            transData.set(new Uint8ClampedArray(row), transIndex * this.width * 4);
        }
        return transData;
    }

    public get2DCanvas(): HTMLCanvasElement {
        if (!this.isReady)
            return document.createElement('canvas');

        // get transposed data
        const transData = this.getImageDataArray();

        // Create a 2D canvas to store the result 
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this.width, this.height);
        imageData.data.set(new Uint8ClampedArray(transData));
        context.putImageData(imageData, 0, 0);

        return canvas;
    }

    /**
     * Gets current image data from the framebuffer as Base64 string
     */
    public getImageDataUrl(type: 'png' | 'jpeg' = 'png'): string {
        if (!this.isReady)
            return null;

        let canvas = this.get2DCanvas();
        return canvas.toDataURL(`image/${type}`);
    }

    /**
     * Gets current image data as a BLOB. Use callback to handle data.
     * @param callback Use callback to handle Blob
     */
    public getImageDataBlob(callback: (blob: Blob) => void, type: 'png' | 'jpeg' = 'png'): void {
        if (!this.isReady)
            return;

        let canvas = this.get2DCanvas();
        canvas.toBlob(callback, `image/${type}`);
    }

    /**
     * Deletes all WebGL objects it holds
     */
    public delete() {
        if (this._disposed || !this.isReady)
            return;

        const gl = this.gl;
        if (typeof (WebGL2RenderingContext) !== 'undefined' && gl instanceof WebGL2RenderingContext) {
            gl.invalidateFramebuffer(gl.FRAMEBUFFER, [gl.COLOR_ATTACHMENT0, gl.DEPTH_ATTACHMENT]);
        }

        gl.deleteFramebuffer(this.framebuffer);
        gl.deleteRenderbuffer(this.renderbuffer);
        gl.deleteTexture(this.texture);
        gl.deleteTexture(this.depthTexture);

        if (this._depthReader != null) {
            this._depthReader.delete();
        }

        this._disposed = true;
    }
}
