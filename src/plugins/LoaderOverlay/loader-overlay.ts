import { IPlugin } from "../plugin";
import { Viewer } from "../../viewer";

export class LoaderOverlay implements IPlugin {
    private viewer: Viewer;
    private overlay: HTMLDivElement;

    public init(viewer: Viewer): void {
        this.viewer = viewer;
    }

    public onBeforeDraw(width: number, height: number): void {
    }
    public onAfterDraw(width: number, height: number): void {
    }
    public onBeforeDrawId(): void {
    }
    public onAfterDrawId(): void {
    }
    public onAfterDrawModelId(): void {
    }


    public show(image?: HTMLImageElement) {

        if (this.overlay)
            return;

        // create an overlay
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '1000';
        div.style.overflow = 'hidden';
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';

        // semi-transparent layer
        const over = document.createElement('div');
        over.style.height = '100%';
        over.style.width = '100%';
        over.style.backgroundColor = 'rgb(200,200,200)';
        over.style.opacity = '0.5';
        div.appendChild(over);

        if (image != null) {
            const imageContainer = document.createElement('div');
            imageContainer.style.position = 'absolute';
            imageContainer.style.top = '0';
            imageContainer.style.left = '0';
            imageContainer.style.height = '100%';
            imageContainer.style.width = '100%';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            div.appendChild(imageContainer);

            // blurred image
            image.style.height = '100%';
            image.style.filter = 'blur(15px)';
            imageContainer.appendChild(image);
        }

        // rotating loader
        const loaderContainer = document.createElement('div');
        loaderContainer.style.position = 'absolute';
        loaderContainer.style.top = '0';
        loaderContainer.style.left = '0';
        loaderContainer.style.height = '100%';
        loaderContainer.style.width = '100%';
        loaderContainer.style.display = 'flex';
        loaderContainer.style.alignItems = 'center';
        loaderContainer.style.justifyContent = 'center';

        const loader = document.createElement('div');
        loader.className = 'xbim-viewer-loader';
        loaderContainer.appendChild(loader);
        div.appendChild(loaderContainer);

        this.overlay = div;

        const parent = this.viewer.canvas.parentElement;
        if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
            parent.style.position = 'relative';
        }

        const next = this.viewer.canvas.nextElementSibling;
        if (next != null) {
            parent.insertBefore(div, next);
        } else {
            parent.appendChild(div);
        }
    }

    public hide() {
        if (this.overlay == null) {
            return;
        }

        if (this.overlay.parentElement != null) {
            this.overlay.parentElement.removeChild(this.overlay);
        }

        this.overlay = null;
    }

    /**
     *
     */
    constructor() {
        const style = `
        .xbim-viewer-loader {
            border: 32px solid #eee; /* Light grey */
            border-top: 32px solid #aaa; /* Dark gray */
            border-radius: 50%;
            width: 120px;
            height: 120px;
            animation: xbim-viewer-loader-spin 2s linear infinite;
          }
          
          @keyframes xbim-viewer-loader-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`;
        const element = document.createElement('style');
        element.innerText = style;
        document.body.appendChild(element);
    }

}
