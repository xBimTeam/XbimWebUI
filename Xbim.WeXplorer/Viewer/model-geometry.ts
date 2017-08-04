 import { BinaryReader } from "./binary-reader";
import { ProductType } from "./product-type";
import { State } from "./state";
import { TriangulatedShape } from "./triangulated-shape";

export class ModelGeometry {
    //all this data is to be fed into GPU as attributes
    normals: Uint8Array;
    indices: Float32Array;
    products: Float32Array;
    transformations: Float32Array;
    styleIndices: Uint16Array;
    states: Uint8Array;
    //this is the only array we need to keep alive on client side to be able to change appearance of the model

    //these will be sent to GPU as the textures
    vertices: Float32Array;
    matrices: Float32Array;
    styles: Uint8Array;

    meter = 1000;

    //this will be used to change appearance of the objects
    //map objects have a format:
    //map = {
    //	productID: int,
    //	type: int,
    //	bBox: Float32Array(6),
    //	spans: [Int32Array([int, int]),Int32Array([int, int]), ...] //spanning indexes defining shapes of product and it's state
    //};

    private _iVertex = 0;
    private _iIndexForward = 0;
    private _iIndexBackward = 0;
    private _iTransform = 0;
    private _iMatrix = 0;

    public productMaps: { [id: number]: ProductMap } = {};
    public regions: Region[];
    public transparentIndex: number;

    private _reader: BinaryReader;
    private _styleMap = new StyleMap();

    private parse(binReader: BinaryReader) {
        this._reader = binReader;

        const br = binReader;
        const magicNumber = br.readInt32();
        if (magicNumber != 94132117) throw new Error("Magic number mismatch.");
        const version = br.readByte();
        const numShapes = br.readInt32();
        const numVertices = br.readInt32();
        const numTriangles = br.readInt32();
        const numMatrices = br.readInt32();
        const numProducts = br.readInt32();
        const numStyles = br.readInt32();
        this.meter = br.readFloat32();
        const numRegions = br.readInt16();

        //create target buffers of correct sizes (avoid reallocation of memory, work with native typed arrays)
        this.vertices = new Float32Array(this.square(4, numVertices * 3));
        this.normals = new Uint8Array(numTriangles * 6);
        this.indices = new Float32Array(numTriangles * 3);
        this.styleIndices = new Uint16Array(numTriangles * 3);
        this.styles = new Uint8Array(this.square(1, (numStyles + 1) * 4)); //+1 is for a default style
        this.products = new Float32Array(numTriangles * 3);
        this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
        this.transformations = new Float32Array(numTriangles * 3);
        this.matrices = new Float32Array(this.square(4, numMatrices * 16));
        this.productMaps = {};
        this.regions = new Array<Region>(numRegions);

        //initial values for indices for iterations over data
        this._iVertex = 0;
        this._iIndexForward = 0;
        this._iIndexBackward = numTriangles * 3;
        this._iTransform = 0;
        this._iMatrix = 0;

        for (let i = 0; i < numRegions; i++) {
            const region = new Region();
            region.population = br.readInt32();
            region.centre = br.readFloat32Array(3);
            region.bbox = br.readFloat32Array(6);
            this.regions[i] = region;
        }

        let iStyle = 0;
        for (iStyle; iStyle < numStyles; iStyle++) {
            const styleId = br.readInt32();
            const R = br.readFloat32() * 255;
            const G = br.readFloat32() * 255;
            const B = br.readFloat32() * 255;
            const A = br.readFloat32() * 255;
            this.styles.set([R, G, B, A], iStyle * 4);
            this._styleMap.Add({ id: styleId, index: iStyle, transparent: A < 254 });
        }
        this.styles.set([255, 255, 255, 255], iStyle * 4);
        const defaultStyle: StyleRecord = { id: -1, index: iStyle, transparent: false };
        this._styleMap.Add(defaultStyle);

        for (let i = 0; i < numProducts; i++) {
            const productLabel = br.readInt32();
            const prodType = br.readInt16();
            const bBox = br.readFloat32Array(6);

            const map: ProductMap = {
                productID: productLabel,
                type: prodType,
                bBox,
                spans: [],
            };
            this.productMaps[productLabel] = map;
        }

        //version 3 puts geometry in regions properly so it is possible to use this information for rendering
        if (version >= 3) {
            for (let r = 0; r < numRegions; r++) {
                const region = this.regions[r];
                const geomCount = br.readInt32();

                for (let g = 0; g < geomCount; g++) {

                    //read shape information
                    const shapes = this.readShape(version);

                    //read geometry
                    const geomLength = br.readInt32();

                    //read geometry data (make sure we don't overflow - use isolated subreader)
                    const gbr = br.getSubReader(geomLength);
                    const geometry = new TriangulatedShape();
                    geometry.parse(gbr);
                    //make sure that geometry is complete
                    if (!gbr.isEOF())
                        throw new Error(`Incomplete reading of geometry for shape instance ${shapes[0].iLabel}`);

                    //add data to arrays prepared for GPU
                    this.feedDataArrays(shapes, geometry);
                }
            }
        } else {
            //older versions use less safety and just iterate over in a single loop
            for (let iShape = 0; iShape < numShapes; iShape++) {

                //reed shape representations
                const shapes = this.readShape(version);

                //read shape geometry
                const geometry = new TriangulatedShape();
                geometry.parse(br);

                //feed data arays
                this.feedDataArrays(shapes, geometry);
            }
        }

        //binary reader should be at the end by now
        if (!br.isEOF()) {
            throw new Error("Binary reader is not at the end of the file.");
        }

        //set value of transparent index divider for two phase rendering (simplified ordering)
        this.transparentIndex = this._iIndexForward;
    }

    /**
     * Get size of arrays to be square (usable for texture data)
     * @param arity
     * @param count
     */
    private square(arity: number, count: number): number {
        if (typeof (arity) == "undefined" || typeof (count) == "undefined") {
            throw new Error('Wrong arguments for "square" function.');
        }
        if (count == 0) return 0;
        const byteLength = count * arity;
        let imgSide = Math.ceil(Math.sqrt(byteLength / 4));
        //clamp to parity
        while ((imgSide * 4) % arity != 0) {
            imgSide++;
        }
        const result = imgSide * imgSide * 4 / arity;
        return result;
    }

    private feedDataArrays(shapes: ShapeRecord[], geometry: TriangulatedShape) {
        //copy shape data into inner array and set to null so it can be garbage collected
        shapes.forEach((shape) => {
            let iIndex = 0;
            //set iIndex according to transparency either from beginning or at the end
            if (shape.transparent) {
                iIndex = this._iIndexBackward - geometry.indices.length;
            } else {
                iIndex = this._iIndexForward;
            }

            const begin = iIndex;
            let map = this.productMaps[shape.pLabel];
            if (typeof (map) === "undefined") {
                //throw "Product hasn't been defined before.";
                map = {
                    productID: 0,
                    type: ProductType.IFCOPENINGELEMENT,
                    bBox: new Float32Array(6),
                    spans: [],
                };
                this.productMaps[shape.pLabel] = map;
            }

            this.normals.set(geometry.normals, iIndex * 2);

            //switch spaces and openings off by default
            const state = map.type == ProductType.IFCSPACE || map.type == ProductType.IFCOPENINGELEMENT
                ? State.HIDDEN
                : 0xFF; //0xFF is for the default state

            //fix indices to right absolute position. It is relative to the shape.
            for (let i = 0; i < geometry.indices.length; i++) {
                this.indices[iIndex] = geometry.indices[i] + this._iVertex / 3;
                this.products[iIndex] = shape.pLabel;
                this.styleIndices[iIndex] = shape.style;
                this.transformations[iIndex] = shape.transform; //shape.pLabel == 33698 || shape.pLabel == 33815 ? -1 : shape.transform;
                this.states[2 * iIndex] = state; //set state
                this.states[2 * iIndex + 1] = 0xFF; //default style

                iIndex++;
            }

            const end = iIndex;
            map.spans.push(new Int32Array([begin, end]));

            if (shape.transparent) this._iIndexBackward -= geometry.indices.length;
            else this._iIndexForward += geometry.indices.length;
        },
            this);

        //copy geometry and keep track of amount so that we can fix indices to right position
        //this must be the last step to have correct iVertex number above
        this.vertices.set(geometry.vertices, this._iVertex);
        this._iVertex += geometry.vertices.length;
    }

    private readShape(version: number): ShapeRecord[] {
        const br = this._reader;

        const repetition = br.readInt32();
        const shapeList = new Array<ShapeRecord>();
        for (let iProduct = 0; iProduct < repetition; iProduct++) {
            const prodLabel = br.readInt32();
            const instanceTypeId = br.readInt16();
            const instanceLabel = br.readInt32();
            const styleId = br.readInt32();
            let transformation: Float32Array | Float64Array = null;

            if (repetition > 1) {
                //version 1 had lower precission of transformation matrices
                transformation = version === 1 ? br.readFloat32Array(16) : br.readFloat64Array(16);
                this.matrices.set(transformation, this._iMatrix);
                this._iMatrix += 16;
            }

            let styleItem = this._styleMap.GetStyle(styleId);
            if (styleItem === null)
                styleItem = this._styleMap.GetStyle(-1); //default style

            shapeList.push({
                pLabel: prodLabel,
                iLabel: instanceLabel,
                style: styleItem.index,
                transparent: styleItem.transparent,
                transform: transformation != null ? this._iTransform++ : -1,
            });
        }
        return shapeList;
    }

    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
    public load(source) {
        //binary reading
        const br = new BinaryReader();
        const self = this;
        br.onloaded = function() {
            self.parse(br);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.onerror = function(msg) {
            if (self.onerror) self.onerror(msg);
        };
        br.load(source);
    }

    public onloaded: (geometry: ModelGeometry) => void;

    public onerror: (message?: string) => void;
}

export class ProductMap {
    productID: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Int32Array[];
}

export class Region {
    public population: number = -1;
    public centre: Float32Array = null;
    public bbox: Float32Array = null;

    constructor(region?: Region) {
        if (region) {
            this.population = region.population;
            this.centre = new Float32Array(region.centre);
            this.bbox = new Float32Array(region.bbox);
        }
    }

    /**
     * Returns clone of this region
     */
    public clone(): Region {
        const clone = new Region();

        clone.population = this.population;
        clone.centre = new Float32Array(this.centre);
        clone.bbox = new Float32Array(this.bbox);

        return clone;
    }

    /**
     * Returns new region which is a merge of this region and the argument
     * @param region region to be merged
     */
    public merge(region: Region): Region {
        //if this is a new empty region, return clone of the argument
        if (this.population === -1 && this.centre === null && this.bbox === null)
            return new Region(region);

        const out = new Region();
        out.population = this.population + region.population;

        const x = Math.min(this.bbox[0], region.bbox[0]);
        const y = Math.min(this.bbox[1], region.bbox[1]);
        const z = Math.min(this.bbox[2], region.bbox[2]);

        const x2 = Math.min(this.bbox[0] + this.bbox[3], region.bbox[0] + region.bbox[3]);
        const y2 = Math.min(this.bbox[1] + this.bbox[4], region.bbox[1] + region.bbox[4]);
        const z2 = Math.min(this.bbox[2] + this.bbox[5], region.bbox[2] + region.bbox[5]);

        const sx = x2 - x;
        const sy = y2 - y;
        const sz = z2 - z;

        const cx = (x + x2) / 2.0;
        const cy = (y + y2) / 2.0;
        const cz = (z + z2) / 2.0;

        out.bbox = new Float32Array([x, y, z, sx, sy, sz]);
        out.centre = new Float32Array([cx, cy, cz]);
        return out;
    }
}

class StyleMap {
    private _internal: { [id: number]: StyleRecord } = {};

    public Add(record: StyleRecord): void {
        this._internal[record.id] = record;
    }

    public GetStyle(id: number): StyleRecord {
        const item = this._internal[id];
        if (item)
            return item;
        return null;
    }
}

class StyleRecord {
    public id: number;
    public index: number;
    public transparent: boolean;
}

class ShapeRecord {
    public pLabel: number;
    public iLabel: number;
    public style: number;
    public transparent: boolean;
    public transform: number;
}
