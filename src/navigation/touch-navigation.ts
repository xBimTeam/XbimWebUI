import { Viewer } from "../viewer";
import { ProductIdentity } from "../common/product-identity";
import { vec3 } from "gl-matrix";

export class TouchNavigation {
    public static initTouchNavigationEvents(viewer: Viewer) {

        let lastTouchX_1: number;
        let lastTouchY_1: number;
        let lastTouchX_2: number;
        let lastTouchY_2: number;
        let lastTouchX_3: number;
        let lastTouchY_3: number;

        let origin = vec3.create();

        const handleTouchStart = (event: TouchEvent) => {
            event.preventDefault();

            if (event.touches.length >= 1) {
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
            }
            if (event.touches.length >= 2) {
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
            }
            if (event.touches.length >= 3) {
                lastTouchX_3 = event.touches[2].clientX;
                lastTouchY_3 = event.touches[2].clientY;
            }

            const data = viewer.getEventDataFromEvent(event.touches[0]);
            if (data == null || data.id == null || data.model == null) {
                const region = viewer.getMergedRegion();
                origin = vec3.fromValues(region.centre[0], region.centre[1], region.centre[2]);
            } else if (data.xyz == null) {
                const bb = viewer.getTargetBoundingBox(data.id, data.model);
                origin = vec3.fromValues(bb[0] + bb[3] /2.0, bb[1] + bb[4] /2.0, bb[2] + bb[5] /2.0);
            } else {
                origin = data.xyz
            }
        };

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault();
            if (viewer.navigationMode === 'none' || !event.touches) {
                return;
            }
            if (event.touches.length === 1) {
                // touch move with single finger -> orbit
                var deltaX = event.touches[0].clientX - lastTouchX_1;
                var deltaY = event.touches[0].clientY - lastTouchY_1;
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                // force-setting navigation mode to 'free-orbit' currently for touch navigation since regular orbit
                // feels awkward and un-intuitive on touch devices
                // MC: I prefer fixed orbit as it doesn't allow for wierd angles
                viewer.navigate('orbit', deltaX, deltaY, origin);
            } else if (event.touches.length === 2) {
                // touch move with two fingers -> zoom
                var distanceBefore = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
                var distanceAfter = Math.sqrt((lastTouchX_1 - lastTouchX_2) * (lastTouchX_1 - lastTouchX_2) +
                    (lastTouchY_1 - lastTouchY_2) * (lastTouchY_1 - lastTouchY_2));
                if (distanceBefore > distanceAfter) {
                    viewer.navigate('zoom', -1, -1, origin); // Zooming out, fingers are getting closer together

                } else {
                    viewer.navigate('zoom', 1, 1, origin); // zooming in, fingers are getting further apart
                }
            } else if (event.touches.length === 3) {
                // touch move with three fingers -> pan
                var directionX = ((event.touches[0]
                    .clientX +
                    event.touches[1].clientX +
                    event.touches[2].clientX) /
                    3) -
                    ((lastTouchX_1 + lastTouchX_2 + lastTouchX_3) / 3);
                var directionY = ((event.touches[0]
                    .clientY +
                    event.touches[1].clientY +
                    event.touches[2].clientY) /
                    3) -
                    ((lastTouchY_1 + lastTouchY_2 + lastTouchY_3) / 3);
                lastTouchX_1 = event.touches[0].clientX;
                lastTouchY_1 = event.touches[0].clientY;
                lastTouchX_2 = event.touches[1].clientX;
                lastTouchY_2 = event.touches[1].clientY;
                lastTouchY_3 = event.touches[2].clientX;
                lastTouchY_3 = event.touches[2].clientY;
                // pan seems to be too fast, just adding a factor here
                var panFactor = 0.2;

                viewer.navigate('pan', panFactor * directionX, panFactor * directionY, origin);
            }
        }

        viewer.canvas.addEventListener('touchstart', (event) => handleTouchStart(event), true);
        viewer.canvas.addEventListener('touchmove', (event) => handleTouchMove(event), true);
    }

    public static initTouchTapEvents(viewer: Viewer) {
        var touchDown = false;
        var lastTouchX: number;
        var lastTouchY: number;
        var maximumLengthBetweenDoubleTaps = 200;
        var lastTap = new Date();

        let data: { id: number, model: number, xyz: vec3 } = { id: null, model: null, xyz: null };

        //set initial conditions so that different gestures can be identified
        var handleTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) {
                return;
            }


            touchDown = true;
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
            //get coordinates within canvas (with the right orientation)
            var r = viewer.canvas.getBoundingClientRect();
            var viewX = lastTouchX - r.left;
            var viewY = viewer.height - (lastTouchY - r.top);

            //viewer is for picking
            data = viewer.getEventData(viewX, viewY);

            var now = new Date();
            var isDoubleTap = (now.getTime() - lastTap.getTime()) < maximumLengthBetweenDoubleTaps;
            if (isDoubleTap) {
                viewer.fire('dblclick', { id: data.id, model: data.model, event: event, xyz: data.xyz });
            };
            lastTap = now;

            /**
            * Occurs when mousedown event happens on underlying canvas.
            *
            * @event Viewer#mouseDown
            * @type {object}
            * @param {Number} id - product ID of the element or null if there wasn't any product under mouse
            * @param {Number} model - model ID
            * @param {MouseEvent} event - original HTML event
            */
            viewer.fire('mousedown', { id: data.id, model: data.model, event: event, xyz: data.xyz });

            viewer.disableTextSelection();
        };

        var handleTouchEnd = (event: TouchEvent) => {
            if (!touchDown) {
                return;
            }
            touchDown = false;

            var endX = event.changedTouches[0].clientX;
            var endY = event.changedTouches[0].clientY;

            var deltaX = Math.abs(endX - lastTouchX);
            var deltaY = Math.abs(endY - lastTouchY);

            //if it was a longer movement do not perform picking
            if (deltaX < 3 && deltaY < 3) {

                viewer.fire('pick', { id: data.id, model: data.model, event: event, xyz: data.xyz });
            }

            viewer.enableTextSelection();
        };


        viewer.canvas.addEventListener('touchstart', (event) => handleTouchStart(event), true);
        viewer.canvas.addEventListener('touchend', (event) => handleTouchEnd(event), true);
    }
}
