export type KeyActionOrigin = 'none' | 'pan' | 'camera';

export interface KeyAction {
    type: 'walk' | 'pan' | 'look-around';
    deltaX: number;
    deltaY: number;
    /** which origin the viewer should supply to the navigation */
    origin: KeyActionOrigin;
}

interface KeyBinding extends KeyAction {
    codes: string[];
    /** whether the run (shift) multiplier applies */
    runnable: boolean;
}

const bindings: KeyBinding[] = [
    { codes: ['KeyW'], type: 'walk', deltaX: 0, deltaY: 2, origin: 'none', runnable: true },
    { codes: ['KeyS'], type: 'walk', deltaX: 0, deltaY: -2, origin: 'none', runnable: true },
    { codes: ['KeyA'], type: 'pan', deltaX: 4, deltaY: 0, origin: 'pan', runnable: true },
    { codes: ['KeyD'], type: 'pan', deltaX: -4, deltaY: 0, origin: 'pan', runnable: true },
    { codes: ['KeyR', 'ArrowUp'], type: 'pan', deltaX: 0, deltaY: 4, origin: 'pan', runnable: true },
    { codes: ['KeyF', 'ArrowDown'], type: 'pan', deltaX: 0, deltaY: -4, origin: 'pan', runnable: true },
    { codes: ['KeyQ', 'ArrowLeft'], type: 'look-around', deltaX: 2, deltaY: 0, origin: 'camera', runnable: false },
    { codes: ['KeyE', 'ArrowRight'], type: 'look-around', deltaX: -2, deltaY: 0, origin: 'camera', runnable: false },
];

const runCodes = ['ShiftLeft', 'ShiftRight'];
const movementCodes = new Set(bindings.reduce((all, b) => all.concat(b.codes), [] as string[]));

/** Run (faster walking) multiplier applied while shift is held */
export const runMultiplier = 3;

export function isMovementKey(code: string): boolean {
    return movementCodes.has(code);
}

export function isRunKey(code: string): boolean {
    return runCodes.indexOf(code) >= 0;
}

/**
 * Gets navigation actions for all the keys which are currently held down. Every movement key held
 * contributes independently, and the run key only modifies the speed, so key combinations
 * don't depend on the order the keys were pressed in.
 *
 * @param pressed codes (KeyboardEvent.code) of the keys currently held down
 * @param scale scale of a step, e.g. elapsed time relative to a reference frame
 */
export function getKeyActions(pressed: ReadonlySet<string>, scale: number = 1): KeyAction[] {
    const running = runCodes.some(c => pressed.has(c));
    return bindings
        .filter(b => b.codes.some(c => pressed.has(c)))
        .map(b => {
            const factor = scale * (running && b.runnable ? runMultiplier : 1);
            return { type: b.type, deltaX: b.deltaX * factor, deltaY: b.deltaY * factor, origin: b.origin };
        });
}
