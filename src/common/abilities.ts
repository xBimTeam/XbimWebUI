import { WebGLUtils } from "./webgl-utils";
import { CheckResult } from "./checkresult";

export class Abilities {
    public static check(): CheckResult {

        var result = new CheckResult();

        //check WebGL support
        var canvas = document.createElement('canvas');
        if (!canvas) {
            result.errors.push("Browser doesn't have support for HTMLCanvasElement. This is critical.");
        } else {
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
            } else {
                //check floating point extension availability for WebGL 1.0
                var fpt = glVersion < 2 ? (
                    gl.getExtension('OES_texture_float') ||
                    gl.getExtension('MOZ_OES_texture_float') ||
                    gl.getExtension('WEBKIT_OES_texture_float')
                ) : true;

                if (!fpt) {
                    result.errors.push('Floating point texture extension is not supported.');
                }

                const dte = glVersion < 2 ? (
                    gl.getExtension('WEBGL_depth_texture') ||
                    gl.getExtension('WEBKIT_WEBGL_depth_texture') ||
                    gl.getExtension('MOZ_WEBGL_depth_texture')
                ) : true;

                if (!dte) {
                    result.warnings.push("Depth texture extension is not available. It will not be possible to get 3D coordinates of user interactions.");
                }

                //check number of supported vertex shader textures. Minimum is 5 but standard requires 0.
                var vertTextUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
                if (vertTextUnits < 4) {

                    result.errors.push('Browser supports only ' +
                        vertTextUnits +
                        ' vertex texture image units but minimal requirement for the viewer is 4.');
                }
            }
        }

        //check FileReader and Blob support
        if (!window['File'] ||
            !window['FileReader'] ||
            !window.Blob) {
            result.errors.push("Browser doesn't support 'File', 'FileReader' or 'Blob' objects.");
        }


        //check for typed arrays
        if (!window['Int32Array'] || !window['Float32Array']) {
            result.errors
                .push("Browser doesn't support TypedArrays. These are crucial for binary parsing and for comunication with GPU.");
        }
        //set boolean members for convenience
        if (result.errors.length == 0) {
            result.noErrors = true;
        }
        if (result.warnings.length == 0) { result.noWarnings = true; }
        return result;
    }
}