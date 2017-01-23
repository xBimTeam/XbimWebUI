// Viewer
global['xBinaryReader'] = global['xBinaryReader'] ? global['xBinaryReader'] : require("./Viewer/xbim-binary-reader").xBinaryReader;
global['xModelGeometry'] = global['xModelGeometry'] ? global['xModelGeometry'] :  require("./Viewer/xbim-model-geometry").xModelGeometry;
global['xModelHandle'] = global['xModelHandle'] ? global['xModelHandle'] :   require("./Viewer/xbim-model-handle").xModelHandle;
global['xProductInheritance'] = global['xProductInheritance'] ? global['xProductInheritance'] :   require("./Viewer/xbim-product-inheritance").xProductInheritance;
global['xProductType'] = global['xProductType'] ? global['xProductType'] :   require("./Viewer/xbim-product-type").xProductType;
global['xShaders'] = global['xShaders'] ? global['xShaders'] :   require("./Viewer/xbim-shaders").xShaders;
global['xState'] = global['xState'] ? global['xState'] :  require("./Viewer/xbim-state").xState;
global['xTriangulatedShape'] = global['xTriangulatedShape'] ? global['xTriangulatedShape'] :  require("./Viewer/xbim-triangulated-shape").xTriangulatedShape;
global['xViewer'] = global['xViewer'] ? global['xViewer'] :  require("./Viewer/xbim-viewer").xViewer;

// Plugins
global['xShaders'] = global['xShaders'] ? global['xShaders'] :  require('./Plugins/NavigationCube/xbim-navigation-cube-shaders').xShaders;
global['xCubeTextures'] = global['xCubeTextures'] ? global['xCubeTextures'] :  require('./Plugins/NavigationCube/xbim-navigation-cube-textures').xCubeTextures;
global['xNavigationCube'] = global['xNavigationCube'] ? global['xNavigationCube'] :  require('./Plugins/NavigationCube/xbim-navigation-cube').xNavigationCube;
global['xHomeTextures'] = global['xHomeTextures'] ? global['xHomeTextures'] :  require('./Plugins/NavigationHome/xbim-navigation-home-textures').xHomeTextures;
global['xNavigationHome'] = global['xNavigationHome'] ? global['xNavigationHome'] :  require('./Plugins/NavigationHome/xbim-navigation-home').xNavigationHome;

// Browser
global['xAttributeDictionary'] = global['xAttributeDictionary'] ? global['xAttributeDictionary'] :   require('./Browser/xbim-attribute-dictionary').xAttributeDictionary;
global['xBrowser'] = global['xBrowser'] ? global['xBrowser'] :  require('./Browser/xbim-browser').xBrowser;
global['xCobieUtils'] = global['xCobieUtils'] ? global['xCobieUtils'] :   require('./Browser/xbim-cobie-utils').xCobieUtils;
global['xCobieUkUtils'] = global['xCobieUkUtils'] ? global['xCobieUkUtils'] :   require('./Browser/xbim-cobieuk-utils').xCobieUkUtils;
global['xVisualAssignmentSet'] = global['xVisualAssignmentSet'] ? global['xVisualAssignmentSet'] :  require('./Browser/xbim-visual-assignment-set').xVisualAssignmentSet;
global['xVisualAttribute'] = global['xVisualAttribute'] ? global['xVisualAttribute'] :   require('./Browser/xbim-visual-attribute').xVisualAttribute;
global['xVisualEntity'] = global['xVisualEntity'] ? global['xVisualEntity'] :   require('./Browser/xbim-visual-entity').xVisualEntity;
global['xVisualModel'] = global['xVisualModel'] ? global['xVisualModel'] :   require('./Browser/xbim-visual-model').xVisualModel;
global['xVisualProperty'] = global['xVisualProperty'] ? global['xVisualProperty'] :   require('./Browser/xbim-visual-property').xVisualProperty;
global['xVisualTemplates'] = global['xVisualTemplates'] ? global['xVisualTemplates'] :  require('./Browser/xbim-visual-templates').xVisualTemplates;
