import { Viewer } from "../viewer";
import { vec3 } from "gl-matrix";

export class KeyboardNavigation {
    public static initKeyboardEvents(viewer: Viewer) {
        var isShiftKeyDown = false;

        var id = -1;
        var modelId = -1;

        //listen to key events to support WASD and cursor nav
        document.addEventListener('keydown', (event: KeyboardEvent) => {

            let origin = vec3.create();
            // data from the middle point of the viewer
            const data = viewer.getEventData(viewer.width / 2.0, viewer.height / 2.0);
            if (data == null || data.id == null || data.model == null) {
                const region = viewer.getMergedRegion();
                origin = vec3.fromValues(region.centre[0], region.centre[1], region.centre[2]);
            } else if (data.xyz == null) {
                const bb = viewer.getTargetBoundingBox(data.id, data.model);
                origin = vec3.fromValues(bb[0] + bb[3] / 2.0, bb[1] + bb[4] / 2.0, bb[2] + bb[5] / 2.0);
            } else {
                origin = data.xyz
            }

            if (viewer.navigationMode === "walk") {
                //console.log(event);
                let multiplier = (event.shiftKey === true) ? 3 : 1;

                switch (event.code) {
                    case 'KeyW':
                        viewer.navigate('walk', 0, 2 * multiplier, origin);
                        break;

                    case 'KeyS':
                        viewer.navigate('walk', 0, -2 * multiplier, origin);
                        break;

                    case 'KeyA':
                        viewer.navigate('pan', 1 * multiplier, 0, origin);
                        break;

                    case 'KeyD':
                        viewer.navigate('pan', -1 * multiplier, 0, origin);
                        break;

                    case 'KeyR':
                    case 'ArrowUp':
                        viewer.navigate('pan', 0, 1 * multiplier, origin);
                        break;

                    case 'KeyF':
                    case 'ArrowDown':
                        viewer.navigate('pan', 0, -1 * multiplier, origin);
                        break;

                    case 'KeyQ':
                    case 'ArrowLeft':
                        viewer.navigate('look-around', 2, 0, origin);
                        break;

                    case 'KeyE':
                    case 'ArrowRight':
                        viewer.navigate('look-around', -2, 0, origin);
                        break;

                }
            }
        }, false);

    }
}
