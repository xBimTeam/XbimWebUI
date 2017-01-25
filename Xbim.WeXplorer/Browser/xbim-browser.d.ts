export declare class xBrowser {
    /**
    * This is the main class you need to use to render semantic structure of the building model
    *
    * @name xBrowser
    * @constructor
    * @classdesc This is a reader of COBie data encoded in JSON format in COBieLite data structure. You can easily combine this with 3D viewer xViewer to get full
    * user experience. This class is loosely coupled with jQuery UI. It is not a mandatory dependency for the rendering itself. Tree views are basically
    * nested unordered lists which is a natural representation for hierarchical data and lists are rendered as a table with one column. Classes are assigned
    * to different parts in a way that you can use to style in any way you want.
    *
    * If you want to do all the rendering yourself you can still take advantage of preprocessing which happens after COBie data is loaded. COBie data model
    * is converted to the simplified structure which is more homogenous and better suitable for templating and visual representation. For more detailed
    * information have a look on {@link xVisualModel xVisualModel} and related classes. Visual model is passed as an argument to {@link xBrowser#event.loaded loaded} event.
    *
    * @param {string} [lang] - language code. This framework contains dictionary for parameters and attributes. It will be used for COBie processing and rendering. If your language or culture is not available default values are "en", "uk"
    * @param {string} [culture] - culture code. Default combination of language and culture is "en", "uk".
    */
    constructor(lang?: any, culture?: any);
    private _iconMap;
    private _model;
    private _events;
    private _lang;
    private _culture;
    private _templates;
    _compileTemplate(str: any): Function;
    /**
    * This function renders spatial structure as a tree view (facility -> floors -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderSpatialStructure
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
    */
    renderSpatialStructure(container: any, initTree: any): void;
    /**
    * This function renders asset types as a tree view (asset type -> asset). If you use jQuery UI it can be turned into collapsable tree control
    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderAssetTypes
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
    */
    renderAssetTypes(container: any, initTree: any): void;
    /**
    * This function renders asset types as a list view (asset type -> asset). If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderContacts
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderContacts(container: any): void;
    /**
    * This function renders systems as a tree view (systems -> assets). If you use jQuery UI it can be turned into collapsable tree control
    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderSystems
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
    */
    renderSystems(container: any, initTree: any): void;
    /**
    * This function renders zones as a tree view (zones -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
    * with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderZones
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    * @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
    */
    renderZones(container: any, initTree: any): void;
    /**
    * This function renders assignments as a list view. This represents different kinds of relations between this and other entities
    * If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderAssignments
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderAssignments(entity: any, container: any): void;
    /**
    * This function renders documents as a list view. If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderDocuments
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderDocuments(entity: any, container: any): void;
    /**
    * This function renders issues assigned to the entity as a list view. If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
    * created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
    * heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
    * @function xBrowser#renderIssues
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderIssues(entity: any, container: any): void;
    /**
    * This function renders attributes assigned to the entity as a list view. Attributes are COBie equivalent for Property Sets and can contain
    * arbitrary data. If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want.
    * @function xBrowser#renderAttributes
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderAttributes(entity: any, container: any): void;
    /**
    * This function renders properties assigned to the entity as a list view. Properties are predefined in COBie data model. If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want.
    * @function xBrowser#renderProperties
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderProperties(entity: any, container: any): void;
    /**
    * This function renders properties and attributes assigned to the entity as a list view. This combines data which can be rendered separately
    * by {@link xBrowser#renderProperties renderProperties()} or {@link xBrowser#renderAttributes renderAttributes()} but it is sometimes convenient
    * to render both into one single layout.  If you use jQuery UI it will use UI icons.
    * But it is not mandatory and you can style it any way you want.
    *
    * @function xBrowser#renderPropertiesAttributes
    * @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
    * {@link xBrowser#event:entityClick entityClick},
    * {@link xBrowser#event:entityDblclick entityDblclick},
    * {@link xBrowser#event:entityMouseDown entityMouseDown},
    * {@link xBrowser#event:entityMouseUp entityMouseUp},
    * {@link xBrowser#event:entityMouseMove entityMouseMove},
    * {@link xBrowser#event:entityTouch entityTouch},
    * {@link xBrowser#event:entityActive entityActive}
    * @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
    */
    renderPropertiesAttributes(entity: any, container: any): void;
    _registerEntityCallBacks(element: any, entity: any): void;
    _uiTree(container: any): void;
    _renderListView(container: any, entities: any, entityTemplate?: any): void;
    _renderTreeView(container: any, roots: any, initSimpleTree: any, entityTemplate?: any): void;
    /**
    * Use this function to activate entity from code. This will cause {@link xBrowser#event:entityActive entityActive} event to be fired.
    * That might be usefull to update data relying on any kind of selection.
    * @function xBrowser#activateEntity
    * @param {Number} id - ID of the entity to be activated
    */
    activateEntity(id: any): void;
    _getContainer(container: any): any;
    /**
    * Use this function to load data from JSON representation of COBieLite. Listen to {@link xBrowser#event:loaded loaded} event to start
    * using the browser.
    * @function xBrowser#load
    * @param {string|File|Blob} source - path to JSON data or File or Blob object to be used to load the data from
    * @fires xBrowser#loaded
    */
    load(source: any): void;
    /**
    * Use this method to register to events of the browser. You can define arbitrary number
    * of event handlers for any event. You can remove handler by calling {@link xBrowser#onRemove onRemove()} method.
    *
    * @function xBrowser#on
    * @param {String} eventName - Name of the event you would like to listen to.
    * @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
    */
    on(eventName: any, callback: any): void;
    /**
    * Use this method to unregisted handlers from events. You can add event handlers by call to {@link xBrowser#on on()} method.
    *
    * @function xBrowser#onRemove
    * @param {String} eventName - Name of the event
    * @param {Object} callback - Handler to be removed
    */
    onRemove(eventName: any, callback: any): void;
    _fire(eventName: any, args: any): void;
}
