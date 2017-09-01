export class Framebuffer {
    public framebuffer: WebGLFramebuffer;
    public renderbuffer: WebGLRenderbuffer;
    public texture: WebGLTexture;

    private _disposed: boolean = false;

    constructor(
        private gl: WebGLRenderingContext,
        public width: number,
        public height: number
    ) {
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
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 


        // attach renderbuffer and texture
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('this combination of attachments does not work');
        }
    }

    public get2DCanvas(): HTMLCanvasElement
    {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

        // Read the contents of the framebuffer
        var data = new Uint8Array(this.width * this.height * 4);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data);

        // Create a 2D canvas to store the result 
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext('2d');

        // Flip the image data vertically (discrepancy between coordinates)
        let transData = new Uint8ClampedArray(this.width * this.height * 4);
        for (let i = 0; i < this.height; i++) {
            let row = data.subarray(i * this.width * 4, (i + 1) * this.width * 4);
            let transIndex = this.height - i - 1;
            transData.set(new Uint8ClampedArray(row), transIndex * this.width * 4);
        }

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this.width, this.height);
        imageData.data.set(new Uint8ClampedArray(transData));
        context.putImageData(imageData, 0, 0);

        return canvas;
    }

    /**
     * Gets current image data from the framebuffer as Base64 string
     */
    public getImageDataUrl(): string {
        let canvas = this.get2DCanvas();
        return canvas.toDataURL('image/png');
    }

    /**
     * Gets current image data as a BLOB. Use callback to handle data.
     * @param callback Use callback to handle Blob
     */
    public getImageDataBlob(callback: (blob: Blob) => void): void {
        let canvas = this.get2DCanvas();
        canvas.toBlob(callback, 'image/png');
    }

    /**
     * Deletes all WebGL objects it holds
     */
    public delete() {
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteRenderbuffer(this.renderbuffer);
        this.gl.deleteTexture(this.texture);

        this._disposed = true;
    }
}