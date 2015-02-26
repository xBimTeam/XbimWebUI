$(document).ready(function () {
    var queryString = function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }();

    function initControls() {

        $('#semantic-descriptive-info').accordion({
            heightStyle: 'fill'
        });

        $('#semantic-tabs').tabs({
            activate: function (event, ui) {
                reinitControls();
            },
            create: function (event, ui) {
                $('#semantic-model').accordion({
                    heightStyle: 'fill'
                });
                $('#requirements').accordion({
                    heightStyle: 'fill'
                });
            }
        });

        $('#btnLocate').button().click(function () {
            var id = $(this).data('id');
            if (typeof (id) != 'undefined' && viewer) {
                viewer.zoomTo(parseInt(id));
            }
        });

        $("#toolbar button").button();

    }
    function reinitControls() {
        $('#semantic-model').accordion('refresh');
        $('#semantic-descriptive-info').accordion('refresh');
        $('#requirements').accordion('refresh');
    }
    initControls();
    $(window).resize(function () {
        reinitControls();
    });

    var keepTarget = false;
    rBrowser = new xBrowser();
    browser = new xBrowser();
    browser.on('loaded', function (args) {
        var facility = args.model.facility;
        //render parts
        browser.renderSpatialStructure('structure', true);
        browser.renderAssetTypes('assetTypes', true);
        browser.renderSystems('systems');
        browser.renderZones('zones');
        browser.renderContacts('contacts');
        browser.renderDocuments(facility[0], 'facility-documents');

        //open and selectfacility node
        $("#structure > ul > li").click();
    });
    rBrowser.on('loaded', function (args) {
        var facility = args.model.facility;
        //render parts
        rBrowser.renderSpatialStructure('r-structure', true);
        rBrowser.renderAssetTypes('r-assetTypes', true);
        rBrowser.renderSystems('r-systems');
        rBrowser.renderZones('r-zones');
        rBrowser.renderContacts('r-contacts');
        rBrowser.renderDocuments(facility[0], 'r-facility-documents');

    });


    function initBrowser(browser) {
        browser.on('entityClick', function (args) {
            var span = $(args.element).children("span.xbim-entity");
            if (document._lastSelection)
                document._lastSelection.removeClass('ui-selected');
            span.addClass('ui-selected')
            document._lastSelection = span;
        });
        browser.on('entityActive', function (args) {
            var isRightPanelClick = false;
            if (args.element) 
                if ($(args.element).parents('#semantic-descriptive-info').length != 0)
                    isRightPanelClick = true;

            //set ID for location button
            $('#btnLocate').data('id', args.entity.id);

            browser.renderPropertiesAttributes(args.entity, 'attrprop');
            browser.renderAssignments(args.entity, 'assignments');
            browser.renderDocuments(args.entity, 'documents');
            browser.renderIssues(args.entity, 'issues');

            if (isRightPanelClick)
                $('#attrprop-header').click();

        });
    }

    initBrowser(browser);
    initBrowser(rBrowser);

    browser.on('entityDblclick', function (args) {
        var entity = args.entity;
        var allowedTypes = ['space', 'assettype', 'asset'];
        if (allowedTypes.indexOf(entity.type) == -1) return;

        var id = parseInt(entity.id);
        if (id && viewer) {
            viewer.resetStates();
            viewer.renderingMode = 'x-ray';
            if (entity.type == 'assettype') {
                var ids = [];
                for (var i = 0; i < entity.children.length; i++) {
                    id = parseInt(entity.children[i].id);
                    ids.push(id);
                }
                viewer.setState(xState.HIGHLIGHTED, ids);
            }
            else {
                viewer.setState(xState.HIGHLIGHTED, [id]);
            }
            viewer.zoomTo(id);
            keepTarget = true;
        }
    });

    var model = queryString.model ? queryString.model : 'lakeside';
    switch (model) {
        case 'lakeside':
            model = 'Data/LakesideRestaurant.json';
            break;
        case 'cobie':
            model = 'tests/data/COBieFacility.json';
            break;
        case 'dpow':
            model = 'Data/NewtownHighSchool.COBieLite.json';
            break;
        default:

    }

    browser.load(model);
    rBrowser.load('Data/NewtownHighSchool.COBieLite.json');


    //viewer set up
    var check = xViewer.check();
    viewer = null;
    if (check.noErrors) {
        //alert('WebGL support is OK');
        viewer = new xViewer('viewer-canvas');
        viewer.background = [249, 249, 249, 255];
        viewer.on('mouseDown', function (args) {
            if (!keepTarget) viewer.setCameraTarget(args.id);
        });
        viewer.on('pick', function (args) {
            browser.activateEntity(args.id);
            viewer.renderingMode = 'normal';
            viewer.resetStates();
            keepTarget = false;
        });
        viewer.on('dblclick', function (args) {
            viewer.resetStates();
            viewer.renderingMode = 'x-ray';
            var id = args.id;
            viewer.setState(xState.HIGHLIGHTED, [id]);
            viewer.zoomTo(id);
            keepTarget = true;
        });
        //viewer.load('Data/Duplex_MEP_20110907_SRL.wexbim');
        viewer.load('Data/LakesideRestaurant.wexbim');
        viewer.start();
    }
    else {
        alert('WebGL support is unsufficient');
        var msg = document.getElementById('msg');
        msg.innerHTML = '';
        for (var i in check.errors) {
            var error = check.errors[i];
            msg.innerHTML += "<div style='color: red;'>" + error + "</div>";
        }
    }
});