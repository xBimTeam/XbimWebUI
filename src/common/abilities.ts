import { WebGLUtils } from "./webgl-utils";

/**
 * This is a structure reporting errors and warnings about prerequisites of {@link Viewer Viewer}. It is result of {@link Viewer.checkPrerequisities checkPrerequisities()} static method.
 *
 * @name Prerequisites
 * @class
 */
export class CheckResult {
    /**
    * If this array contains any warnings Viewer will work but it might be slow or may not support full functionality.
    * @member {string[]}  Prerequisites#warnings
    */
    warnings: string[] = [];
    /**
    * If this array contains any errors Viewer won't work at all or won't work as expected. 
    * You can use messages in this array to report problems to user. However, user won't probably 
    * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
    * The latest version of IE should be all right.
    * @member {string[]}  Prerequisites#errors
    */
    errors: string[] = [];
    /**
    * If false Viewer won't work at all or won't work as expected. 
    * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably 
    * be able to do to much with it except trying to use different browser. IE10- are not supported for example. 
    * The latest version of IE should be all right.
    * @member {string[]}  Prerequisites#noErrors
    */
    noErrors: boolean = false;
    /**
    * If false Viewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
    * @member {string[]}  Prerequisites#noWarnings
    */
    noWarnings: boolean = false;
}

export class Abilities {
    public static check(): CheckResult {

        var result = new CheckResult();

        //check WebGL support
        var canvas = document.createElement('canvas');
        if (!canvas) result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
        else {
            let gl: WebGLRenderingContext = null;
            let glVersion = 0;
            WebGLUtils.setupWebGL(canvas, (ctx, v) => {
                gl = ctx;
                glVersion = v;
            }, null, (err) => {
                result.errors.push(err);
            });
            if (gl == null) {
                result.errors.push("Browser doesn't support WebGL. This is critical.");
            }
            else {
                //check floating point extension availability for WebGL 1.0
                var fpt = glVersion < 2 ? (
                    gl.getExtension('OES_texture_float') ||
                    gl.getExtension('MOZ_OES_texture_float') ||
                    gl.getExtension('WEBKIT_OES_texture_float')
                ) : true;

                if (!fpt) {
                    result.errors.push('Floating point texture extension is not supported.');
                }

                //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
                var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
                if (vertTextUnits < 4)
                    result.errors.push('Browser supports only ' +
                        vertTextUnits +
                        ' vertex texture image units but minimal requirement for the viewer is 4.');
            }
        }

        //check FileReader and Blob support
        if (!window['File'] ||
            !window['FileReader'] ||
            !window.Blob) result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");


        //check for typed arrays
        if (!window['Int32Array'] || !window['Float32Array'])
            result.errors
                .push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");

        //set boolean members for convenience
        if (result.errors.length == 0) result.noErrors = true;
        if (result.warnings.length == 0) result.noWarnings = true;
        return result;
    }
}