import { Viewer } from "../viewer";
import { vec3 } from "gl-matrix";

export class KeyboardNavigation {
    public static initKeyboardEvents(viewer: Viewer) {

        //listen to key events to support WASD and cursor nav
        document.addEventListener('keydown', (event: KeyboardEvent) => {

            if (viewer.navigationMode !== "walk") {
                return;
            }

            const getPanOrigin = (): vec3 => {
                // data from the middle point of the viewer
                const dir = viewer.getCameraDirection();
                const eye = viewer.getCameraPosition();
                const dist = viewer.unitsInMeter * 10;
                return vec3.add(vec3.create(), eye, vec3.scale(vec3.create(), dir, dist));
            }

            //console.log(event);
            let multiplier = (event.shiftKey === true) ? 3 : 1;

            switch (event.code) {
                case 'KeyW':
                    // origin is not used
                    viewer.navigate('walk', 0, 2 * multiplier, vec3.create());
                    break;

                case 'KeyS':
                    // origin is not used
                    viewer.navigate('walk', 0, -2 * multiplier, vec3.create());
                    break;

                case 'KeyA':
                    viewer.navigate('pan', 4 * multiplier, 0, getPanOrigin());
                    break;

                case 'KeyD':
                    viewer.navigate('pan', -4 * multiplier, 0, getPanOrigin());
                    break;

                case 'KeyR':
                case 'ArrowUp':
                    viewer.navigate('pan', 0, 4 * multiplier, getPanOrigin());
                    break;

                case 'KeyF':
                case 'ArrowDown':
                    viewer.navigate('pan', 0, -4 * multiplier, getPanOrigin());
                    break;

                case 'KeyQ':
                case 'ArrowLeft':
                    viewer.navigate('look-around', 2, 0, viewer.getCameraPosition());
                    break;

                case 'KeyE':
                case 'ArrowRight':
                    viewer.navigate('look-around', -2, 0, viewer.getCameraPosition());
                    break;

            }
        }, false);

    }
}
