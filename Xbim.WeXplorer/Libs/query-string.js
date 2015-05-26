var queryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var qString = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof qString[pair[0]] === "undefined") {
            qString[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof qString[pair[0]] === "string") {
            var arr = [qString[pair[0]], pair[1]];
            qString[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            qString[pair[0]].push(pair[1]);
        }
    }
    return qString;
}();