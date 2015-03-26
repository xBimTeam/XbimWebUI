function xVisualTemplates() {
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
        var attr = attributes[i]; if (!attr.propertySet) attr.propertySet = "General"\
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
