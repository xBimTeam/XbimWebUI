/**
 * Selects the render pass used for IFCSPACE and IFCOPENINGELEMENT geometry.
 */
export enum SpaceRenderingMode {
    /** Uses the transparent pass, which does not write to the depth buffer. */
    TRANSPARENT = 0,

    /** Uses the solid depth-writing pass. Material alpha is unchanged. */
    SOLID = 1
}
