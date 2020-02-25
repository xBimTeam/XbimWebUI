import { Viewer } from "../viewer";
import { ProductIdentity } from "../common/product-identity";
import { vec3, mat4, quat, vec2 } from "gl-matrix";

export class MouseNavigation {
    public static initMouseEvents(viewer: Viewer) {
        let mouseDown = false;
        let lastMouseX = null;
        let lastMouseY = null;
        let startX = null;
        let startY = null;
        let button = 'L';
        let id = -1;
        let modelId = -1;
        let xyz: vec3 = null;
        let isPointerLocked = false;

        let origin = vec3.create();

        //set initial conditions so that different gestures can be identified
        const handleMouseDown = (event: MouseEvent) => {
            mouseDown = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            startX = event.clientX;
            startY = event.clientY;

            //get coordinates within canvas (with the right orientation)
            let r = viewer.canvas.getBoundingClientRect();
            let viewX = startX - r.left;
            let viewY = viewer.height - (startY - r.top);

            //this is for picking
            const data = viewer.getEventData(viewX, viewY);
            if (data == null) {
                mouseDown = false;
                return;
            }

            id = data.id;
            modelId = data.model;
            xyz = data.xyz;

            if (data == null || data.id == null || data.model == null) {
                const region = viewer.getMergedRegion();
                if (region == null || region.centre == null) {
                    // there is nothing in the viewer
                    mouseDown = false;
                    return;
                }
                origin = vec3.fromValues(region.centre[0], region.centre[1], region.centre[2]);
            } else if (data.xyz == null) {
                const bb = viewer.getTargetBoundingBox(data.id, data.model);
                origin = vec3.fromValues(bb[0] + bb[3] /2.0, bb[1] + bb[4] /2.0, bb[2] + bb[5] /2.0);
            } else {
                origin = data.xyz
            }

            //keep information about the mouse button
            switch (event.button) {
                case 0:
                    button = 'left';
                    break;

                case 1:
                    button = 'middle';
                    break;

                case 2:
                    button = 'right';
                    break;

                default:
                    button = 'left';
                    break;
            }

            viewer.disableTextSelection();
        };

        const handleMouseUp = (event: MouseEvent) => {
            if (!mouseDown)
                return;
                
            mouseDown = false;

            const endX = event.clientX;
            const endY = event.clientY;

            const deltaX = Math.abs(endX - startX);
            const deltaY = Math.abs(endY - startY);

            //if it was a longer movement do not perform picking
            if (deltaX < 3 && deltaY < 3 && button === 'left') {

                /**
                * Occurs when user click on model.
                *
                * @event Viewer#pick
                * @type {object}
                * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
                * @param {Number} model - Model ID
                * @param {MouseEvent} event - Original HTML event
                */
                viewer.fire('pick', { id: id, model: modelId, event: event, xyz: xyz });
                // Handle double-click
                let time = (new Date()).getTime();
                if (time - timer < 250) {
                    viewer.fire('dblclick', { id: id, model: modelId, event: event, xyz: xyz });
                }
                timer = time;
            }

            viewer.enableTextSelection();
        };


        var handleLookAround = (event: MouseEvent) => {
            const sensitivity = 0.5;
            if (viewer.navigationMode !== 'walk') {
                return;
            }

            viewer.navigate('look-at', event.movementX * sensitivity, event.movementY * sensitivity, origin);

        };

        var handleMouseMove = (event: MouseEvent) => {
            if (!mouseDown) {
                return;
            }

            if (viewer.navigationMode === 'none') {
                return;
            }

            var newX = event.clientX;
            var newY = event.clientY;

            var deltaX = newX - lastMouseX;
            var deltaY = newY - lastMouseY;

            lastMouseX = newX;
            lastMouseY = newY;

            if (button === 'left') {
                if (event.shiftKey) {
                    viewer.navigate('pan', deltaX, deltaY, origin);
                } else {
                    switch (viewer.navigationMode) {
                        case 'free-orbit':
                            viewer.navigate('free-orbit', deltaX, deltaY, origin);
                            break;

                        case 'fixed-orbit':
                        case 'orbit':
                            viewer.navigate('orbit', deltaX, deltaY, origin);
                            break;

                        case 'pan':
                            viewer.navigate('pan', deltaX, deltaY, origin);
                            break;

                        case 'zoom':
                            viewer.navigate('zoom', deltaX, deltaY, origin);
                            break;

                        case 'look-around':
                            viewer.navigate('look-around', deltaX, deltaY, origin);
                            break;

                        default:
                            break;
                    }
                }
            }
            if (button === 'middle' || button === 'right') {
                viewer.navigate('pan', deltaX, deltaY, origin);
            }

        };

        let scrollOrigin: vec3 = null;
        let lastScrollPoint: vec2 = null;
        let scrollCounter = 0;
        var handleMouseScroll = (event: WheelEvent) => {
            if (viewer.navigationMode === 'none') {
                return;
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }

            scrollCounter++;
            const scrollPoint = vec2.fromValues(event.clientX, event.clientY);
            if (lastScrollPoint == null || vec2.dist(lastScrollPoint, scrollPoint) > 5 || scrollCounter > 10) {
                scrollOrigin = viewer.getInteractionOrigin(event);
                
                if (scrollOrigin == null) {
                    var region = viewer.getMergedRegion();
                    var centre = vec3.fromValues(region.centre[0], region.centre[1], region.centre[2]);
                    var eye = viewer.getCameraPosition();
                    var distance = vec3.distance(centre,  eye);
                    var trans = mat4.invert(mat4.create(), viewer.mvMatrix);
                    var rotation = mat4.getRotation(quat.create(), trans);
                    var dir = vec3.normalize(vec3.create(), vec3.transformQuat(vec3.create(), [0,0,-1], rotation));
                    var move = vec3.scale(vec3.create(), dir, distance);
                    scrollOrigin = vec3.add(vec3.create(), move, eye);
                }

                lastScrollPoint = scrollPoint;
                scrollCounter = 0;
            } 
            

            var sign = (x: any) => {
                x = +x; // convert to a number
                if (x === 0 || isNaN(x)) {
                    return x;
                }
                return x > 0 ? 1 : -1;
            };

            //deltaX and deltaY have very different values in different web browsers so fixed value is used for constant functionality.
            viewer.navigate('zoom', sign(event.deltaX) * -1.0, sign(event.deltaY) * -1.0, scrollOrigin);
        };

        // handle mouse movements when using PointerLock mode.
        var handlePointerLockChange = (event: Event) => {
            const lockElement = document.pointerLockElement as HTMLElement;
            if (lockElement === viewer.canvas) {
                if (!isPointerLocked) {
                    isPointerLocked = true;
                    viewer.canvas.addEventListener('mousemove', handleLookAround, false);
                }
            } else {
                isPointerLocked = false;
                viewer.canvas.removeEventListener("mousemove", handleLookAround, false);
            }
        };

        // handle pointer lock for walk mode to grab the mouse movement data
        let requestPointerLock = viewer.canvas.requestPointerLock as () => void;
        if (requestPointerLock != null) {
            requestPointerLock = requestPointerLock.bind(viewer.canvas) as () => void;
            viewer.canvas.onclick = () => {
                if (viewer.navigationMode === 'walk' && !isPointerLocked) {
                    requestPointerLock();
                }
            };
        }

        document.addEventListener('pointerlockchange', handlePointerLockChange, false);

        var timer = 0;
        //attach callbacks
        viewer.canvas.addEventListener('mousedown', (event) => handleMouseDown(event), true);
        viewer.canvas.addEventListener('wheel', (event) => handleMouseScroll(event), true);
        window.addEventListener('mouseup', (event) => handleMouseUp(event), true);
        window.addEventListener('mousemove', (event) => handleMouseMove(event), true);
    }
}