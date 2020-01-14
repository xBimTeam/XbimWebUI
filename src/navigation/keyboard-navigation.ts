import { Viewer } from "../viewer";

export class KeyboardNavigation {
    public static initKeyboardEvents(viewer: Viewer) {
        var isShiftKeyDown = false;

        var id = -1;
        var modelId = -1;

        //listen to key events to support WASD and cursor nav
        document.addEventListener('keydown', (event: KeyboardEvent) => {

            if (viewer.navigationMode === "walk") {
                //console.log(event);
                let multiplier = (event.shiftKey === true) ? 3 : 1;

                switch (event.code) {
                    case 'KeyW':
                        viewer.navigate('walk', 0, 2 * multiplier);
                        break;

                    case 'KeyS':
                        viewer.navigate('walk', 0, -2 * multiplier);
                        break;

                    case 'KeyA':
                        viewer.navigate('pan', 1 * multiplier, 0);
                        break;

                    case 'KeyD':
                        viewer.navigate('pan', -1 * multiplier, 0);
                        break;

                    case 'KeyR':
                    case 'ArrowUp':
                        viewer.navigate('pan', 0, 1 * multiplier);
                        break;

                    case 'KeyF':
                    case 'ArrowDown':
                        viewer.navigate('pan', 0, -1 * multiplier);
                        break;

                    case 'KeyQ':
                    case 'ArrowLeft':
                        viewer.navigate('look-around', 2, 0);
                        break;

                    case 'KeyE':
                    case 'ArrowRight':
                        viewer.navigate('look-around', -2, 0);
                        break;

                }
            }
        }, false);

    }
}
