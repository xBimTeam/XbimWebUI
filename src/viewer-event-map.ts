export interface ViewerEventMap {
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

    "fps": number;
    "loaded": ViewerLoadedEvent;
    "error": { message: string };
}

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
}