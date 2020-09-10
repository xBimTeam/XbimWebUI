import { vec3 } from "gl-matrix";

// tslint:disable-next-line: interface-name
export interface ViewerInteractionEventMap {
    "click": ViewerInteractionEvent;
    "contextmenu": ViewerInteractionEvent;
    "dblclick": ViewerInteractionEvent;
    "drag": ViewerInteractionEvent;
    "dragend": ViewerInteractionEvent;
    "dragenter": ViewerInteractionEvent;
    "dragleave": ViewerInteractionEvent;
    "dragover": ViewerInteractionEvent;
    "dragstart": ViewerInteractionEvent;
    "drop": ViewerInteractionEvent;
    "mousedown": ViewerInteractionEvent;
    "mouseenter": ViewerInteractionEvent;
    "mouseleave": ViewerInteractionEvent;
    "mousemove": ViewerInteractionEvent;
    "mouseout": ViewerInteractionEvent;
    "mouseover": ViewerInteractionEvent;
    "mouseup": ViewerInteractionEvent;
    "mousewheel": ViewerInteractionEvent;
    "gotpointercapture": ViewerInteractionEvent;
    "lostpointercapture": ViewerInteractionEvent;
    "touchcancel": ViewerInteractionEvent;
    "touchend": ViewerInteractionEvent;
    "touchmove": ViewerInteractionEvent;
    "touchstart": ViewerInteractionEvent;
    "pointercancel": ViewerInteractionEvent;
    "pointerdown": ViewerInteractionEvent;
    "pointerenter": ViewerInteractionEvent;
    "pointerleave": ViewerInteractionEvent;
    "pointermove": ViewerInteractionEvent;
    "pointerout": ViewerInteractionEvent;
    "pointerover": ViewerInteractionEvent;
    "pointerup": ViewerInteractionEvent;
    "wheel": ViewerInteractionEvent;
    "pick": ViewerInteractionEvent;
}

// tslint:disable-next-line: interface-name
export interface ViewerEventMap extends ViewerInteractionEventMap {
    "pointerlockchange": ViewerPointerLockChangedEvent;
    "pointerlockerror": ViewerPointerLockChangedEvent;
    "fps": number;
    "loaded": ViewerLoadedEvent;
    "unloaded": ViewerLoadedEvent;
    "error": { message: string };
    "navigationEnd": boolean;
}

// tslint:disable-next-line: interface-name
export interface ViewerLoadedEvent {
    /**
     * Model ID to be used for interaction with the viewer
     */
    model: number;

    /**
     * Tag used to match loaded models with user instructions
     */
    tag: any;
}

/**
 * Interaction events forward original canvas events
 * and retrieves product and model ID
 */
// tslint:disable-next-line: interface-name
export interface ViewerInteractionEvent {

    /**
     * The original canvas event
     */
    event: MouseEvent | TouchEvent | PointerEvent | DragEvent;

    /**
     * Product ID, might be null if there is no product selected
     */
    id: number;

    /**
     * Model ID, might be null if no product is selected
     */
    model: number;

    /**
     * Location in real 3D space of the model (excluding WCS)
     */
    xyz: vec3;
}

// tslint:disable-next-line: interface-name
export interface ViewerPointerLockChangedEvent {

    /**
     * Element owning the pointer
     */
    target: Element;
}
