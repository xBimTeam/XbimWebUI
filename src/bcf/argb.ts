/**
 * Conversions between RGBA (0-255) and BCF colour strings (RRGGBB or AARRGGBB)
 * @category BCF
 */
export class Argb {
    /**
     * Converts RGBA (0-255) into BCF colour string in ARGB format (AARRGGBB)
     */
    public static fromRgba(rgba: number[]): string {
        const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
        return hex(rgba[3]) + hex(rgba[0]) + hex(rgba[1]) + hex(rgba[2]);
    }

    /**
     * Converts BCF colour string (RRGGBB or AARRGGBB) into RGBA (0-255). Returns null for invalid input.
     */
    public static toRgba(argb: string): number[] {
        if (argb == null) {
            return null;
        }
        const value = argb.trim().replace(/^#/, '');
        if (!/^([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
            return null;
        }
        const alpha = value.length === 8 ? parseInt(value.substr(0, 2), 16) : 255;
        const rgb = value.substr(value.length - 6);
        return [
            parseInt(rgb.substr(0, 2), 16),
            parseInt(rgb.substr(2, 2), 16),
            parseInt(rgb.substr(4, 2), 16),
            alpha
        ];
    }
}
