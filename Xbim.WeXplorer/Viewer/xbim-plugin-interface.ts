namespace Xbim.Viewer {
    export interface IPlugin {

        onBeforeDraw(): void;
        onAfterDraw(): void;

        onBeforeDrawId(): void;
        onAfterDrawId(): void;

        /**
         * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
         */
        onBeforeGetId(id: number): boolean;

        /**
         * When this function returns true, viewer doesn't use the ID for anything else taking this ID as reserved by the plugin
         */
        onBeforePick(id: number): boolean;
    }
}