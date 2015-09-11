

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
function xBrowser(lang, culture) {
    this._model = new xVisualModel();
    this._events = [];
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
* Use this function to load data from JSON representation of COBieLite. Listen to {@link xBrowser#event:loaded loaded} event to start
* using the browser.
* @function xBrowser#load
* @param {string|File|Blob} source - path to JSON data or File or Blob object to be used to load the data from
* @fires xBrowser#loaded
*/
xBrowser.prototype.load = function (source) {
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
            self._fire('loaded', { model: self._model});
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
    var index = callbacks.indexOf(callback);
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
    //call the callbacks
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

    //this of for attributes prior to serialization enhancements
    if (typeof (value.Item) !== "undefined") value = value.Item;

    //this is for different kinds of attributes using latest serializer implementation
    if (typeof (value.AttributeBooleanValue) !== "undefined") value = value.AttributeBooleanValue;
    if (typeof (value.AttributeDateValue) !== "undefined") value = value.AttributeDateValue;
    if (typeof (value.AttributeDateTimeValue) !== "undefined") value = value.AttributeDateTimeValue;
    if (typeof (value.AttributeDecimalValue) !== "undefined") value = value.AttributeDecimalValue;
    if (typeof (value.AttributeIntegerValue) !== "undefined") value = value.AttributeIntegerValue;
    if (typeof (value.AttributeMonetaryValue) !== "undefined") value = value.AttributeMonetaryValue;
    if (typeof (value.AttributeStringValue) !== "undefined") value = value.AttributeStringValue;
    if (typeof (value.AttributeTimeValue) !== "undefined") value = value.AttributeTimeValue;


    var baseVal = "";
    if (typeof (value) == 'string') baseVal = value;
    if (typeof(value.BooleanValue) !==  "undefined") baseVal = value.BooleanValue ? tr('True') : tr('False');
    if (typeof(value.StringValue)  !==  "undefined") baseVal = value.StringValue;
    if (typeof (value.DecimalValue) !== 'undefined') baseVal = value.DecimalValue.toFixed(this.settings.decimalPlaces).toString();
    if (typeof (value.IntegerValue) !== 'undefined') baseVal = value.IntegerValue.toString();

    if (value.UnitName) baseVal += ' ' + value.UnitName;

    return baseVal.length > 0 ? baseVal : '';
};

xCobieUtils.prototype.getTranslator = function () {
    var self = this;
    return function (term) {
        return self._dictionary[term] ? self._dictionary[term] : term.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    };
};﻿function xCobieUkUtils(lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
    this._contacts = [];
};

xCobieUkUtils.prototype.settings = {
    decimalPlaces: 4
};

xCobieUkUtils.prototype.getVisualEntity = function (entity, type) {
    if (!entity || !type) throw 'entity must be defined';
    return new xVisualEntity({
        id: entity.ExternalId,
        type: type,
        name: this.getValidationStatus(entity) + entity.Name, //prepend validation status. This will make it easier for later.
        description: entity.Description,
        attributes: this.getAttributes(entity),
        properties: this.getProperties(entity),
        assignments: this.getAssignments(entity, type),
        documents: this.getDocuments(entity, type),
        issues: this.getIssues(entity)
    });
};

xCobieUkUtils.prototype.getValidationStatus = function (entity) {
    if (entity.Categories == null) return "";

    for (var i = 0; i < entity.Categories.length; i++) {
        var category = entity.Categories[i];
        if (typeof (category.Code) !== "undefined" && category.Code.toLowerCase() === "failed")
            return "[F] ";
        if (typeof (category.Code) !== "undefined" && category.Code.toLowerCase() === "passed")
            return "[T] ";
    }
    return "";
};

xCobieUkUtils.prototype.getVisualModel = function (data) {
    if (!data) throw 'data must be defined';

    //contacts are used very often as a references in assignments
    //so it is good to have them in the wide scope for processing
    this._contacts = this.getContacts(data);

    var types = this.getAssetTypes(data);
    //this will also add assets to spaces where they should be
    var facility = this.getSpatialStructure(data, types);
    return new xVisualModel({
        facility: facility,
        zones: this.getZones(data, facility),
        systems: this.getSystems(data, types),
        assetTypes: types,
        contacts: this._contacts
    });
};

xCobieUkUtils.prototype.getContacts = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var contacts = data.Contacts;
    if (!contacts) return result;

    for (var i = 0; i < contacts.length; i++) {
        var vContact = this.getVisualEntity(contacts[i], 'contact');
        result.push(vContact);
    }

    return result;
};

xCobieUkUtils.prototype.getSpatialStructure = function (data, types) {
    if (!data) throw 'data must be defined';
    if (!types) throw 'types must be defined';

    var facility = this.getVisualEntity(data, 'facility');

    var floors = data.Floors;
    if (!floors || floors.length == 0)
        return [facility];

    for (var i in floors) {
        var floor = floors[i];
        var vFloor = this.getVisualEntity(floor, 'floor');
        facility.children.push(vFloor);

        var spaces = floor.Spaces;
        if (!spaces) continue;

        for (var s in spaces) {
            var space = spaces[s];
            var vSpace = this.getVisualEntity(space, 'space');
            vFloor.children.push(vSpace);
        }
    }

    //add asset types and assets to spaces 
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'Space' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            var spaceProp = key.properties.filter(function (e) { return e.id == 'Name' })[0];
            if (!spaceProp) continue;

            var spaceName = spaceProp.value.split(",")[0];

            for (var j = 0; j < facility.children.length; j++) {
                var floor = facility.children[j];

                var space = floor.children.filter(function (e) { return e.name == spaceName })[0];
                if (!space) continue;

                space.children.push(instance);
                assignmentSet.assignments[0] = space;
                break;;
            }


        }
    }

    //facility is a root element of the tree spatial structure
    return [facility];
};

xCobieUkUtils.prototype.getZones = function (data, facility) {
    if (!data) throw 'data must be defined';
    if (!facility) throw 'data must be defined';
    var result = [];

    var zones = data.Zones;
    if (!zones) return result;

    for (var z in zones) {
        var zone = zones[z];
        var vZone = this.getVisualEntity(zone, 'zone');
        result.push(vZone);

        //add spaces as a children
        var keys = zone.Spaces;
        if (!keys || keys.length == 0) continue;

        for (var ki in keys) {
            var key = keys[ki];
            for (var i = 0; i < facility.length; i++) { //facilities (always 1)
                var f = facility[i];
                for (var j = 0; j < f.children.length; j++) { //floors
                    var floor = f.children[j];
                    for (var k = 0; k < floor.children.length; k++) { //spaces
                        var space = floor.children[k];
                        if (space.name != key.Name) continue;

                        //add space as a children
                        vZone.children.push(space);
                        //add zone to space as an assignment
                        var assignmentSet = space.assignments.filter(function (e) { return e.id == 'Zone'; })[0];
                        if (!assignmentSet) {
                            assignmentSet = new xVisualAssignmentSet();
                            assignmentSet.id = "Zone";
                            assignmentSet.name = "Zones";
                            space.assignments.push(assignmentSet);
                        }
                        assignmentSet.assignments.push(vZone);
                    }
                }
            }
        }
    }

    return result;
};

xCobieUkUtils.prototype.getSystems = function (data, types) {
    if (!data) throw 'data must be defined';
    if (!types) throw 'types must be defined';
    var result = [];

    var systems = data.Systems;
    if (!systems) return result;

    var instances = [];
    for (var k = 0; k < types.length; k++) {
        var type = types[k];
        for (var c in type.children) {
            instances.push(type.children[c]);
        }
    }

    for (var s in systems) {
        var system = systems[s];
        var vSystem = this.getVisualEntity(system, 'system');
        result.push(vSystem);

        //add assets to systems 
        var componentKeys = system.Components;
        for (var j = 0; j < componentKeys.length; j++) {
            var key = componentKeys[j];
            var candidates = instances.filter(function (e) { return e.name == key.Name; });
            if (!candidates) continue;
            var instance = candidates[0];
            if(!instance) continue;

            //add asset to system
            vSystem.children.push(instance);
            //add system to asset assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'System'; })[0];
            if (!assignmentSet) {
                assignmentSet = new xVisualAssignmentSet();
                assignmentSet.id = "System";
                assignmentSet.Name = "Systems";
                instance.assignments.push(assignmentSet);
            }
            assignmentSet.assignments.push(vSystem);
        }
    }
    return result;
};

xCobieUkUtils.prototype.getAssetTypes = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var tr = this.getTranslator();

    var types = data.AssetTypes;
    if (!types) return result;

    for (var t in types) {
        var type = types[t];
        var vType = this.getVisualEntity(type, 'assettype');
        result.push(vType);

        //process instances of type
        var instances = type.Assets;
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

xCobieUkUtils.prototype.getProperties = function (entity) {
    if (!entity) throw 'entity must be defined';
    var tr = this.getTranslator();
    var result = [];

    for (var a in entity) {
        var attr = entity[a];
        var valStr = this.getValueString(attr);
        if (valStr) {
            var nameStr = tr(a);
            result.push(new xVisualProperty({ name: nameStr, value: valStr, id: a }));
        }
    }
    var catProperties = this.getCategoryProperties(entity);
    for (var i = 0; i < catProperties.length; i++) {
        result.push(catProperties[i]);
    }

    return result;
};

xCobieUkUtils.prototype.getCategoryProperties = function (entity) {
    var cats = entity.Categories;
    if (!cats) return [];

    var result = [];
    for (var i = 0; i < cats.length; i++) {
        var cat = cats[i];
        var valStr = cat.Code + cat.Description ? ": " + cat.Description : "";
        result.push(new xVisualProperty({ name: cat.Classification || "Free category", value: valStr, id: i }));
    }
    return [];
};

xCobieUkUtils.prototype.getAttributes = function (entity) {
    if (!entity) throw 'entity must be defined';

    var result = [];
    var attributes = entity.Attributes;
    if (!attributes) return result;

    for (var a in attributes) {
        var attribute = attributes[a];

        result.push(new xVisualAttribute({
            name: attribute.Name,
            description: attribute.Description,
            value: this.getValueString(attribute),
            propertySet: attribute.ExternalEntity,
            categories: this.getCategoryProperties(attribute),
            issues: attribute.Issues ? this.getIssues({ Issues: attribute.Issues }) : []
        }));
    }
    return result;
};

xCobieUkUtils.prototype.getAssignments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var tr = this.getTranslator();
    var result = [];

    //assignment can either be an array of keys or a single embeded object
    for (var attrName in entity) {
        if (!entity.hasOwnProperty(attrName)) continue;
        var assignmentSet = new xVisualAssignmentSet();
        var attr = entity[attrName];

        //set of assignments (keys)
        if (attr instanceof Array && attr.length > 0 && typeof (attr[0].KeyType) !== "undefined") {
            assignmentSet.id = attr[0].KeyType;
            assignmentSet.name = tr(attrName);
            for (var i = 0; i < attr.length; i++) {
                //if it is a contact than add a contact if available
                if (attr[i].KeyType === "Contact") {
                    var contact = this.findContact(attr.Email);
                    if (contact) {
                        assignmentSet.assignments.push(contact);
                        continue;
                    }
                }

                var vAssignment = this.getVisualEntity(attr[i], attr[i].KeyType.toLowerCase());
                vAssignment.isKey = true;
                assignmentSet.assignments.push(vAssignment);
            }
            result.push(assignmentSet);
            continue;
        }

        //single key assignment
        if (typeof (attr.KeyType) !== "undefined") {
            assignmentSet.id = attr.KeyType;
            assignmentSet.name = tr(attrName);

            //add a contact if it is defined
            if (attr.KeyType === "Contact" && this._contacts) {
                var contact = this.findContact(attr.Email);
                if (contact) {
                    assignmentSet.assignments.push(contact);
                    result.push(assignmentSet);
                    continue;
                }
            }

            var vEntity = this.getVisualEntity(attr, attr.KeyType.toLowerCase());
            assignmentSet.assignments.push(vEntity);
            result.push(assignmentSet);
            continue;
        }

        //cope with objects that encapsulate set of information (like a warranty, site, space and eventually others)
        if (!(attr instanceof Array) && (attr instanceof Object)) {
            assignmentSet.id = attr.KeyType;
            assignmentSet.name = tr(attrName);
            var vEntity = this.getVisualEntity(attr, "inner");
            assignmentSet.assignments.push(vEntity);
            result.push(assignmentSet);
            continue;
        }
    }

    return result;
};

xCobieUkUtils.prototype.findContact = function (email) {
    for (var i = 0; i < this._contacts.length; i++) {
        var contact = this._contacts[i];
        var emailProp = contact.properties.filter(function (e) { return e.name === "Email"; })[0]
        if (emailProp && emailProp.value === email)
            return contact;
    }
};

xCobieUkUtils.prototype.getDocuments = function (entity, type) {
    if (!entity || !type) throw 'entity and type must be defined';
    var result = [];

    var documents = entity.Documents
    if (!documents) return result;
    for (var i = 0; i < documents.length; i++) {
        var doc = documents[i]
        var vDoc = this.getVisualEntity(doc, 'document')
        result.push(vDoc);
    }

    return result;
};

xCobieUkUtils.prototype.getIssues = function (entity) {
    if (!entity) throw 'entity and type must be defined';
    var result = [];

    var issues = entity.Issues
    if (!issues) return result;

    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i]
        var vIssue = this.getVisualEntity(issue, 'issue')
        result.push(vIssue);
    }

    return result;
};

xCobieUkUtils.prototype.setLanguage = function (lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
};

xCobieUkUtils.prototype.getValueString = function (value) {
    if (typeof (value) == 'undefined' || value == null)
        return '';

    var units = value.Unit || "";

    //this is for different kinds of attributes using latest serializer implementation
    if (typeof (value.StringAttributeValue) !== "undefined") return value.StringAttributeValue.Value || "";
    if (typeof (value.BooleanAttributeValue) !== "undefined") return value.BooleanAttributeValue.Value || "";
    if (typeof (value.DateTimeAttributeValue) !== "undefined") return value.DateTimeAttributeValue.Value || "";
    if (typeof (value.DecimalAttributeValue) !== "undefined") {
        var number = value.DecimalAttributeValue.Value;
        if (number) {
            number = number.toFixed(this.settings.decimalPlaces);
            return number.toString() + " " + units;
        }
        return "";
    }
    if (typeof (value.IntegerAttributeValue) !== "undefined") {
        var number = value.IntegerAttributeValue.Value;
        if (number) {
            return number.toString() + " " + units;
        }
        return "";
    }

    //return null for arrays and objects (which are both 'object')
    if (typeof (value) == 'object')
        return null;

    return value;
};

xCobieUkUtils.prototype.getTranslator = function () {
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
        var attr = attributes[i]; if (!attr.propertySet) attr.propertySet = "General";\
        var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
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
'<% var nameA = properties.filter(function(e){return e.id == "ContactGivenName";})[0] || properties.filter(function(e){return e.id == "GivenName";})[0]; \
var surnameA = properties.filter(function(e){return e.id == "ContactFamilyName";})[0] || properties.filter(function(e){return e.id == "FamilyName";})[0]; \
var emailA = properties.filter(function(e){return e.id == "ContactEmail";})[0] || properties.filter(function(e){return e.id == "Email";})[0]; \
var name = nameA ? nameA.value : "";\
var surname = surnameA ? surnameA.value : "";\
var email = emailA ? emailA.value : ""; %>\
<span class="xbim-entity" title="<%=email%>"> <%=name%> <%=surname%> <% if (!name && !surname) print("No name"); %> </span>'
    }
};
/*
* This file has been generated by spacker.exe utility. Do not change this file manualy as your changes
* will get lost when the file is regenerated. Original content is located in *.c files.
*/
if (!window.xShaders) window.xShaders = {}
xShaders.cube_fshader = " precision mediump float; uniform float uAlpha; uniform sampler2D uTexture; uniform bool uColorCoding; varying vec2 vTexCoord; varying vec4 vIdColor; void main(void) { if (uColorCoding) { gl_FragColor = vIdColor; } else { vec4 pixel = texture2D(uTexture, vTexCoord); if (vIdColor.x < 0.0) { gl_FragColor = vec4(pixel.rgb, uAlpha); } else { gl_FragColor = vec4(pixel.rgb * 0.7, uAlpha); } } }";
xShaders.cube_vshader = " attribute highp vec3 aVertex; attribute highp vec2 aTexCoord; attribute highp float aId; uniform mat3 uRotation; uniform mat4 uPMatrix; uniform bool uColorCoding; uniform float uSelection; varying vec2 vTexCoord; varying vec4 vIdColor; vec4 getIdColor(float id){ float product = floor(id + 0.5); float B = floor(product / (256.0*256.0)); float G = floor((product - B * 256.0*256.0) / 256.0); float R = mod(product, 256.0); return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0); } void main(void) { vec4 point = vec4(uRotation * aVertex, 1.0); gl_Position = uPMatrix * point; vTexCoord = aTexCoord; if (uColorCoding) { vIdColor = getIdColor(aId); return; } bool isSelected = abs(uSelection - aId) < 0.1; if (isSelected){ vIdColor = vec4(-1.0, -1.0, -1.0, -1.0); } else{ vIdColor = vec4(1.0, 1.0, 1.0, 1.0); } }";
﻿xCubeTextures = {
    en: "data:image/png;base64,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",
    cs: "data:image/png;base64,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"
};﻿
function xNavigationCube(locale) {
    this.TOP = 1600000;
    this.BOTTOM = 1600001;
    this.LEFT = 1600002;
    this.RIGHT = 1600003;
    this.FRONT = 1600004;
    this.BACK = 1600005;

    this._initialized = false;

    this.locale = typeof (locale) !== "undefined" ? locale : "en";
    if (typeof (xCubeTextures[this.locale]) === "undefined")
        throw new Error("Locale " + this.locale + " doesn't exist");
}

xNavigationCube.prototype.init = function (xviewer) {
    var self = this;
    this.viewer = xviewer;
    this.ratio = 0.1;
    var gl = this.viewer._gl;

    //create own shader 
    this._shader = null;
    this._initShader();

    this.alpha = 1.0;
    this.selection = 0.0;

    //set own shader for init
    gl.useProgram(this._shader);

    //create uniform and attribute pointers
    this._pMatrixUniformPointer = gl.getUniformLocation(this._shader, "uPMatrix");
    this._rotationUniformPointer = gl.getUniformLocation(this._shader, "uRotation");
    this._colourCodingUniformPointer = gl.getUniformLocation(this._shader, "uColorCoding");
    this._alphaUniformPointer = gl.getUniformLocation(this._shader, "uAlpha");
    this._selectionUniformPointer = gl.getUniformLocation(this._shader, "uSelection");
    this._textureUniformPointer = gl.getUniformLocation(this._shader, "uTexture");

    this._vertexAttrPointer = gl.getAttribLocation(this._shader, "aVertex"),
    this._texCoordAttrPointer = gl.getAttribLocation(this._shader, "aTexCoord"),
    this._idAttrPointer = gl.getAttribLocation(this._shader, "aId"),
    gl.enableVertexAttribArray(this._vertexAttrPointer);
    gl.enableVertexAttribArray(this._texCoordAttrPointer);
    gl.enableVertexAttribArray(this._idAttrPointer);

    //feed data into the GPU and keep pointers
    this._indexBuffer = gl.createBuffer();
    this._vertexBuffer = gl.createBuffer();
    this._texCoordBuffer = gl.createBuffer();
    this._idBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.txtCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.ids(), gl.STATIC_DRAW);

    //create texture
    var txtData = xCubeTextures[this.locale];
    var txtImage = new Image();
    txtImage.src = txtData;
    this._texture = gl.createTexture();

    //load image texture into GPU
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, txtImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);


    //reset original shader program 
    gl.useProgram(this.viewer._shaderProgram);

    xviewer._canvas.addEventListener('mousemove', function (event) {
        startX = event.clientX;
        startY = event.clientY;

        //get coordinates within canvas (with the right orientation)
        var r = xviewer._canvas.getBoundingClientRect();
        var viewX = startX - r.left;
        var viewY = xviewer._height - (startY - r.top);

        //this is for picking
        var id = xviewer._getID(viewX, viewY);

        if (id >= self.TOP && id <= self.BACK) {
            self.alpha = 1.0;
            self.selection = id;
        } else {
            self.alpha = 0.6;
        }
    }, true);

    this._initialized = true;

}

xNavigationCube.prototype.onBeforeDraw = function () { };

xNavigationCube.prototype.onBeforePick = function (id) {
    if (id >= this.TOP && id <= this.BACK) {
        switch (id) {
            case this.TOP:
                this.viewer.show('top');
                return true;
            case this.BOTTOM:
                this.viewer.show('bottom');
                return true;
            case this.LEFT:
                this.viewer.show('left');
                return true;
            case this.RIGHT:
                this.viewer.show('right');
                return true;
            case this.FRONT:
                this.viewer.show('front');
                return true;
            case this.BACK:
                this.viewer.show('back');
                return true;
            default:
                return false;
        }
    }
};

xNavigationCube.prototype.onAfterDraw = function() {
    var gl = this.setActive();
    //set uniform for colour coding to false
    gl.uniform1i(this._colourCodingUniformPointer, 0);
    this.draw();
    this.setInactive();
};

xNavigationCube.prototype.onBeforeDrawId = function () { };

xNavigationCube.prototype.onAfterDrawId = function () {
    var gl = this.setActive();
    //set uniform for colour coding to false
    gl.uniform1i(this._colourCodingUniformPointer, 1);
    this.draw();
    this.setInactive();
};

xNavigationCube.prototype.onBeforeGetId = function(id) { }

xNavigationCube.prototype.setActive = function() {
    var gl = this.viewer._gl;
    //set own shader
    gl.useProgram(this._shader);

    return gl;
};

xNavigationCube.prototype.setInactive = function () {
    var gl = this.viewer._gl;
    //set viewer shader
    gl.useProgram(this.viewer._shaderProgram);
};

xNavigationCube.prototype.draw = function () {
    if (!this._initialized) return;

    var gl = this.viewer._gl;

    //set navigation data from xViewer to this shader
    var pMatrix = mat4.create();
    var height = 1.0 / this.ratio;
    var width = height / this.viewer._height * this.viewer._width;

    //create orthogonal projection matrix
    mat4.ortho(pMatrix,
        (this.ratio - 1.0) * width, //left
        this.ratio * width, //right
        this.ratio * -1.0 * height, //bottom
        (1.0 - this.ratio) * height,  //top
        -1,  //near
        1 ); //far

    //extract just a rotation from model-view matrix
    var rotation = mat3.fromMat4(mat3.create(), this.viewer._mvMatrix);
    gl.uniformMatrix4fv(this._pMatrixUniformPointer, false, pMatrix);
    gl.uniformMatrix3fv(this._rotationUniformPointer, false, rotation);
    gl.uniform1f(this._alphaUniformPointer, this.alpha);
    gl.uniform1f(this._selectionUniformPointer, this.selection);

    //bind data buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.vertexAttribPointer(this._vertexAttrPointer, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
    gl.vertexAttribPointer(this._idAttrPointer, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer);
    gl.vertexAttribPointer(this._texCoordAttrPointer, 2, gl.FLOAT, false, 0, 0);

    //bind texture
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform1i(this._textureUniformPointer, 1);

    var cfEnabled = gl.getParameter(gl.CULL_FACE);
    if (!cfEnabled) gl.enable(gl.CULL_FACE);

    //draw the cube as an element array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    if (!cfEnabled) gl.disable(gl.CULL_FACE);

};

xNavigationCube.prototype._initShader = function () {

    var gl = this.viewer._gl;
    var viewer = this.viewer;
    var compile = function (shader, code) {
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            viewer._error(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    //fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    compile(fragmentShader, xShaders.cube_fshader);

    //vertex shader (the more complicated one)
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    compile(vertexShader, xShaders.cube_vshader);

    //link program
    this._shader = gl.createProgram();
    gl.attachShader(this._shader, vertexShader);
    gl.attachShader(this._shader, fragmentShader);
    gl.linkProgram(this._shader);

    if (!gl.getProgramParameter(this._shader, gl.LINK_STATUS)) {
        viewer._error('Could not initialise shaders for a navigation cube plugin');
    }
};


xNavigationCube.prototype.vertices = new Float32Array([
      // Front face
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5, -0.5, 0.5, 
      -0.5, -0.5, 0.5, 

      // Back face
      -0.5, 0.5, -0.5, 
      -0.5, 0.5, 0.5,  
       0.5, 0.5, 0.5,  
       0.5, 0.5, -0.5, 

      
      // Top face
      -0.5, -0.5, 0.5, 
       0.5, -0.5, 0.5, 
       0.5, 0.5, 0.5,  
      -0.5, 0.5, 0.5,  

      // Bottom face
      -0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5, 
       0.5, 0.5, -0.5, 
       0.5, -0.5, -0.5,

      // Right face
       0.5, -0.5, -0.5,
       0.5, 0.5, -0.5, 
       0.5, 0.5, 0.5,  
       0.5, -0.5, 0.5, 

      // Left face
      -0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5, 
      -0.5, 0.5, 0.5,  
      -0.5, 0.5, -0.5  
]);

xNavigationCube.prototype.indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // Front face
    4, 5, 6, 4, 6, 7, // Back face
    8, 9, 10, 8, 10, 11, // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23 // Left face
]);

xNavigationCube.prototype.txtCoords = new Float32Array([
      // Front face
      1.0/3.0, 1.0/3.0,
      2*1.0/3.0, 1.0/3.0,
      2*1.0/3.0, 2*1.0/3.0,
      1.0/3.0, 2*1.0/3.0,

      // Back face
      1.0, 1.0/3.0,
      1.0, 2*1.0/3.0,
      2*1.0/3.0, 2*1.0/3.0,
      2*1.0/3.0, 1.0/3.0,

      
      // Top face
      2*1.0/3.0, 2*1.0/3.0,
      1.0, 2*1.0/3.0,
      1.0, 1.0,
      2*1.0/3.0, 1.0,

      // Bottom face
      0.0, 2*1.0/3.0,
      0.0, 1.0/3.0,
      1.0/3.0, 1.0/3.0,
      1.0/3.0, 2*1.0/3.0,

      // Right face
      0.0, 2*1.0/3.0,
      1.0/3.0, 2*1.0/3.0,
      1.0/3.0, 1.0,
      0.0, 1.0,

      // Left face
      2*1.0/3.0, 2*1.0/3.0,
      2*1.0/3.0, 1.0,
      1.0/3.0, 1.0,
      1.0/3.0, 2*1.0/3.0
]);

xNavigationCube.prototype.ids = function() {
    return new Float32Array([
        this.FRONT, // Front face
        this.FRONT,
        this.FRONT,
        this.FRONT,
        this.BACK, // Back face
        this.BACK,
        this.BACK,
        this.BACK,
        this.TOP, // Top face
        this.TOP,
        this.TOP,
        this.TOP,
        this.BOTTOM, // Bottom face
        this.BOTTOM,
        this.BOTTOM,
        this.BOTTOM,
        this.RIGHT, // Right face
        this.RIGHT,
        this.RIGHT,
        this.RIGHT,
        this.LEFT, // Left face
        this.LEFT,
        this.LEFT,
        this.LEFT
    ]);
};
