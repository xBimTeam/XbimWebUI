import { xVisualTemplates } from './visual-templates';
import { xVisualModel } from './visual-model';
import { xCobieUkUtils } from './cobieuk-utils';
import { xCobieUtils } from './cobie-utils';

// '$' and 'jQuery' must be globally available, e.g. by simple loading the jQuery library separately or by using the webpack provide plugin
declare var $, jQuery: any;

export class xBrowser {
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
    constructor(lang?, culture?) {
    this._lang = lang;
    this._culture = culture;
    this._templates = {};

    //compile templates
    var templateStrings = xVisualTemplates();
    for (var t in templateStrings) {
        var templateString = templateStrings[t];
        this._templates[t] = this._compileTemplate(templateString);
    }
}

    private _iconMap = {
        def: 'ui-icon-document',
        facility: 'ui-icon-home',
        space: 'ui-icon-document-b',
        floor: 'ui-icon-image',
        assettype: 'ui-icon-copy',
        asset: 'ui-icon-script',
        document: 'ui-icon-document',
        issue: 'ui-icon-clipboard',
        contact: 'ui-icon-person',
        system: 'ui-icon-wrench',
        zone: 'ui-icon-newwin'
    };

    private _model: xVisualModel = new xVisualModel(null);
    private _events: any[] = [];
    private _lang: any;
    private _culture: any;
    private _templates: any = {};

_compileTemplate (str) {
    // Based on Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    // http://ejohn.org/blog/javascript-micro-templating/
    return new Function("_data_",
        "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(_data_){_p_.push('" +

        // Convert the template into pure JavaScript
        str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("_p_.push('")
            .split("\r").join("\\'")
        + "');}return _p_.join('');");
};



/**
* This function renders spatial structure as a tree view (facility -> floors -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderSpatialStructure
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
renderSpatialStructure (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';

    this._renderTreeView(container, this._model.facility, initTree);
};

/**
* This function renders asset types as a tree view (asset type -> asset). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderAssetTypes
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
renderAssetTypes (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';

    this._renderTreeView(container, this._model.assetTypes, initTree);
};

/**
* This function renders asset types as a list view (asset type -> asset). If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderContacts
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
renderContacts (container) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderListView(container, this._model.contacts, this._templates.contact);
};

/**
* This function renders systems as a tree view (systems -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderSystems
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
renderSystems (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderTreeView(container, this._model.systems, initTree);
};

/**
* This function renders zones as a tree view (zones -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderZones
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
renderZones (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderTreeView(container, this._model.zones, initTree);
};


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
renderAssignments (entity, container) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    container = this._getContainer(container);
    container.innerHTML = "";

    var sets = entity.assignments;
    if (sets.length == 0) return;
    for (var i = 0; i < sets.length; i++) {
        var set = sets[i];
        if (set.assignments.length == 0) continue;

        var div = document.createElement("div");
        div.classList.add('xbim-assignment');
        div.classList.add('ui-widget');
        div.classList.add('ui-corner-all');
        div.classList.add('ui-widget-content');

        var header = document.createElement('h3');
        header.classList.add('xbim-assignment-header');
        header.classList.add('ui-corner-all');
        header.classList.add('ui-widget-header');
        header.classList.add('ui-state-default');
        header.innerHTML = set.name ? set.name : 'Undefined';
        div.appendChild(header);

        var data = document.createElement('div');
        data.classList.add('xbim-assignment-content');
        this._renderListView(data, set.assignments)
        div.appendChild(data);

        container.appendChild(div);
    }


};

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
renderDocuments (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var docs = entity.documents;
    if (docs) {
        this._renderListView(container, docs, null);
    }
};

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
renderIssues (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var issues = entity.issues;
    if (issues) {
        this._renderListView(container, issues, null);
    }
};


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
renderAttributes (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.attribute(entity);
    container.innerHTML = html;
};

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
renderProperties (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.property(entity);
    container.innerHTML = html;
};

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
renderPropertiesAttributes (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.propertyattribute(entity);
    container.innerHTML = html;
};

_registerEntityCallBacks (element, entity) {
    var self = this;
    element.entity = entity;
    //element.addEventListener('', function (e) { self._fire('', { entity: entity, event: e , element: element}); e.stopPropagation(); });

    /**
    * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityClick
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    /**
    * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity} or if {@link xBrowser#activateEntity activateEntity()} is called. 
    * @event xBrowser#entityActive
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}. 
    */
    /**
    * Occurs when user double clicks on a HTML element representing {@link xVisualEntity xVisualEntity}.
    * @event xBrowser#entityDblclick
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}. 
    */
    element.addEventListener('click', function (e) {
        self._fire('entityClick', { entity: entity, event: e, element: element });
        self._fire('entityActive', { entity: entity, event: e, element: element });
        e.stopPropagation();
    });
    element.addEventListener('dblclick', function (e) {
        self._fire('entityDblclick', { entity: entity, event: e, element: element });
        self._fire('entityActive', { entity: entity, event: e, element: element });
        e.stopPropagation();
    });

    /**
    * Occurs when mouseDown event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseDown
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseDown', function (e) { self._fire('entityMouseDown', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when mouseUp event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseUp
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseUp', function (e) { self._fire('entityMouseUp', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when mouseMove event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseMove
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseMove', function (e) { self._fire('entityMouseMove', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when touch event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityTouch
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('touch', function (e) { self._fire('entityTouch', { entity: entity, event: e, element: element }); e.stopPropagation(); });
};

_uiTree (container) {
    if (!container) return;
    //this only works if jQuery UI is available
    if (!jQuery || !jQuery.ui) return;

    var $container = typeof (container) == 'string' ? $("#" + container) : $(container);
    var elements = typeof (container) == 'string' ? $("#" + container + " li") : $(container).find('li');

    //return if tree has been initialized already
    if ($container.hasClass('xbim-tree')) return;
    $container.addClass('xbim-tree');

    var iconOpen = "ui-icon-triangle-1-s";
    var iconClosed = "ui-icon-triangle-1-e";
    var iconLeaf = "ui-icon-document";

    elements
        .prepend(function () {
            if ($(this).children('ul').length > 0) {
                $(this).addClass('xbim-tree-node');
                return '<span class="ui-icon ' + iconClosed + '" style="float: left;"></span>';
            }
            else {
                $(this).addClass('xbim-tree-leaf');
                return '';
            }
        })
        .css('list-style-type', 'none')
        .css('cursor', 'default')
        .children('ul').hide();

    elements.find('span.' + iconClosed).on("click", function (e) {
        e.stopPropagation();
        $(this).parent().children('ul').slideToggle();

        if ($(this).hasClass(iconClosed))
            $(this).removeClass(iconClosed).addClass(iconOpen);
        else
            $(this).removeClass(iconOpen).addClass(iconClosed);
    });

    //open first level if there is only one element
    var firstLevel = $container.children('ul').children('li');
    if (firstLevel.length == 1) firstLevel.children('span.' + iconClosed).click();
};

_renderListView (container, entities, entityTemplate?) {
    var self = this;
    container = this._getContainer(container);
    entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;

    var table = document.createElement('table');
    container.innerHTML = "";
    container.appendChild(table);

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var html = entityTemplate(entity);

        var tr = document.createElement('tr');
        table.appendChild(tr);
        var td = document.createElement('td');
        tr.appendChild(td);

        td.innerHTML = html;
        this._registerEntityCallBacks(td, entity);

        if (jQuery && jQuery.ui) {
            var icon = this._iconMap[entity.type] ? this._iconMap[entity.type] : this._iconMap['def'];
            $(td).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
        }
    }
};

_renderTreeView (container, roots, initSimpleTree, entityTemplate?) {
    var self = this;
    container = this._getContainer(container);
    entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;
    initSimpleTree = initSimpleTree ? initSimpleTree : true;

    var renderEntities = function (entities, ul?: HTMLUListElement) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var html = entityTemplate(entity);

            var li = document.createElement('li');
            li.innerHTML = html;
            self._registerEntityCallBacks(li, entity);

            if (!ul) {
                var ul = document.createElement('ul');
                container.appendChild(ul);
            }

            ul.appendChild(li);

            //recursive call if this element has any children
            if (entity.children && entity.children.length > 0) {
                var inUl = document.createElement('ul');
                li.appendChild(inUl);
                renderEntities(entity.children, inUl)
            }

            if (jQuery && jQuery.ui) {
                var icon = self._iconMap[entity.type] ? self._iconMap[entity.type] : self._iconMap['def'];
                $(li).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
            }
        }
    };


    renderEntities(roots);
    if (initSimpleTree) this._uiTree(container);
};

/**
* Use this function to activate entity from code. This will cause {@link xBrowser#event:entityActive entityActive} event to be fired.
* That might be usefull to update data relying on any kind of selection.
* @function xBrowser#activateEntity
* @param {Number} id - ID of the entity to be activated
*/
activateEntity (id) {
    if (!this._model) return;
    var entity = this._model.getEntity(id);
    if (!entity) return;

    this._fire('entityActive', { entity: entity });
};

_getContainer (container) {
    if (typeof (container) == 'object') return container;
    if (typeof (container) == 'string') {
        container = document.getElementById(container);
        if (container) return container;
    }
    if (!container) return document.documentElement;
};

/**
* Use this function to load data from JSON representation of COBieLite. Listen to {@link xBrowser#event:loaded loaded} event to start
* using the browser.
* @function xBrowser#load
* @param {string|File|Blob} source - path to JSON data or File or Blob object to be used to load the data from
* @fires xBrowser#loaded
*/
load (source) {
    if (typeof (source) == 'undefined') throw 'You have to define a source to JSON data.';
    var self = this;

    //if it is a file, load its content
    if (source instanceof Blob || source instanceof File) {
        var fReader = new FileReader();
        fReader.onloadend = function () {
            if (fReader.result) {
                //set data buffer for next processing
                var data = JSON.parse(fReader.result);

                //set right utils according to the data type
                var uk = typeof (data.FacilityDefaultLinearUnit) === "undefined";
                var utils = uk ? new xCobieUkUtils(self._lang, self._culture) : new xCobieUtils(self._lang, self._culture);

                self._model = utils.getVisualModel(data);
                self._fire('loaded', { model: self._model });
            }
        };
        fReader.readAsText(source);
        return;
    }

    //it should be a string now. Throw an exception if it isn't
    if (typeof (source) !== 'string') throw "Unexpected type of source. It should be File, Blob of string URL";

    //if it is a string than use ajax to load the data
    var xhr = new XMLHttpRequest();
    xhr.open('GET', source, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = xhr.response;

            //----- IE fix
            if (typeof (data) == 'string')
                data = JSON.parse(data);
            //------

            //decide about the version if utils
            var uk = typeof (data.FacilityDefaultLinearUnit) === "undefined";
            var utils = uk ? new xCobieUkUtils(self._lang, self._culture) : new xCobieUtils(self._lang, self._culture);

            self._model = utils.getVisualModel(data);

            /**
            * Occurs when JSON data model is loaded
            * @event xBrowser#loaded
            * @type {object}
            * @param {xVisualModel} model - preprocessed {@link xVisualModel model} prepared for visual representation
            * @param {object} model - original COBie data
            */
            self._fire('loaded', { model: self._model });
        }
        //throw exception as a warning
        if (xhr.readyState == 4 && xhr.status != 200) {
            var msg = 'Failed to fetch semantic JSON data from server. Server code: ' + xhr.status +
                '. This might be due to CORS policy of your browser if you run this as a local file.';
            throw msg;
        }
    };
    xhr.responseType = 'json';
    xhr.send();
};


/**
* Use this method to register to events of the browser. You can define arbitrary number
* of event handlers for any event. You can remove handler by calling {@link xBrowser#onRemove onRemove()} method.
*
* @function xBrowser#on
* @param {String} eventName - Name of the event you would like to listen to.
* @param {Object} callback - Callback handler of the event which will consume arguments and perform any custom action.
*/
on (eventName, callback) {
    var events = this._events;
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
};

/**
* Use this method to unregisted handlers from events. You can add event handlers by call to {@link xBrowser#on on()} method.
*
* @function xBrowser#onRemove
* @param {String} eventName - Name of the event
* @param {Object} callback - Handler to be removed
*/
onRemove (eventName, callback) {
    var events = this._events;
    var callbacks = events[eventName];
    if (!callbacks) {
        return;
    }
    var index = callbacks.indexOf(callback);
    if (index >= 0) {
        callbacks.splice(index, 1);
    }
};

//executes all handlers bound to event name
_fire (eventName, args) {
    var handlers = this._events[eventName];
    if (!handlers) {
        return;
    }
    //call the callbacks
    handlers.forEach(function (handler) {
        handler(args);
    }, this);
};
}