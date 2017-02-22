declare namespace Xbim.Viewer {
    interface IPlugin {
        onAfterDraw(): void;
        onAfterDrawId(): void;
        onBeforeDraw(): void;
        onBeforeDrawId(): void;
        onBeforeGetId(id: number): boolean;
        onBeforePick(id: number): boolean;
    }
}
