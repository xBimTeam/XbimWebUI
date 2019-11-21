export class ModelPointers {
    public NormalAttrPointer: number;
    public IndexlAttrPointer: number;
    public ProductAttrPointer: number;
    public StateAttrPointer: number;
    public StyleAttrPointer: number;
    public TransformationAttrPointer: number;

    public VertexSamplerUniform: WebGLUniformLocation;
    public MatrixSamplerUniform: WebGLUniformLocation;
    public StyleSamplerUniform: WebGLUniformLocation;
    public VertexTextureSizeUniform: WebGLUniformLocation;
    public MatrixTextureSizeUniform: WebGLUniformLocation;
    public StyleTextureSizeUniform: WebGLUniformLocation;
    public MeterUniform: WebGLUniformLocation;
    public WcsUniform: WebGLUniformLocation;

    public ClippingAUniform: WebGLUniformLocation;
    public ClippingBUniform: WebGLUniformLocation;
    public ClippingPlaneAUniform: WebGLUniformLocation;
    public ClippingPlaneBUniform: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {

        //get attribute pointers
        this.NormalAttrPointer = gl.getAttribLocation(program, 'aNormal');
        this.IndexlAttrPointer = gl.getAttribLocation(program, 'aVertexIndex');
        this.ProductAttrPointer = gl.getAttribLocation(program, 'aProduct');
        this.StateAttrPointer = gl.getAttribLocation(program, 'aState');
        this.StyleAttrPointer = gl.getAttribLocation(program, 'aStyleIndex');
        this.TransformationAttrPointer = gl.getAttribLocation(program, 'aTransformationIndex');

        //get uniform pointers
        this.VertexSamplerUniform = gl.getUniformLocation(program, 'uVertexSampler');
        this.MatrixSamplerUniform = gl.getUniformLocation(program, 'uMatrixSampler');
        this.StyleSamplerUniform = gl.getUniformLocation(program, 'uStyleSampler');
        this.VertexTextureSizeUniform = gl.getUniformLocation(program, 'uVertexTextureSize');
        this.MatrixTextureSizeUniform = gl.getUniformLocation(program, 'uMatrixTextureSize');
        this.StyleTextureSizeUniform = gl.getUniformLocation(program, 'uStyleTextureSize');
        this.ClippingPlaneAUniform = gl.getUniformLocation(program, 'uClippingPlaneA');
        this.ClippingAUniform = gl.getUniformLocation(program, 'uClippingA');
        this.ClippingPlaneBUniform = gl.getUniformLocation(program, 'uClippingPlaneB');
        this.ClippingBUniform = gl.getUniformLocation(program, 'uClippingB');
        this.MeterUniform = gl.getUniformLocation(program, 'uMeter');
        this.WcsUniform = gl.getUniformLocation(program, 'uWcs');


        //enable vertex attributes arrays
        gl.enableVertexAttribArray(this.NormalAttrPointer);
        gl.enableVertexAttribArray(this.IndexlAttrPointer);
        gl.enableVertexAttribArray(this.ProductAttrPointer);
        gl.enableVertexAttribArray(this.StateAttrPointer);
        gl.enableVertexAttribArray(this.StyleAttrPointer);
        gl.enableVertexAttribArray(this.TransformationAttrPointer);
    }
}
