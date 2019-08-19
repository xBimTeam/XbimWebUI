export class Snapshot {
    /**
     * Format of the snapshot
     */
    public snapshot_type: "png" | "jpg";

    /**
     * Base64 encoded snapshot image data
     */
    public snapshot_data: string;
}