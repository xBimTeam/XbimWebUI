function xVisualTemplates() {
    return {
        property:
'<table> \
    <tr> \
        <th>Name</th>\
        <th>Value</th>\
    </tr>\
    <% for (var p in properties) { var prop = properties[p];%> \
    <tr> \
        <td><%=prop.name%></td>\
        <td><%=prop.value%></td>\
    </tr>\
    <%}%>\
</table>',
        attribute:
'<table> \
    <tr> \
        <th>Name</th>\
        <th>Value</th>\
        <th>Property Set</th>\
    </tr>\
    <% for (var a in attributes) { var attr = attributes[a];%> \
    <tr title="<%=attr.description%>"> \
        <td><%=attr.name%></td>\
        <td><%=attr.value%></td>\
        <td><%=attr.propertySet%></td>\
    </tr>\
    <%}%>\
</table>',
        spatialElement: '<span title="<%=description%>"> <%=name%> </span>',
        entity: '<span title="<%=description%>"> <%=name%> </span>',
    }
};
