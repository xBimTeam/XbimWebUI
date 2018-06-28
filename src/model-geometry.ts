import { BinaryReader } from "./binary-reader";
import { TriangulatedShape } from "./triangulated-shape";
import { State } from "./state";
import { ProductType } from "./product-type";
import { Message, MessageType } from "./message";

export class ModelGeometry {

    private progress: (message: Message) => void;

    //all this data is to be fed into GPU as attributes
    public normals = new Uint8Array(0);
    public indices = new Float32Array(0);
    public products = new Float32Array(0);
    public transformations = new Float32Array(0);
    public styleIndices = new Uint16Array(0);
    public states = new Uint8Array(0);
    //this is the only array we need to keep alive on client side to be able to change appearance of the model

    //these will be sent to GPU as the textures
    public vertices = new Float32Array(0);
    public matrices = new Float32Array(0);
    public styles = new Uint8Array(0);

    public meter = 1000;
    public wcs = [0, 0, 0];

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
    private _maxVersionSupported = 4;

    public productMaps: { [id: number]: ProductMap } = {};
    public productIdLookup = [];
    public regions: Region[];
    public transparentIndex: number;

    private _reader: BinaryReader;
    private _styleMap = new StyleMap();

    private parse(binReader: BinaryReader) {
        if (!binReader || binReader.isEOF()) {
            // don't do anything if there is no data
            return;
        }
        this._reader = binReader;

        let br = binReader;
        let magicNumber = br.readInt32();
        if (magicNumber != 94132117) throw new Error('Magic number mismatch.');
        let version = br.readByte();
        if (version > this._maxVersionSupported) throw new Error(`Viewer doesn't support version ${version} of the wexBIM stream`);
        let numShapes = br.readInt32();
        let numVertices = br.readInt32();
        let numTriangles = br.readInt32();
        let numMatrices = br.readInt32();
        let numProducts = br.readInt32();
        let numStyles = br.readInt32();
        this.meter = br.readFloat32();
        if (version > 3) {
            this.wcs = [br.readFloat64(), br.readFloat64(), br.readFloat64()];
        }

        let numRegions = br.readInt16();

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
            let region = new Region();
            region.population = br.readInt32();
            region.centre = br.readFloat32Array(3);
            region.bbox = br.readFloat32Array(6);
            this.regions[i] = region;
        }

        let iStyle = 0;
        for (iStyle; iStyle < numStyles; iStyle++) {
            let styleId = br.readInt32();
            let R = br.readFloat32() * 255;
            let G = br.readFloat32() * 255;
            let B = br.readFloat32() * 255;
            let A = br.readFloat32() * 255;
            this.styles.set([R, G, B, A], iStyle * 4);
            this._styleMap.Add({ id: styleId, index: iStyle, transparent: A < 254 });
        }
        this.styles.set([255, 255, 255, 255], iStyle * 4);
        let defaultStyle: StyleRecord = { id: -1, index: iStyle, transparent: false };
        this._styleMap.Add(defaultStyle);

        for (let i = 0; i < numProducts; i++) {
            let productLabel = br.readInt32();
            let prodType = br.readInt16();
            let bBox = br.readFloat32Array(6);

            let map: ProductMap = {
                productID: productLabel,
                renderId: i + 1,
                type: prodType,
                bBox: bBox,
                spans: []
            };
            this.productMaps[productLabel] = map;
            this.productIdLookup[i + 1] = productLabel;
        }

        //version 3 puts geometry in regions properly so it is possible to use this information for rendering
        if (version >= 3) {
            for (let r = 0; r < numRegions; r++) {
                let region = this.regions[r]
                let geomCount = br.readInt32();

                for (let g = 0; g < geomCount; g++) {

                    //read shape information
                    var shapes = this.readShape(version);

                    //read geometry
                    let geomLength = br.readInt32();
                    if (geomLength === 0) {
                        // this should not happen but we had seen this before
                        continue;
                    }

                    //read geometry data (make sure we don't overflow - use isolated subreader)
                    let gbr = br.getSubReader(geomLength);
                    let geometry = new TriangulatedShape();
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
                let shapes = this.readShape(version);

                //read shape geometry
                let geometry = new TriangulatedShape();
                geometry.parse(br);

                //feed data arays
                this.feedDataArrays(shapes, geometry);
            }
        }

        //binary reader should be at the end by now
        if (!br.isEOF()) {
            this.progress({
                type: MessageType.FAILED,
                message: "Processing data",
                percent: 0
            });
            throw new Error('Binary reader is not at the end of the file.');
        } else {
            this.progress({
                type: MessageType.PROGRESS,
                message: "Processing data",
                percent: 100
            });
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
        if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
            throw new Error('Wrong arguments for "square" function.');
        }
        if (count == 0) return 0;
        let byteLength = count * arity;
        let imgSide = Math.ceil(Math.sqrt(byteLength / 4));
        //clamp to parity
        while ((imgSide * 4) % arity != 0) {
            imgSide++
        }
        let result = imgSide * imgSide * 4 / arity;
        return result;
    }

    private feedDataArrays(shapes: Array<ShapeRecord>, geometry: TriangulatedShape) {
        //copy shape data into inner array and set to null so it can be garbage collected
        shapes.forEach(shape => {
            let iIndex = 0;
            //set iIndex according to transparency either from beginning or at the end
            if (shape.transparent) {
                iIndex = this._iIndexBackward - geometry.indices.length;
            } else {
                iIndex = this._iIndexForward;
            }

            let begin = iIndex;
            let map = this.productMaps[shape.pLabel];
            if (typeof (map) === "undefined") {
                //throw "Product hasn't been defined before.";
                map = {
                    productID: 0,
                    renderId: 0,
                    type: ProductType.IFCOPENINGELEMENT,
                    bBox: new Float32Array(6),
                    spans: []
                };
                this.productMaps[shape.pLabel] = map;
            }

            this.normals.set(geometry.normals, iIndex * 2);

            //switch spaces and openings off by default 
            let state = map.type == ProductType.IFCSPACE || map.type == ProductType.IFCOPENINGELEMENT
                ? State.HIDDEN
                : 0xFF; //0xFF is for the default state

            //fix indices to right absolute position. It is relative to the shape.
            for (let i = 0; i < geometry.indices.length; i++) {
                this.indices[iIndex] = geometry.indices[i] + this._iVertex / 3;
                this.products[iIndex] = map.renderId;
                this.styleIndices[iIndex] = shape.style;
                this.transformations[iIndex] = shape.transform; //shape.pLabel == 33698 || shape.pLabel == 33815 ? -1 : shape.transform;
                this.states[2 * iIndex] = state; //set state
                this.states[2 * iIndex + 1] = 0xFF; //default style

                iIndex++;
            }

            let end = iIndex;
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

    private readShape(version: number): Array<ShapeRecord> {
        let br = this._reader;

        let repetition = br.readInt32();
        let shapeList = new Array<ShapeRecord>();
        for (let iProduct = 0; iProduct < repetition; iProduct++) {
            let prodLabel = br.readInt32();
            let instanceTypeId = br.readInt16();
            let instanceLabel = br.readInt32();
            let styleId = br.readInt32();
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
                transform: transformation != null ? this._iTransform++ : -1
            });
        }
        return shapeList;
    }

    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
    public load(source, headers: { [name: string]: string }, progress: (message: Message) => void) {
        this.progress = progress ? progress : (m) => { };
        //binary reading
        let br = new BinaryReader();
        let self = this;
        br.onloaded = () => {
            self.parse(br);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.onerror = (msg) => {
            if (self.onerror) {
                self.onerror(msg);
            }
        };
        br.load(source, headers, progress);
    }

    public onloaded: (geometry: ModelGeometry) => void;

    public onerror: (message?: string) => void;
}


export class ProductMap {
    productID: number;
    renderId: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Array<Int32Array>;

    public static clone(o: ProductMap): ProductMap {
        const c = new ProductMap();
        c.productID = o.productID;
        c.renderId - o.renderId;
        c.type = o.type;
        c.bBox = new Float32Array(o.bBox);
        c.spans = o.spans;
        return c;
    }
}

export class Region {
    public population: number = -1;
    public centre: Float32Array = null;
    public bbox: Float32Array = null;

    constructor(region?: Region) {
        if (region) {
            this.population = region.population;
            if (region.centre) {
                this.centre = new Float32Array(region.centre);
            }
            if (region.bbox) {
                this.bbox = new Float32Array(region.bbox);
            }
        }
    }

    /**
     * Returns clone of this region
     */
    public static clone(o: Region): Region {
        let clone = new Region();

        clone.population = o.population;
        if (o.centre) {
            clone.centre = new Float32Array(o.centre);
        }
        if (o.bbox) {
            clone.bbox = new Float32Array(o.bbox);
        }

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

        let out = new Region();
        out.population = this.population + region.population;

        if (this.bbox && region.bbox) {
            let x = Math.min(this.bbox[0], region.bbox[0]);
            let y = Math.min(this.bbox[1], region.bbox[1]);
            let z = Math.min(this.bbox[2], region.bbox[2]);

            let x2 = Math.max(this.bbox[0] + this.bbox[3], region.bbox[0] + region.bbox[3]);
            let y2 = Math.max(this.bbox[1] + this.bbox[4], region.bbox[1] + region.bbox[4]);
            let z2 = Math.max(this.bbox[2] + this.bbox[5], region.bbox[2] + region.bbox[5]);

            let sx = x2 - x;
            let sy = y2 - y;
            let sz = z2 - z;

            let cx = (x + x2) / 2.0;
            let cy = (y + y2) / 2.0;
            let cz = (z + z2) / 2.0;

            out.bbox = new Float32Array([x, y, z, sx, sy, sz]);
            out.centre = new Float32Array([cx, cy, cz]);
        } else if (this.bbox) {
            out.bbox = new Float32Array(this.bbox);
            out.centre = new Float32Array(this.centre);
        } else {
            out.bbox = new Float32Array(region.bbox);
            out.centre = new Float32Array(region.centre);
        }

        return out;
    }
}

class StyleMap {
    private _internal: { [id: number]: StyleRecord } = {};

    public Add(record: StyleRecord): void {
        this._internal[record.id] = record;
    }

    public GetStyle(id: number): StyleRecord {
        let item = this._internal[id];
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