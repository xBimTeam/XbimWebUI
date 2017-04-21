var Xbim;
(function (Xbim) {
    var Viewer;
    (function (Viewer) {
        /**
            * Enumeration for object states.
            * @readonly
            * @enum {number}
            */
        var State;
        (function (State) {
            State[State["UNDEFINED"] = 255] = "UNDEFINED";
            State[State["HIDDEN"] = 254] = "HIDDEN";
            State[State["HIGHLIGHTED"] = 253] = "HIGHLIGHTED";
            State[State["XRAYVISIBLE"] = 252] = "XRAYVISIBLE";
            State[State["UNSTYLED"] = 225] = "UNSTYLED";
        })(State = Viewer.State || (Viewer.State = {}));
    })(Viewer = Xbim.Viewer || (Xbim.Viewer = {}));
})(Xbim || (Xbim = {}));
//# sourceMappingURL=xbim-state.js.map