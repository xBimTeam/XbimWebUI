import { Viewer } from "../viewer";
import { vec3, mat4 } from "gl-matrix";

export class PreflightCheck {
    public static findView(viewer: Viewer, elements: { id: number, model: number }[], density: number): { mv: mat4, height: number } {
        if (elements == null || elements.length === 0)
            return null;

        // merged bounding box
        const bBox = viewer.getTargetsBoundingBox(elements);
        const directions = [
            // 8 base horizontal view directions
            { dir: [1, 0, 0], up: [0, 0, 1] },
            { dir: [0, 1, 0], up: [0, 0, 1] },
            { dir: [-1, 0, 0], up: [0, 0, 1] },
            { dir: [0, -1, 0], up: [0, 0, 1] },
            { dir: [1, 1, 0], up: [0, 0, 1] },
            { dir: [-1, -1, 0], up: [0, 0, 1] },
            { dir: [-1, 1, 0], up: [0, 0, 1] },
            { dir: [1, -1, 0], up: [0, 0, 1] },
            // top view
            // { dir: [0, 0, -1], up: [0, 1, 0] }
        ]
            .map(d => ({ dir: vec3.normalize(vec3.create(), d.dir), up: vec3.normalize(vec3.create(), d.up) }));

        // only add top view for elements which have significant horizontal dimensions (roof, slab)
        const boxHorizontalArea = bBox[3] * bBox[4];
        const boxVerticalAreaX = bBox[3] * bBox[5];
        const boxVerticalAreaY = bBox[4] * bBox[5];
        if (boxHorizontalArea > boxVerticalAreaX && boxHorizontalArea > boxVerticalAreaY) {
            directions.push({
                dir: vec3.fromValues(0, 0, -1),
                up: vec3.fromValues(0, 1, 0)
            });
            directions.push({
                dir: vec3.fromValues(0, 0, -1),
                up: vec3.fromValues(1, 0, 0)
            });
        }

        const dW = viewer.width / density;
        const dH = viewer.height / density;
        const checkPoints: { x: number, y: number }[] = [];
        for (let i = 1; i < density; i++) {
            for (let j = 1; j < 10; j++) {
                checkPoints.push({ x: i * dW, y: j * dH });
            }
        }

        const lookUp: { [id: string]: boolean } = elements.reduce((l, e) => { l[`${e.model}.${e.id}`] = true; return l; }, {});

        // stop to prevent interference with offscreen rendering
        const isRunning = viewer.isRunning;
        viewer.stop();
        const originalMv = viewer.mvMatrix;
        const originalHeight = viewer.cameraProperties.height;
        try {
            const center = vec3.fromValues(bBox[0] + bBox[3] / 2.0, bBox[1] + bBox[4] / 2.0, bBox[2] + bBox[5] / 2.0);

            // get optimal distances and heights
            const optimal = directions.map(d => viewer.getDistanceAndHeight(bBox, d.dir, d.up));

            const mvs = optimal.map((o, idx) => {
                const inv = vec3.negate(vec3.create(), directions[idx].dir);
                const trans = vec3.scale(vec3.create(), inv, o.distance);
                const eye = vec3.add(vec3.create(), trans, center);
                return mat4.lookAt(mat4.create(), eye, center, directions[idx].up);
            });

            // get matrix of identities
            const data = mvs.map((mv, idx) => {
                // set the offscreen view
                viewer.mvMatrix = mv;
                viewer.cameraProperties.height = optimal[idx].height;
                // get data, keep string usable for lookup
                return viewer.getData(checkPoints).map(e => e != null ? `${e.model}.${e.id}` : null);
            });

            // how many times we have seen target elements
            const ratingTypes = data.map(ids => ids.reduce((c, id) => {
                if (id == null)
                    return c;
                if (lookUp[id] === true) {
                    c.count++;
                    if (c.types[id] == null)
                        c.types[id] = 1;
                    else
                        c.types[id] = c.types[id] + 1;
                }
                return c
            }, { count: 0, types: {} }));
            // multiply number of objects hit by number of hits. It is better to see more objects in the view than one large
            const ratings = ratingTypes.map(c => c.count * Math.pow(Object.getOwnPropertyNames(c.types).length, 2));

            let maxIdx = 0;
            let maxRating = 0;
            ratings.forEach((r, idx) => { if (r > maxRating) { maxRating = r; maxIdx = idx; } });

            return maxRating > 0 ? { mv: mvs[maxIdx], height: optimal[maxIdx].height } : null;
        }
        finally {
            viewer.mvMatrix = originalMv;
            viewer.cameraProperties.height = originalHeight;
            if (isRunning) viewer.start();
        }


    }
}