import { mat4, vec3 } from 'gl-matrix';
import { IPlugin } from '../plugin';
import { Viewer } from '../../viewer';
import { ProductIdentity } from '../../common/product-identity';

export class InteractiveClipping implements IPlugin {

    // tslint:disable: no-empty
    public onAfterDrawModelId(): void { }

    private _viewer: Viewer;

    public get canvas(): HTMLCanvasElement {
        return this._viewer.canvas;
    }

    public get width(): number {
        return this._viewer.width;
    }

    public get height(): number {
        return this._viewer.height;
    }

    /**
    * This method is only active when interactive clipping is active. It stops interactive clipping operation.
    * 
    * @function InteractiveClipping#stopClipping
    */
    //this is only a placeholder. It is actually created only when interactive clipping is active.
    public stopClipping() { }

    /**
    * Use this method to start interactive clipping of the model. This is based on SVG overlay
    * so SVG support is necessary for it. But as WebGL is more advanced technology than SVG it is sound assumption that it is present in the browser.
    * Use {@link Viewer.check Viewer.check()} to make sure it is supported at the very beginning of using of Viewer. Use {@link Viewer#unclip unclip()} method to 
    * unset clipping plane.
    *
    * @function Viewer#clip
    * @fires Viewer#clipped
    */
    public clip() {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = this.getSVGOverlay();
        var position: { x?: number, y?: number, angle?: number } = {};
        var down = false;
        var g: SVGElement;
        const viewer = this._viewer;

        var handleMouseDown = (event) => {
            if (down) {
                return;
            }
            down = true;

            viewer.disableTextSelection();

            var r = svg.getBoundingClientRect();
            position.x = event.clientX - r.left;
            position.y = event.clientY - r.top;
            position.angle = 0.0;

            //create very long vertical line going through the point
            g = document.createElementNS(ns, 'g') as SVGElement;
            g['setAttribute']('id', 'section');
            svg.appendChild(g);

            var line = document.createElementNS(ns, 'line');
            g['appendChild'](line);

            line.setAttribute('style', 'stroke:rgb(255,0,0);stroke-width:2');
            line.setAttribute('x1', position.x.toString());
            line.setAttribute('y1', '99999');
            line.setAttribute('x2', position.x.toString());
            line.setAttribute('y2', '-99999');
        };

        var handleMouseUp = (event) => {
            if (!down) {
                return;
            }

            //check if the points are not identical. 
            var r = svg.getBoundingClientRect();
            if (position.x == event.clientX - r.left && position.y == event.clientY - r.top) {
                return;
            }

            down = false;
            viewer.enableTextSelection();


            //get inverse transformation
            var transform = mat4.create();
            mat4.multiply(transform, viewer.pMatrix, viewer.mvMatrix);
            var inverse = mat4.create();
            mat4.invert(inverse, transform);

            //get normalized coordinates the point in WebGL CS
            var x1 = position.x / (viewer.width / 2.0) - 1.0;
            var y1 = 1.0 - position.y / (viewer.height / 2.0);

            //First point in WCS
            var A = vec3.create();
            vec3.transformMat4(A, [x1, y1, -1], inverse); //near clipping plane

            //Second point in WCS
            var B = vec3.create();
            vec3.transformMat4(B, [x1, y1, 1], inverse); //far clipping plane

            //Compute third point on plane
            var angle = position.angle * Math.PI / 180.0;
            var x2 = x1 + Math.cos(angle);
            var y2 = y1 + Math.sin(angle);

            //Third point in WCS
            var C = vec3.create();
            vec3.transformMat4(C, [x2, y2, 1], inverse); // far clipping plane


            //Compute normal in WCS
            var BA = vec3.subtract(vec3.create(), A, B);
            var BC = vec3.subtract(vec3.create(), C, B);
            var N = vec3.cross(vec3.create(), BA, BC);

            // discard any previous clippings
            viewer.unclip();
            // set clipping A for all handles
            viewer.clip([B[0], B[1], B[2]], [N[0], N[1], N[2]]);

            //clean
            svg.parentNode.removeChild(svg);
            svg.removeEventListener('mousedown', handleMouseDown, true);
            window.removeEventListener('mouseup', handleMouseUp, true);
            window.removeEventListener('mousemove', handleMouseMove, true);
        };

        var handleMouseMove = (event) => {
            if (!down) {
                return;
            }

            var r = svg.getBoundingClientRect();
            var x = event.clientX - r.left;
            var y = event.clientY - r.top;

            //rotate
            var dX = x - position.x;
            var dY = y - position.y;
            var angle = Math.atan2(dX, dY) * -180.0 / Math.PI + 90.0;

            //round to 5 DEG
            angle = Math.round(angle / 5.0) * 5.0
            position.angle = 360.0 - angle + 90;

            g['setAttribute']('transform', 'rotate(' + angle + ' ' + position.x + ' ' + position.y + ')');
        };

        //this._canvas.parentNode.appendChild(svg);
        document.documentElement.appendChild(svg)
        svg.addEventListener('mousedown', handleMouseDown, true);
        window.addEventListener('mouseup', handleMouseUp, true);
        window.addEventListener('mousemove', handleMouseMove, true);

        this.stopClipping = () => {
            svg.parentNode.removeChild(svg);
            svg.removeEventListener('mousedown', handleMouseDown, true);
            window.removeEventListener('mouseup', handleMouseUp, true);
            window.removeEventListener('mousemove', handleMouseMove, true);
            //clear also itself
            this.stopClipping = () => { };
        };
    }

    private getSVGOverlay(): SVGElement {
        var ns = 'http://www.w3.org/2000/svg';
        function getOffsetRect(elem) {
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docElem = document.documentElement;

            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientBottom = docElem['clientBottom'] || body['clientBottom'] || 0;
            var clientRight = docElem['clientRight'] || body['clientRight'] || 0;


            var top = Math.round(box.top + scrollTop - clientTop);
            var left = Math.round(box.left + scrollLeft - clientLeft);
            var bottom = Math.round(box.top + scrollTop - clientBottom);
            var right = Math.round(box.left + scrollLeft - clientRight);

            return { top: top, left: left, width: right - left, height: bottom - top };
        }

        //create SVG overlay
        var svg = document.createElementNS(ns, 'svg') as SVGElement;
        //document.body.appendChild(svg);

        var cRect = getOffsetRect(this.canvas);

        svg['style'].position = 'absolute';
        svg['style'].top = cRect.top + 'px';
        svg['style'].left = cRect.left + 'px';
        svg['style']['z-index'] = 100;
        svg.setAttribute('width', this.width.toString());
        svg.setAttribute('height', this.height.toString());

        return svg;
    }

    // --------------------------------- IPlugin interface -------------------------
    public init(viewer: Viewer): void {
        this._viewer = viewer;
    }

    public onBeforeDraw(width: number, height: number): void {
    }
    public onAfterDraw(width: number, height: number): void {
    }
    public onBeforeDrawId(): void {
    }
    public onAfterDrawId(): void {
    }
}