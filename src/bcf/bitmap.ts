export class Bitmap {

    /**
     * format of the bitmap. Predefined values png or jpg
     */
    public bitmap_type: "jpg" | "png";

    /**
     * base64 encoded string 	The bitmap image data
     */
    public bitmap_data: string;

    /**
     * location of the center of the bitmap in world coordinates (point)
     */
    public location: number[];

    /**
     * normal vector of the bitmap (vector)
     */
    public normal: number[];

    /**
     * up vector of the bitmap (vector)
     */
    public up: number[];

    /**
     * height of bitmap in the scene
     */
    public height: number;
}
