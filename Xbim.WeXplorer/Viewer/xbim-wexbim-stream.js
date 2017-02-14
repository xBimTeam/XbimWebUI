"use strict";
var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        var WexBimHeader = (function () {
            function WexBimHeader() {
                this.MagicNumber = 94132117;
                this.Version = 3; //modified to support regions correctly
            }
            WexBimHeader.ReadFromStream = function (reader) {
                var header = new WexBimHeader();
                header.MagicNumber = reader.ReadInt32();
                header.Version = reader.ReadByte();
                header.ShapeCount = reader.ReadInt32();
                header.VertexCount = reader.ReadInt32();
                header.TriangleCount = reader.ReadInt32();
                header.MatrixCount = reader.ReadInt32();
                header.ProductCount = reader.ReadInt32();
                header.StyleCount = reader.ReadInt32();
                header.OneMeter = reader.ReadSingle();
                header.RegionCount = reader.ReadInt16();
                return header;
            };
            return WexBimHeader;
        }());
        Viewer.WexBimHeader = WexBimHeader;
        var WexBimRegion = (function () {
            function WexBimRegion() {
                this.Int32 = Population;
            }
            WexBimRegion.prototype.WexBimRegion = function () {
                _geometryModels = new List();
            };
            return WexBimRegion;
        }());
        Viewer.WexBimRegion = WexBimRegion;
        {
            get;
            set;
        }
        Single;
        CentreX;
        {
            get;
            set;
        }
        Single;
        CentreY;
        {
            get;
            set;
        }
        Single;
        CentreZ;
        {
            get;
            set;
        }
        XbimRect3D;
        BoundingBox;
        List < WexBimGeometryModel > _geometryModels;
        IList < WexBimGeometryModel > GeometryModels;
        _geometryModels;
        int;
        MatrixCount();
        {
            return _geometryModels.Sum(function (gm) { return gm.MatrixCount(); });
        }
        int;
        ShapeCount();
        {
            return _geometryModels.Sum(function (gm) { return gm.ShapeCount(); });
        }
        int;
        TriangleCount();
        {
            return _geometryModels.Sum(function (gm) { return gm.TriangleCount(); });
        }
        int;
        VertexCount();
        {
            return _geometryModels.Sum(function (gm) { return gm.VertexCount(); });
        }
        void AddGeometryModel(byte[], triangulation, IEnumerable < WexBimShapeMultiInstance > instances);
        {
            var gm = new WexBimGeometryModel, _a = (void 0).Geometry, Geometry = _a === void 0 ? new WexBimMesh(triangulation) : _a;
            gm.AddInstances(instances);
            _geometryModels.Add(gm);
        }
        void AddGeometryModel(byte[], triangulation, WexBimShapeSingleInstance, singleInstance);
        {
            var gm = new WexBimGeometryModel, _b = (void 0).Geometry, Geometry = _b === void 0 ? new WexBimMesh(triangulation) : _b;
            gm.AddInstance(singleInstance);
            _geometryModels.Add(gm);
        }
        void AddGeometryModel(WexBimGeometryModel, gm);
        {
            _geometryModels.Add(gm);
        }
        void WriteToStream(BinaryWriter, writer);
        {
            writer.Write(Population);
            writer.Write(CentreX);
            writer.Write(CentreY);
            writer.Write(CentreZ);
            writer.Write(BoundingBox.ToFloatArray());
        }
        WexBimRegion;
        ReadFromStream(BinaryReader, reader);
        {
            var region = new WexBimRegion();
            region.Population = reader.ReadInt32();
            region.CentreX = reader.ReadSingle();
            region.CentreY = reader.ReadSingle();
            region.CentreZ = reader.ReadSingle();
            region.BoundingBox = XbimRect3D.FromArray(reader.ReadBytes(6 * sizeof(float)));
            return region;
        }
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
var WexBimStyle = (function () {
    function WexBimStyle() {
        this.Int32 = StyleId;
    }
    return WexBimStyle;
}());
exports.WexBimStyle = WexBimStyle;
{
    get;
    set;
}
Single;
Red;
{
    get;
    set;
}
Single;
Green;
{
    get;
    set;
}
Single;
Blue;
{
    get;
    set;
}
Single;
Alpha;
{
    get;
    set;
}
void WriteToStream(BinaryWriter, writer);
{
    writer.Write(StyleId);
    writer.Write(Red);
    writer.Write(Green);
    writer.Write(Blue);
    writer.Write(Alpha);
}
WexBimStyle;
ReadFromStream(BinaryReader, reader);
{
    var style = new WexBimStyle();
    style.StyleId = reader.ReadInt32();
    style.Red = reader.ReadSingle();
    style.Green = reader.ReadSingle();
    style.Blue = reader.ReadSingle();
    style.Alpha = reader.ReadSingle();
    return style;
}
var WexBimProduct = (function () {
    function WexBimProduct() {
        this.Int32 = ProductLabel;
    }
    return WexBimProduct;
}());
exports.WexBimProduct = WexBimProduct;
{
    get;
    set;
}
Int16;
ProductType;
{
    get;
    set;
}
XbimRect3D;
BoundingBox;
{
    get;
    set;
}
void WriteToStream(BinaryWriter, writer);
{
    writer.Write(ProductLabel);
    writer.Write(ProductType);
    writer.Write(BoundingBox.ToFloatArray());
}
WexBimProduct;
ReadFromStream(BinaryReader, reader);
{
    var product = new WexBimProduct();
    product.ProductLabel = reader.ReadInt32();
    product.ProductType = reader.ReadInt16();
    product.BoundingBox = XbimRect3D.FromArray(reader.ReadBytes(6 * sizeof(float)));
    return product;
}
bool;
IsSingleInstance;
{
    get;
}
Int32;
ProductLabel;
{
    get;
    set;
}
Int16;
InstanceTypeId;
{
    get;
    set;
}
Int32;
InstanceLabel;
{
    get;
    set;
}
Int32;
StyleId;
{
    get;
    set;
}
byte[];
Transformation;
{
    get;
    set;
}
void WriteToStream(BinaryWriter, writer);
var WexBimShapeSingleInstance = (function () {
    function WexBimShapeSingleInstance() {
    }
    return WexBimShapeSingleInstance;
}());
exports.WexBimShapeSingleInstance = WexBimShapeSingleInstance;
IWexBimShape;
{
    Int32;
    ProductLabel;
    {
        get;
        set;
    }
    Int16;
    InstanceTypeId;
    {
        get;
        set;
    }
    Int32;
    InstanceLabel;
    {
        get;
        set;
    }
    Int32;
    StyleId;
    {
        get;
        set;
    }
    bool;
    IsSingleInstance;
    {
        get;
        {
            return true;
        }
    }
    byte[];
    Transformation;
    {
        get;
        {
            return null;
        }
        set;
        {
            throw new NotImplementedException();
        }
    }
    virtual;
    void WriteToStream(BinaryWriter, writer);
    {
        writer.Write(ProductLabel);
        writer.Write(InstanceTypeId);
        writer.Write(InstanceLabel);
        writer.Write(StyleId);
    }
    WexBimShapeSingleInstance;
    ReadFromStream(BinaryReader, reader);
    {
        var shape = new WexBimShapeSingleInstance();
        shape.ProductLabel = reader.ReadInt32();
        shape.InstanceTypeId = reader.ReadInt16();
        shape.InstanceLabel = reader.ReadInt32();
        shape.StyleId = reader.ReadInt32();
        return shape;
    }
}
/// <summary>
/// Special kind of shape header for multiple instance shapes which has a transform
/// </summary>
var WexBimShapeMultiInstance = (function () {
    function WexBimShapeMultiInstance() {
    }
    return WexBimShapeMultiInstance;
}());
exports.WexBimShapeMultiInstance = WexBimShapeMultiInstance;
IWexBimShape;
{
    Int32;
    ProductLabel;
    {
        get;
        set;
    }
    Int16;
    InstanceTypeId;
    {
        get;
        set;
    }
    Int32;
    InstanceLabel;
    {
        get;
        set;
    }
    Int32;
    StyleId;
    {
        get;
        set;
    }
    byte[];
    Transformation;
    {
        get;
        set;
    }
    bool;
    IsSingleInstance;
    {
        get;
        {
            return false;
        }
    }
    void WriteToStream(BinaryWriter, writer);
    {
        writer.Write(ProductLabel);
        writer.Write(InstanceTypeId);
        writer.Write(InstanceLabel);
        writer.Write(StyleId);
        Debug.Assert(Transformation.Length == 16 * sizeof(double));
        writer.Write(Transformation);
    }
    WexBimShapeMultiInstance;
    ReadFromStream(BinaryReader, reader);
    {
        var shape = new WexBimShapeMultiInstance();
        shape.ProductLabel = reader.ReadInt32();
        shape.InstanceTypeId = reader.ReadInt16();
        shape.InstanceLabel = reader.ReadInt32();
        shape.StyleId = reader.ReadInt32();
        shape.Transformation = reader.ReadBytes(16 * sizeof(double));
        return shape;
    }
}
var WexBimGeometryModel = (function () {
    function WexBimGeometryModel() {
        this.WexBimMesh = Geometry;
    }
    WexBimGeometryModel.prototype.List = ;
    WexBimGeometryModel.prototype.WexBimGeometryModel = function () {
        _shapes = new List();
    };
    WexBimGeometryModel.prototype.IEnumerable = ;
    return WexBimGeometryModel;
}());
exports.WexBimGeometryModel = WexBimGeometryModel;
{
    get;
    set;
}
int;
MatrixCount();
{
    return _shapes.OfType().Count();
}
int;
ShapeCount();
{
    return _shapes.Count;
}
int;
TriangleCount();
{
    return Geometry.TriangleCount;
}
int;
VertexCount();
{
    return Geometry.VertexCount;
}
void AddInstances(IEnumerable < WexBimShapeMultiInstance > instances);
{
    _shapes.AddRange(instances);
}
void AddInstance(WexBimShapeSingleInstance, singleInstance);
{
    _shapes.Add(singleInstance);
}
void WriteToStream(BinaryWriter, writer);
{
    writer.Write(_shapes.Count);
    foreach();
    var shape;
     in _shapes;
    {
        shape.WriteToStream(writer);
    }
    writer.Write(Geometry.Length);
    writer.Write(Geometry.ToByteArray());
}
WexBimGeometryModel;
ReadFromStream(BinaryReader, reader);
{
    var geometry = new WexBimGeometryModel();
    var numShapes = reader.ReadInt32();
    if (numShapes > 1) {
        for (int; i = 0; i < numShapes)
            ;
        i++;
        {
            geometry._shapes.Add(WexBimShapeMultiInstance.ReadFromStream(reader));
        }
    }
    else {
        geometry._shapes.Add(WexBimShapeSingleInstance.ReadFromStream(reader));
    }
    //read the geometry
    var numBytes = reader.ReadInt32();
    geometry.Geometry = new WexBimMesh(reader.ReadBytes(numBytes));
    return geometry;
}
var WexBimStream = (function () {
    function WexBimStream() {
        this.WexBimHeader = Header;
    }
    WexBimStream.prototype.WexBimStream = function () {
        Header = new WexBimHeader();
        _regions = new List();
        _styles = new List();
        _products = new Dictionary();
    };
    return WexBimStream;
}());
exports.WexBimStream = WexBimStream;
{
    get;
    set;
}
List < WexBimRegion > _regions;
List < WexBimStyle > _styles;
Dictionary < int, WexBimProduct > _products;
IList < WexBimRegion > Regions;
_regions;
IList < WexBimStyle > Styles;
_styles;
IEnumerable < WexBimProduct > Products;
_products.Values;
void AddRegion(WexBimRegion, region);
{
    _regions.Add(region);
}
void AddStyle(WexBimStyle, style);
{
    _styles.Add(style);
}
void AddProduct(WexBimProduct, product);
{
    WexBimProduct;
    existingProduct;
    if (_products.TryGetValue(product.ProductLabel, out, existingProduct)) {
        var bb = existingProduct.BoundingBox;
        bb.Union(product.BoundingBox);
        existingProduct.BoundingBox = bb;
    }
    else
        _products.Add(product.ProductLabel, product);
}
void WriteToStream(BinaryWriter, writer);
{
    //first write the header but rememeber the pont on the stram as we have to overrite when all the data is known
    var startPosition = writer.Seek(0, SeekOrigin.Current);
    //set up the header
    UpdateHeader();
    Header.WriteToStream(writer);
    foreach();
    var region;
     in Regions;
    region.WriteToStream(writer);
    foreach();
    var style;
     in Styles;
    style.WriteToStream(writer);
    foreach();
    var product;
     in Products;
    product.WriteToStream(writer);
    foreach();
    var region;
     in Regions;
    {
        writer.Write(region.GeometryModels.Count);
        foreach();
        var geometry;
         in region.GeometryModels;
        geometry.WriteToStream(writer);
    }
}
WexBimStream;
ReadFromStream(BinaryReader, reader);
{
    var wexBimStream = new WexBimStream();
    wexBimStream.Header = WexBimHeader.ReadFromStream(reader);
    for (int; i = 0; i < wexBimStream.Header.RegionCount)
        ;
    i++;
    wexBimStream.AddRegion(WexBimRegion.ReadFromStream(reader));
    for (int; i = 0; i < wexBimStream.Header.StyleCount)
        ;
    i++;
    wexBimStream.AddStyle(WexBimStyle.ReadFromStream(reader));
    for (int; i = 0; i < wexBimStream.Header.ProductCount)
        ;
    i++;
    wexBimStream.AddProduct(WexBimProduct.ReadFromStream(reader));
    foreach();
    var region;
     in wexBimStream.Regions;
    {
        var geometryCount = reader.ReadInt32();
        for (int; i = 0; i < geometryCount)
            ;
        i++;
        region.AddGeometryModel(WexBimGeometryModel.ReadFromStream(reader));
    }
    return wexBimStream;
}
void UpdateHeader();
{
    Header.MatrixCount = Regions.Sum(function (r) { return r.MatrixCount(); });
    Header.ProductCount = _products.Count;
    Header.RegionCount = (short);
    _regions.Count;
    Header.ShapeCount = Regions.Sum(function (r) { return r.ShapeCount(); });
    Header.StyleCount = _styles.Count;
    Header.TriangleCount = Regions.Sum(function (r) { return r.TriangleCount(); });
    Header.VertexCount = Regions.Sum(function (r) { return r.VertexCount(); });
}
//# sourceMappingURL=xbim-wexbim-stream.js.map