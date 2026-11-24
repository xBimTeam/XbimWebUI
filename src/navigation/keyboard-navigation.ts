import { Viewer } from "../viewer";
import { vec3 } from "gl-matrix";
import { getKeyActions, isMovementKey, isRunKey, KeyAction } from "./keyboard-actions";

export class KeyboardNavigation {
    public static initKeyboardEvents(viewer: Viewer) {

        // Keys are tracked by state rather than by keydown auto-repeat. Auto-repeat only repeats the most
        // recently pressed key, so pressing another key (e.g. Shift to run) while walking would stop the walk.
        const pressed = new Set<string>();
        const referenceFrame = 1000 / 60;
        let frameHandle: number = null;
        let lastTime: number = null;

        const anyMovement = () => Array.from(pressed).some(isMovementKey);

        const getPanOrigin = (): vec3 => {
            // data from the middle point of the viewer
            const dir = viewer.getCameraDirection();
            const eye = viewer.getCameraPosition();
            const dist = viewer.unitsInMeter * 10;
            return vec3.add(vec3.create(), eye, vec3.scale(vec3.create(), dir, dist));
        };

        const apply = (action: KeyAction) => {
            switch (action.origin) {
                case 'pan':
                    viewer.navigate(action.type, action.deltaX, action.deltaY, getPanOrigin());
                    break;
                case 'camera':
                    viewer.navigate(action.type, action.deltaX, action.deltaY, viewer.getCameraPosition());
                    break;
                default:
                    // origin is not used
                    viewer.navigate(action.type, action.deltaX, action.deltaY, vec3.create());
                    break;
            }
        };

        const stop = () => {
            if (frameHandle != null) {
                cancelAnimationFrame(frameHandle);
                frameHandle = null;
            }
            lastTime = null;
        };

        const release = () => {
            pressed.clear();
            stop();
        };

        const step = (time: number) => {
            frameHandle = null;
            if (viewer.navigationMode !== 'walk') {
                release();
                return;
            }

            // keep the pace independent of the frame rate, but don't jump after a stall
            const elapsed = lastTime == null ? referenceFrame : time - lastTime;
            lastTime = time;
            const scale = Math.min(Math.max(elapsed / referenceFrame, 0), 3);

            getKeyActions(pressed, scale).forEach(apply);

            if (anyMovement()) {
                frameHandle = requestAnimationFrame(step);
            } else {
                lastTime = null;
            }
        };

        const isTyping = (event: KeyboardEvent): boolean => {
            const target = event.target as HTMLElement;
            return target != null && (target.isContentEditable === true
                || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
        };

        //listen to key events to support WASD and cursor nav
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (viewer.navigationMode !== 'walk' || isTyping(event)) {
                return;
            }

            if (isRunKey(event.code) || isMovementKey(event.code)) {
                pressed.add(event.code);
            }

            // recover when the shift release was missed (e.g. while the window didn't have focus)
            if (!event.shiftKey) {
                pressed.delete('ShiftLeft');
                pressed.delete('ShiftRight');
            }

            if (frameHandle == null && anyMovement()) {
                frameHandle = requestAnimationFrame(step);
            }
        }, false);

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            pressed.delete(event.code);
            if (!anyMovement()) {
                stop();
            }
        }, false);

        // key releases are not reported when the window loses focus
        window.addEventListener('blur', release, false);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                release();
            }
        }, false);
    }
}
