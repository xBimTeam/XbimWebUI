import { BinaryReader } from "./binary-reader";
import { TriangulatedShape } from "./triangulated-shape";
import { State } from "./state";
import { ProductType } from "./product-type";

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

    public productMaps: { [id: number]: ProductMap } = {};
    public regions: Region[];
    public transparentIndex: number;

    public parse(binReader: BinaryReader) {
        let br = binReader;
        let magicNumber = br.readInt32();
        if (magicNumber != 94132117) throw 'Magic number mismatch.';
        let version = br.readByte();
        let numShapes = br.readInt32();
        let numVertices = br.readInt32();
        let numTriangles = br.readInt32();
        let numMatrices = br.readInt32();;
        let numProducts = br.readInt32();;
        let numStyles = br.readInt32();;
        this.meter = br.readFloat32();;
        let numRegions = br.readInt16();


        //set size of arrays to be square usable for texture data
        //TODO: reflect support for floating point textures
        let square = function (arity, count) {
            if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
                throw 'Wrong arguments';
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
        };

        //create target buffers of correct size (avoid reallocation of memory)
        this.vertices = new Float32Array(square(4, numVertices * 3));
        this.normals = new Uint8Array(numTriangles * 6);
        this.indices = new Float32Array(numTriangles * 3);
        this.styleIndices = new Uint16Array(numTriangles * 3);
        this.styles = new Uint8Array(square(1, (numStyles + 1) * 4)); //+1 is for a default style
        this.products = new Float32Array(numTriangles * 3);
        this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
        this.transformations = new Float32Array(numTriangles * 3);
        this.matrices = new Float32Array(square(4, numMatrices * 16));
        this.productMaps = {};
        this.regions = new Array<Region>(numRegions);

        let styleMap = new StyleMap();

        let iVertex = 0;
        let iIndexForward = 0;
        let iIndexBackward = numTriangles * 3;
        let iTransform = 0;
        let iMatrix = 0;

        let stateEnum = State;
        let typeEnum = ProductType;

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
            styleMap.Add({ id: styleId, index: iStyle, transparent: A < 254 });
        }
        this.styles.set([255, 255, 255, 255], iStyle * 4);
        let defaultStyle: StyleRecord = { id: -1, index: iStyle, transparent: false };
        styleMap.Add(defaultStyle);

        for (let i = 0; i < numProducts; i++) {
            let productLabel = br.readInt32();
            let prodType = br.readInt16();
            let bBox = br.readFloat32Array(6);

            let map: ProductMap = {
                productID: productLabel,
                type: prodType,
                bBox: bBox,
                spans: []
            };
            this.productMaps[productLabel] = map;
        }

        for (let iShape = 0; iShape < numShapes; iShape++) {

            let repetition = br.readInt32();
            let shapeList = [];
            for (let iProduct = 0; iProduct < repetition; iProduct++) {
                let prodLabel = br.readInt32();
                let instanceTypeId = br.readInt16();
                let instanceLabel = br.readInt32();
                let styleId = br.readInt32();
                let transformation = null;

                if (repetition > 1) {
                    transformation = version === 1 ? br.readFloat32Array(16) : br.readFloat64Array(16);
                    this.matrices.set(transformation, iMatrix);
                    iMatrix += 16;
                }

                let styleItem = styleMap.GetStyle(styleId);
                if (styleItem === null)
                    styleItem = defaultStyle;

                shapeList.push({
                    pLabel: prodLabel,
                    iLabel: instanceLabel,
                    style: styleItem.index,
                    transparent: styleItem.transparent,
                    transform: transformation != null ? iTransform++ : -1
                });
            }

            //read shape geometry
            let shapeGeom = new TriangulatedShape();
            shapeGeom.parse(br);


            //copy shape data into inner array and set to null so it can be garbage collected
            shapeList.forEach(shape => {
                let iIndex = 0;
                //set iIndex according to transparency either from beginning or at the end
                if (shape.transparent) {
                    iIndex = iIndexBackward - shapeGeom.indices.length;
                } else {
                    iIndex = iIndexForward;
                }

                let begin = iIndex;
                let map = this.productMaps[shape.pLabel];
                if (typeof (map) === "undefined") {
                    //throw "Product hasn't been defined before.";
                    map = {
                        productID: 0,
                        type: typeEnum.IFCOPENINGELEMENT,
                        bBox: new Float32Array(6),
                        spans: []
                    };
                    this.productMaps[shape.pLabel] = map;
                }

                this.normals.set(shapeGeom.normals, iIndex * 2);

                //switch spaces and openings off by default 
                let state = map.type == typeEnum.IFCSPACE || map.type == typeEnum.IFCOPENINGELEMENT
                    ? stateEnum.HIDDEN
                    : 0xFF; //0xFF is for the default state

                //fix indices to right absolute position. It is relative to the shape.
                for (let i = 0; i < shapeGeom.indices.length; i++) {
                    this.indices[iIndex] = shapeGeom.indices[i] + iVertex / 3;
                    this.products[iIndex] = shape.pLabel;
                    this.styleIndices[iIndex] = shape.style;
                    this.transformations[iIndex] = shape.transform;
                    this.states[2 * iIndex] = state; //set state
                    this.states[2 * iIndex + 1] = 0xFF; //default style

                    iIndex++;
                }

                let end = iIndex;
                map.spans.push(new Int32Array([begin, end]));

                if (shape.transparent) iIndexBackward -= shapeGeom.indices.length;
                else iIndexForward += shapeGeom.indices.length;
            },
                this);

            //copy geometry and keep track of amount so that we can fix indices to right position
            //this must be the last step to have correct iVertex number above
            this.vertices.set(shapeGeom.vertices, iVertex);
            iVertex += shapeGeom.vertices.length;
            shapeGeom = null;
        }

        //binary reader should be at the end by now
        if (!br.isEOF()) {
            //throw 'Binary reader is not at the end of the file.';
        }

        this.transparentIndex = iIndexForward;
    }

    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
    public load(source) {
        //binary reading
        let br = new BinaryReader();
        let self = this;
        br.onloaded = function () {
            self.parse(br);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.onerror = function (msg) {
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
    spans: Array<Int32Array>;
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
        let clone = new Region();

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

        let out = new Region();
        out.population = this.population + region.population;

        let x = Math.min(this.bbox[0], region.bbox[0]);
        let y = Math.min(this.bbox[1], region.bbox[1]);
        let z = Math.min(this.bbox[2], region.bbox[2]);

        let x2 = Math.min(this.bbox[0] + this.bbox[3], region.bbox[0] + region.bbox[3]);
        let y2 = Math.min(this.bbox[1] + this.bbox[4], region.bbox[1] + region.bbox[4]);
        let z2 = Math.min(this.bbox[2] + this.bbox[5], region.bbox[2] + region.bbox[5]);

        let sx = x2 - x;
        let sy = y2 - y;
        let sz = z2 - z;

        let cx = (x + x2) / 2.0;
        let cy = (y + y2) / 2.0;
        let cz = (z + z2) / 2.0;

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
        let item = this._internal[id];
        if (item.id == id)
            return item;
        return null;
    }
}

class StyleRecord {
    public id: number;
    public index: number;
    public transparent: boolean;
}