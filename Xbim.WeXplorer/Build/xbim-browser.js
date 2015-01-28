

/* Copyright (c) 2014, xBIM Team, Northumbria University. All rights reserved.

This javascript library is part of xBIM project. It is provided under the same 
Common Development and Distribution License (CDDL) as the xBIM Toolkit. For 
more information see http://www.openbim.org

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
﻿function xAttributeDictionary(lang, culture) {
    var dictionaries = [
        {
            lang: 'cs',
            culture: 'cz',
            terms: {
                AssetDescription: "Popis",
                AssetInstallationDate: "Datum instalace",
                AssetName: "Název",
                AssetSerialNumber: "Sériové číslo",
                AssetTypeCategory: "Kategorie",
                AssetTypeColorCode: "Kód barvy",
                AssetTypeDescription: "Popis",
                AssetTypeFeaturesDescription: "Popis vlastností",
                AssetTypeGradeDescription: "Popis kvality",
                AssetTypeMaterialDescription: "Popis materiálu",
                AssetTypeName: "Název",
                AssetTypeShapeDescription: "Popis tvaru",
                AssetTypeSizeDescription: "Popis velikosti",
                AssetWarrantyStartDate: "Začátek záruky",
                AttributeCategory: "Kategorie",
                AttributeDescription: "Popis",
                AttributeName: "Název",
                FacilityCategory: "Kategorie",
                FacilityDefaultAreaUnit: "Předdefinovaná jednotka plochy",
                FacilityDefaultLinearUnit: "Předdefinovaná jednotka délky",
                FacilityDefaultVolumeUnit: "Předdefinovaná jednotka objemu",
                FacilityDeliverablePhaseName: "Název fáze výsledku",
                FacilityDescription: "Popis nemovitosti",
                FacilityName: "Název",
                FloorCategory: "Kategorie",
                FloorDescription: "Popis",
                FloorName: "Název",
                ProjectDescription: "Popis projektu",
                ProjectName: "Název projektu",
                SiteDescription: "Popis stavby",
                SpaceCategory: "Kategorie místnosti",
                SpaceDescription: "Popis místnosti",
                SpaceName: "Název místnosti",
                SpaceSignageName: "Space Signage Name",
                StringValue: "String Value",
                SystemCategory: "System Category",
                SystemDescription: "System Description",
                SystemName: "System Name",
                UnitName: "Unit Name",
                ZoneCategory: "Zone Category",
                ZoneDescription: "Zone Description",
                ZoneName: "Zone Name",
                externalID: "External ID",
                externalIDReference: "External ID Reference",
                propertySetName: "Property Set",
                True: "Ano",
                False: "Ne"
            }
        },
        {
            lang: 'en',
            culture: 'uk',
            terms: {
                AssetDescription: "Asset Description",
                AssetInstallationDate: "Asset Installation Date",
                AssetName: "Asset Name",
                AssetSerialNumber: "Asset Serial Number",
                AssetTypeCategory: "Asset Type Category",
                AssetTypeColorCode: "Asset Type Color Code",
                AssetTypeDescription: "Asset Type Description",
                AssetTypeFeaturesDescription: "Asset Type Features Description",
                AssetTypeGradeDescription: "Asset Type Grade Description",
                AssetTypeMaterialDescription: "Asset Type Material Description",
                AssetTypeName: "Asset Type Name",
                AssetTypeShapeDescription: "Asset Type Shape Description",
                AssetTypeSizeDescription: "Asset Type Size Description",
                AssetWarrantyStartDate: "Asset Warranty Start Date",
                AttributeCategory: "Attribute Category",
                AttributeDescription: "Attribute Description",
                AttributeName: "Attribute Name",
                FacilityCategory: "Facility Category",
                FacilityDefaultAreaUnit: "Facility Default Area Unit",
                FacilityDefaultLinearUnit: "Facility Default Linear Unit",
                FacilityDefaultVolumeUnit: "Facility Default Volume Unit",
                FacilityDeliverablePhaseName: "Facility Deliverable Phase Name",
                FacilityDescription: "Facility Description",
                FacilityName: "Facility Name",
                FloorCategory: "Floor Category",
                FloorDescription: "Floor Description",
                FloorName: "Floor Name",
                ProjectDescription: "Project Description",
                ProjectName: "Project Name",
                SiteDescription: "Site Description",
                SpaceCategory: "Space Category",
                SpaceDescription: "Space Description",
                SpaceName: "Space Name",
                SpaceSignageName: "Space Signage Name",
                StringValue: "String Value",
                SystemCategory: "System Category",
                SystemDescription: "System Description",
                SystemName: "System Name",
                UnitName: "Unit Name",
                ZoneCategory: "Zone Category",
                ZoneDescription: "Zone Description",
                ZoneName: "Zone Name",
                externalID: "External ID",
                externalIDReference: "External ID Reference",
                propertySetName: "Property Set",
                True: "True",
                False: "False"
            }
        }
    ];
   
    var def = dictionaries.filter(function (e) { return e.lang == 'en' && e.culture == 'uk'; })[0].terms;
    if (typeof (lang) == 'undefined' && typeof (culture) == 'undefined')
        return def;

    //try to find the best fit
    var candidates = dictionaries.filter(function (e) { return e.lang == lang });
    //return default dictionary
    if (candidates.length == 0)
        return def;
    //return language match
    if (candidates.length == 1 || typeof (culture) == 'undefined')
        return candidates[0].terms;

    candidates2 = candidates.filter(function (e) { return e.culture == culture });
    //return culture match
    if (candidates2.length == 1)
        return candidates2[0].terms;
    else
        return candidates[0].terms;
}﻿/**
* This is the main class you need to use to render semantic structure of the building model
* 
* @name xBrowser
* @constructor
* @classdesc This is a reader of COBie data encoded in JSON format in COBieLight data structure. You can easily combine this with 3D viewer xViewer to get full
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
function xBrowser(lang, culture) {
    this._data = null;
    this._model = new xVisualModel();
    this._events = [];
    this._utils = new xCobieUtils(lang, culture);
    this._templates = {};

    //compile templates
    var templateStrings = xVisualTemplates();
    for (var t in templateStrings) {
        var templateString = templateStrings[t];
        this._templates[t] = this._compileTemplate(templateString);
    }
}

xBrowser.prototype._compileTemplate = function (str) {
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

xBrowser.prototype._iconMap = {
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

/**
* This function renders spatial structure as a tree view (facility -> floors -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderSpatialStructure
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
xBrowser.prototype.renderSpatialStructure = function (container, initTree){
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
xBrowser.prototype.renderAssetTypes = function (container, initTree) {
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
xBrowser.prototype.renderContacts = function (container) {
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
xBrowser.prototype.renderSystems = function (container, initTree) {
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
xBrowser.prototype.renderZones = function (container, initTree) {
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
xBrowser.prototype.renderAssignments = function (entity, container) {
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
xBrowser.prototype.renderDocuments = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var docs = entity.documents;
    if (docs) {
        this._renderListView(container, docs, null, 'document');
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
xBrowser.prototype.renderIssues = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var issues = entity.issues;
    if (issues) {
        this._renderListView(container, issues, null, 'clipboard');
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
xBrowser.prototype.renderAttributes = function (entity, container) {
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
xBrowser.prototype.renderProperties = function (entity, container) {
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
xBrowser.prototype.renderPropertiesAttributes = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.propertyattribute(entity);
    container.innerHTML = html;
};

xBrowser.prototype._registerEntityCallBacks = function (element, entity) {
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

xBrowser.prototype._uiTree = function (container) {
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
            if ($(this).children('ul').length > 0){
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

xBrowser.prototype._renderListView = function (container, entities, entityTemplate) {
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

xBrowser.prototype._renderTreeView = function (container, roots, initSimpleTree, entityTemplate) {
    var self = this;
    container = this._getContainer(container);
    entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;  
    initSimpleTree = initSimpleTree ? initSimpleTree : true;

    var renderEntities = function (entities, ul) {
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
xBrowser.prototype.activateEntity = function (id) {
    if (!this._model) return;
    var entity = this._model.getEntity(id);
    if (!entity) return;

    this._fire('entityActive', { entity: entity });
};

xBrowser.prototype._getContainer = function (container) {
    if (typeof (container) == 'object') return container;
    if (typeof (container) == 'string') {
        container = document.getElementById(container);
        if (container) return container;
    }
    if (!container) return document.documentElement;
};

/**
* Use this function to load data from JSON representation of COBieLight. Listen to {@link xBrowser#event:loaded loaded} event to start
* using the browser.
* @function xBrowser#load
* @param {string} source - path to JSON data
* @fires xBrowser#loaded
*/
xBrowser.prototype.load = function (source) {
    if (typeof (source) == 'undefined') throw 'You have to define a source to JSON data.';
    var self = this;

    //use AJAX to load JSON data
    var xhr = new XMLHttpRequest();
    xhr.open('GET', source, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            self._data = xhr.response;

            //----- IE fix
            if (typeof (self._data) == 'string')
                self._data = JSON.parse(self._data);
            //------

            self._model = self._utils.getVisualModel(self._data);

            /**
            * Occurs when JSON data model is loaded
            * @event xBrowser#loaded
            * @type {object}
            * @param {xVisualModel} model - preprocessed {@link xVisualModel model} prepared for visual representation
            * @param {object} model - original COBie data
            */ 
            self._fire('loaded', { model: self._model , data: self._data});
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
xBrowser.prototype.on = function (eventName, callback) {
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
xBrowser.prototype.onRemove = function (eventName, callback) {
    var events = this._events;
    var callbacks = events[eventName];
    if (!callbacks) {
        return;
    }
    var index = callbacks.indexOf(callback)
    if (index >= 0) {
        callbacks.splice(index, 1);
    }
};

//executes all handlers bound to event name
xBrowser.prototype._fire = function (eventName, args) {
    var handlers = this._events[eventName];
    if (!handlers) {
        return;
    }
    //cal the callbacks
    for (var i in handlers) {
        handlers[i](args);
    }
};﻿function xCobieUtils(lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUtils.prototype.settings = {
    decimalPlaces: 4
};

xCobieUtils.prototype.getVisualEntity = function (entity, type) {
    if (!entity || !type) throw 'entity must be defined';
    var id = entity.externalID || entity.externalIDReference;
    var name = "";
    var description = "";
    for (var a in entity) {
        if (a.toLowerCase() == (type + 'name').toLowerCase())
            name = entity[a];
        if (a.toLowerCase() == (type + 'description').toLowerCase())
            description = entity[a];
        if (name.length != 0 && description.length != 0)
            break;
    }

    return new xVisualEntity({
        id: id,
        type: type,
        name: name,
        description: description,
        attributes: this.getAttributes(entity),
        properties: this.getProperties(entity),
        assignments: this.getAssignments(entity, type),
        documents: this.getDocuments(entity, type),
        issues: this.getIssues(entity)
    });
};

xCobieUtils.prototype.getVisualModel = function (data) {
    if (!data) throw 'data must be defined';

    var types = this.getAssetTypes(data);
    var facility = this.getSpatialStructure(data, types);
    return new xVisualModel({
        facility: facility,
        zones: this.getZones(data, facility),
        systems: this.getSystems(data, types),
        assetTypes: types,
        contacts: this.getContacts(data)
    });
};

xCobieUtils.prototype.getContacts = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];

    var contacts = data.Contacts;
    if (contacts) contacts = contacts.Contact;
    if (!contacts) return result;

    for (var i = 0; i < contacts.length; i++) {
        var contact = contacts[i];
        var vContact = this.getVisualEntity(contact, 'contact');
        result.push(vContact);
    }

    return result;
};

xCobieUtils.prototype.getSpatialStructure = function (data, types) {
    if (!data) throw 'data must be defined';

    var facility = this.getVisualEntity(data, 'facility');

    var floors = data.Floors;
    if (!floors)
        return [facility];
    floors = floors.Floor;
    if (!floors || floors.length == 0)
        return [facility];

    for (var i in floors) {
        var floor = floors[i];
        var vFloor = this.getVisualEntity(floor, 'floor');
        facility.children.push(vFloor);

        var spaces = floor.Spaces;
        if (!spaces) continue;
        spaces = spaces.Space;
        if (!spaces) continue;

        for (var s in spaces) {
            var space = spaces[s];
            var vSpace = this.getVisualEntity(space, 'space');
            vFloor.children.push(vSpace);
        }
    }

    //add asset types and assets to spaces 
    types = types ? types : this.getAssetTypes(data);
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'Space' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            var spaceProp = key.properties.filter(function (e) { return e.id == 'SpaceName' })[0];
            var floorProp = key.properties.filter(function (e) { return e.id == 'FloorName' })[0];
            if (!floorProp || !spaceProp) continue;

            var spaceName = spaceProp.value;
            var floorName = floorProp.value;

            var floor = facility.children.filter(function (e) { return e.name == floorName; })[0];
            if (!floor) continue;

            var space = floor.children.filter(function (e) { return e.name == spaceName })[0];
            if (!space) continue;
            
            space.children.push(instance);
            assignmentSet.assignments[0] = space;
        }
    }

    //facility is a root element of the tree spatial structure
    return [facility];
};

xCobieUtils.prototype.getZones = function (data, facility) {
    if (!data) throw 'data must be defined';
    var result = [];

    var zones = data.Zones;
    if (!zones) return result;
    zones = zones.Zone;
    if (!zones) return result;

    for (var z in zones) {
        var zone = zones[z];
        var vZone = this.getVisualEntity(zone, 'zone');
        result.push(vZone);
    }

    //add spaces as a children of zones
    for (var i = 0; i < facility.length; i++) { //facilities (always 1)
        var f = facility[i];
        for (var j = 0; j < f.children.length; j++) { //floors
            var floor = f.children[j];
            for (var k = 0; k < floor.children.length; k++) { //spaces
                var space = floor.children[k];
                var assignmentSet = space.assignments.filter(function (e) { return e.id == 'Zone'; })[0];
                if (!assignmentSet) continue;
                key = assignmentSet.assignments[0];
                if (!key) continue;
                if (!key.id) continue;

                var zone = result.filter(function (e) { return e.id == key.id; })[0];
                if (zone) {
                    //add space to visual children
                    zone.children.push(space);
                    //replace key with actual object
                    assignmentSet.assignments[0] = zone;
                }
            }
        }
    }

    return result;
};

xCobieUtils.prototype.getSystems = function (data, types) {
    if (!data) throw 'data must be defined';
    var result = [];

    var systems = data.Systems;
    if (!systems) return result;
    systems = systems.System;
    if (!systems) return result;

    for (var s in systems) {
        var system = systems[s];
        var vSystem = this.getVisualEntity(system, 'system');
        result.push(vSystem);
    }

    //add asset types and assets to spaces 
    types = types ? types : this.getAssetTypes(data);
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'System' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            if (!key.id) continue;
            var system = result.filter(function (e) { return e.id == key.id; })[0];
            if (system) {
                //add instance to system's visual children
                system.children.push(instance);
                //replace key with actual object
                assignmentSet.assignments[0] = system;
            }
        }
    }

    return result;
};


xCobieUtils.prototype.getAssetTypes = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var tr = this.getTranslator();

    var types = data.AssetTypes;
    if (!types) return result;
    types = types.AssetType;
    if (!types) return result;

    for (var t in types) {
        var type = types[t];
        var vType = this.getVisualEntity(type, 'assettype');
        result.push(vType);

        //process instances of type
        var instances = type.Assets;
        if (!instances) continue;
        instances = instances.Asset;
        if (!instances) continue;
        for (var i in instances) {
            var instance = instances[i];
            var vInstance = this.getVisualEntity(instance, 'asset');
            vType.children.push(vInstance);

            //add assignment to the type
            var assignment = new xVisualAssignmentSet();
            assignment.id = 'AssetType';
            assignment.name = tr(assignment.id);
            assignment.assignments.push(vType);
            vInstance.assignments.push(assignment);
        }
    }

    return result;
};

xCobieUtils.prototype.getProperties = function (entity) {
    if (!entity) throw 'entity must be defined';
    var tr = this.getTranslator();
    var result = [];

    for (var a in entity) {
        var attr = entity[a];
        var valStr = this.getValueString(attr);

        //it is an object not an attribute
        if (!valStr) continue;

        var nameStr = tr(a);
        result.push(new xVisualProperty({ name: nameStr, value: valStr, id: a }));
    }
    return result;
};


xCobieUtils.prototype.getAttributes = function (entity) {
    if (!entity) throw 'entity must be defined';

    var result = [];
    var attributes = null;
    for (var a in entity) {
        if (entity[a].Attribute) {
            attributes = entity[a].Attribute;
            break;
        }
    }
    if (!attributes) return result;
    for (var a in attributes) {
        var attribute = attributes[a];

        result.push(new xVisualAttribute({
            name: attribute.AttributeName,
            description: attribute.AttributeDescription,
            value: this.getValueString(attribute.AttributeValue),
            propertySet: attribute.propertySetName,
            category: attribute.AttributeCategory,
            issues: attribute.AttributeIssues ? this.getAttributes(attribute.AttributeIssues) : []
        }));
    }
    return result;
};

xCobieUtils.prototype.getAssignments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var tr = this.getTranslator();
    var result = [];

    for (var attr in entity) {
        var collection = new xVisualAssignmentSet();
        //assignment collection
        var r = new RegExp('^(' + type + ')(.*)(assignments)$', 'i');
        if (r.test(attr)) {
            collection.id = attr.replace(r, '$2');
            collection.name = tr(collection.id + 's');
            for (var a in entity[attr]) {
                var assignmentSet = entity[attr][a]
                var name = a.replace('Assignment', '').toLowerCase();
                for (var a in assignmentSet) {
                    var assignment = assignmentSet[a];
                    var vAssignment = this.getVisualEntity(assignment, name);
                    vAssignment.isKey = true;
                    collection.assignments.push(vAssignment);
                }
            }
        }
        //single assignment
        r = new RegExp('(.*)(assignment)$', 'i');
        if (r.test(attr)) {
            collection.id = attr.replace(r, '$1');
            collection.name = tr(collection.id);
            var vEntity = this.getVisualEntity(entity[attr], collection.id.toLowerCase());
            collection.assignments.push(vEntity);
        }

        if (collection.assignments.length != 0) {
            result.push(collection);
        }
    }

    return result;
};

xCobieUtils.prototype.getDocuments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var result = [];

    for (var attr in entity) {
        var r = new RegExp('^(' + type + ')(documents)$', 'i');
        if (r.test(attr)) {
            var documents = entity[attr].Document
            if (!documents) continue;
            for (var i = 0; i < documents.length; i++) {
                var doc = documents[i]
                var vDoc = this.getVisualEntity(doc, 'document')
                result.push(vDoc);
            }
        }
    }

    return result;
};

xCobieUtils.prototype.getIssues = function (entity) {
    if (!entity) throw 'entity and type must be defined';
    var result = [];

    for (var attr in entity) {
        if (entity[attr].Issue) {
            var issues = entity[attr].Issue
            for (var i = 0; i < issues.length; i++) {
                var issue = issues[i]
                var vIssue = this.getVisualEntity(issue, 'issue')
                result.push(vIssue);
            }
        }
    }

    return result;
};

xCobieUtils.prototype.setLanguage = function (lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUtils.prototype.getValueString = function (value) {
    if (typeof(value) == 'undefined' || value == null)
        return '';
    var tr = this.getTranslator();

    //this of for attributes
    if (value.Item) value = value.Item;

    var baseVal = "";

    if (typeof (value) == 'string') baseVal = value;
    if (value.BooleanValue) baseVal = value.BooleanValue ? tr('True') : tr('False');
    if (value.StringValue) baseVal = value.StringValue;
    if (typeof (value.DecimalValue) != 'undefined') baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
    if (typeof (value.IntegerValue) != 'undefined') baseVal = value.IntegerValue.toString();

    if (value.UnitName) baseVal += ' ' + value.UnitName;

    return baseVal.length > 0 ? baseVal : '';
};

xCobieUtils.prototype.getTranslator = function () {
    var self = this;
    return function (term) {
        return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    };
};﻿/**
* @name xVisualAssignmentSet
* @constructor
* @classdesc Visual model describing named sets of assignments
*/
function xVisualAssignmentSet() {
    /** @member {string} xVisualAssignmentSet#name */
    this.name = "";
    /** @member {string} xVisualAssignmentSet#id */
    this.id = "";
    /** @member {xVisualEntity[]} xVisualAssignmentSet#assignments */
    this.assignments = [];
};﻿/**
* @name xVisualAttribute
* @constructor
* @classdesc Visual model describing attribute of the object
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualAttribute(values) {

    /** @member {string} xVisualAttribute#name */
    this.name = "";
    /** @member {string} xVisualAttribute#description */
    this.description = "";
    /** @member {string} xVisualAttribute#value */
    this.value = "";
    /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
    this.propertySet = "";
    /** @member {string} xVisualAttribute#category */
    this.category = "";
    /** @member {xVisualEntity[]} xVisualAttribute#issues */
    this.issues = [];

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
﻿/**
* Visual model containing entity data
* 
* @name xVisualEntity
* @constructor
* @classdesc Visual model containing entity data
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualEntity(values) {
    /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
    this.id = "";
    /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
    this.type = "";
    /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
    this.name = "";
    /** @member {string} xVisualEntity#description - Description extracted from attributes*/
    this.description = "";
    /** @member {xVisualAttribute[]} xVisualEntity#attributes */
    this.attributes = [];
    /** @member {xVisualProperty[]} xVisualEntity#properties */
    this.properties = [];
    /** @member {xVisualEntity[]} xVisualEntity#documents */
    this.documents = [];
    /** @member {xVisualEntity[]} xVisualEntity#issues */
    this.issues = [];
    /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
    this.assignments = [];
    /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
    this.children = []; 
    /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
    this.warranties = []; 

    this.isKey = false; //indicates if this is only a key for the actual entity

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
﻿/**
* Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
* 
* @name xVisualModel
* @constructor
* @classdesc Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualModel(values) {
    /** @member {xVisualEntity[]} xVisualModel#facility - An array of facilities. There is always one faclity but it is convenient to have all
    * members of xVisualModel to be an array so they can be accessed in an uniform way.
    */
    this.facility = [];
    /** @member {xVisualEntity[]} xVisualModel#zones - An array of zones defined in COBie model. They contain spaces as their children. */
    this.zones = [];
    /** @member {xVisualEntity[]} xVisualModel#systems - An array of systems */
    this.systems = [];
    /** @member {xVisualEntity[]} xVisualModel#contacts - An array of all contacts used in the COBie model*/
    this.contacts = [];
    /** @member {xVisualEntity[]} xVisualModel#assetTypes - An array of all asset types. These contain assets as their children */
    this.assetTypes = [];

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};

xVisualModel.prototype.getEntity = function (id) {
    if (typeof (id) == 'undefined' || id == null) return null;
    id = id.toString();

    var get = function (collection, id) {
        for (var i = 0; i < collection.length; i++) {
            var entity = collection[i];
            if (entity.id == id) return entity;
            var result = get(entity.children, id);
            if (result) return result;
        }
        return null;
    };

    for (var i in this) {
        if (typeof (this[i]) == 'function') continue;
        var result = get(this[i], id);
        if (result) return result;
    }
    return null;
};﻿/**
* @name xVisualProperty
* @constructor
* @classdesc Visual model describing property of the object
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualProperty(values) {
    /** @member {string} xVisualProperty#name - name might be translated if you specify a language and culture in {@link xBrowser xBrowser} constructor */
    this.name = "";
    /** @member {string} xVisualProperty#value - string containing eventually units*/
    this.value = "";
    /** @member {string} xVisualProperty#id - original name from COBie before any transformation*/
    this.id = "";

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};

﻿function xVisualTemplates() {
    return {
        property:
'<%if (properties && properties.length > 0) {%>\
<table> \
    <% for (var p in properties) { var prop = properties[p];%> \
    <tr> \
        <td><%=prop.name%></td>\
        <td><%=prop.value%></td>\
    </tr>\
    <%}%>\
</table> \
<%}%>',
        attribute:
'<% if (attributes && attributes.length > 0) {\
    var psets = [];\
    for(var i = 0; i < attributes.length; i++){\
        var attr = attributes[i]; var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
    }\
%>\
<table> \
    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
%>\
<tr><th colspan="2"><%=psetName%></th></tr>\
<%for (var a in pset) { var attr = pset[a];%> \
    <tr title="<%=attr.description%>"> \
        <td><%=attr.name%></td>\
        <td><%=attr.value%></td>\
    </tr>\
    <%}}%>\
</table>\
<%}%>',
        propertyattribute:
'<%if (properties.length > 0 || attributes.length > 0) {%><table> \
    <% for (var p in properties) { var prop = properties[p];%> \
    <tr> \
        <td><%=prop.name%></td>\
        <td><%=prop.value%></td>\
    </tr>\
    <%}%>\
<%}\
if (attributes && attributes.length > 0) {\
    var psets = [];\
    for(var i = 0; i < attributes.length; i++){\
        var attr = attributes[i]; var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
    }\
%>\
    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
%>\
<tr><th colspan="2"><%=psetName%></th></tr>\
<%for (var a in pset) { var attr = pset[a];%> \
    <tr title="<%=attr.description%>"> \
        <td><%=attr.name%></td>\
        <td><%=attr.value%></td>\
    </tr>\
    <%}}%>\
</table>\
<%}%>',
        entity: '<span class="xbim-entity" title="<%=typeof(description) != "undefined" ? description : ""%>"> <%= name? name: (function f() { return type.charAt(0).toUpperCase() + type.slice(1); })() %> </span>',
        contact:
'<% var nameA = properties.filter(function(e){return e.id == "ContactGivenName";})[0]; \
var surnameA = properties.filter(function(e){return e.id == "ContactFamilyName";})[0]; \
var emailA = properties.filter(function(e){return e.id == "ContactEmail";})[0]; \
var name = nameA ? nameA.value : "";\
var surname = surnameA ? surnameA.value : "";\
var email = emailA ? emailA.value : ""; %>\
<span class="xbim-entity" title="<%=email%>"> <%=name%> <%=surname%> <% if (!name && !surname) print("No name"); %> </span>'
    }
};
