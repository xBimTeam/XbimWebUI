/**
 * Computes screen-space offsets distributing `count` items evenly on a circle, starting at 12 o'clock.
 * The radius grows when needed so neighbouring items of `itemSize` pixels don't overlap.
 */
export function computeRadialOffsets(count: number, radius: number, itemSize: number = 0): { dx: number, dy: number }[] {
    if (count <= 0) return [];
    const minRadius = count > 1 ? (count * (itemSize + 16)) / (2 * Math.PI) : 0;
    const r = Math.max(radius, minRadius);
    const offsets: { dx: number, dy: number }[] = [];
    for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
        offsets.push({ dx: Math.cos(angle) * r, dy: Math.sin(angle) * r });
    }
    return offsets;
}
