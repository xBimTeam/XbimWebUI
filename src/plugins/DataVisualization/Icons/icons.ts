import { Viewer } from "../../../viewer";
import { IPlugin } from "../../plugin";
import { Icon } from "./icon";
import { vec3 } from "gl-matrix";
import { IconData } from "./icons-data";

export class Icons implements IPlugin {
    private _viewer: Viewer;
    private _icons: HTMLDivElement;
    private _floatdetails: HTMLDivElement;
    private _floatTitle: HTMLDivElement;
    private _floatBody: HTMLDivElement;
    private _instances : { [id: number] : Icon} = {}
    private _selectedIcon: Icon | undefined;
    private _iconsCount = 0;

    init(viewer: Viewer): void {
        this._viewer = viewer;
        this.addStyles();
        const iconsDiv = document.createElement('div');
        iconsDiv.id = 'icons';
        this._icons = iconsDiv;

        const floatdetailsDiv = document.createElement('div');
        floatdetailsDiv.id = 'floatdetails'; 
        
        const floatHeader = document.createElement('div');
        floatHeader.id = 'floatHeader'; 
 
        const floatTitle = document.createElement('div');
        floatTitle.id = 'floatTitle'; 

        floatHeader.appendChild(floatTitle);
        
        const closeBtn = document.createElement('btn');
        closeBtn.id = 'floatCloseBtn'
        closeBtn.addEventListener("click", this.closeFloatingBox.bind(this), false);

        floatHeader.appendChild(closeBtn);

        const floatBody = document.createElement('div');
        floatBody.id = 'floatBody';
        this._floatTitle = floatTitle;
        this._floatBody = floatBody;

        floatdetailsDiv.appendChild(floatHeader);
        floatdetailsDiv.appendChild(floatBody);
        this._floatdetails = floatdetailsDiv;

        iconsDiv.appendChild(floatdetailsDiv);

        const parent = this._viewer.canvas.parentElement;
        if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
            parent.style.position = 'relative';
        }

        const parentOfParent = parent.parentElement;
        if (parentOfParent != null) {
            parentOfParent.appendChild(iconsDiv);
        } else {
            parent.appendChild(iconsDiv);
        }

        viewer.on('loaded', args => {
            try {
                window.requestAnimationFrame(() => this.render());
            } catch (e) {
            }
        });

    }

    public addIcon(icon: Icon){
        const id = this.getId(icon);
        const iconElement = document.createElement('div');
        const image = document.createElement('img');
        image.classList.add('icon-image')
        image.addEventListener("click", this.onIconClicked.bind(this), false);
        if(!icon.imageData){
            icon.imageData = IconData.defaultIcon;
        }
        const encodedUriPrefix = 'data:image/png;base64,';
        if(!icon.imageData.startsWith(encodedUriPrefix)){
            image.src = encodedUriPrefix + icon.imageData;
        }
        image.id = id.toString();
        image.height = icon.height ?? IconData.defaultIconHeight;
        image.width = icon.width ?? IconData.defaultIconWidth;
        if(!icon.location) {
            const bb : Float32Array = this._viewer.getProductBoundingBox(icon.productId, icon.modelId);
            const wcs = this._viewer.getCurrentWcs();
            const xyz = [bb[0] - wcs[0] + (bb[3] / 2), bb[1] - wcs[1]  + (bb[4] / 2), bb[2] - wcs[2]  + (bb[5] / 2)];
            icon.location = new Float32Array(xyz);
        }
        this._instances[id] = icon;
        iconElement.id = "icon" + id;
        iconElement.title = `Product ${icon.productId}, Model ${icon.modelId}`;
        iconElement.appendChild(image);
        this._icons.appendChild(iconElement);
        this._iconsCount++;
    }

    private onIconClicked(ev: PointerEvent ){
        ev.stopPropagation();
        const icon: Icon = this._instances[(ev.target as Element).id];
        if(!icon) return;
        if(this._selectedIcon && icon && icon === this._selectedIcon)
        {
            this._selectedIcon = null;
            return;
        }
        if(icon.onIconSelected) icon.onIconSelected(); 
        this._selectedIcon = icon;
    }

    private closeFloatingBox(){
        this._selectedIcon = null;
    }

    private render() {
        const canvas = document.getElementById('viewer');
        const iconheight = 32;
        const iconwidth = 32;
        
        if(this._icons) {
    
            // Keep annotation layer in sync with canvas
            this._icons.style.width = canvas.clientWidth + 'px';
            this._icons.style.height = canvas.clientHeight + 'px';
    
            Object.getOwnPropertyNames(this._instances).forEach(k => {
                let iconLabel = document.getElementById('icon' + k);
                const icon: Icon = this._instances[k];
                if(iconLabel && icon && icon.location){
    
                    const position = this._viewer.getHtmlCoordinatesOfVector(icon.location);
                    if(position.length == 2) {

                        const posLeft = (position[0]- iconwidth);
                        const posTop =(position[1] - iconheight);
                        iconLabel.style.position = 'absolute';
                        iconLabel.style.display = 'block';
                        iconLabel.style.left = posLeft + 'px';
                        iconLabel.style.top = posTop + 'px';
                    }

                } else {
                    if(iconLabel)
                        iconLabel.style.display = 'none';
                }
            });

            if(this._selectedIcon) {
                const position = this._viewer.getHtmlCoordinatesOfVector(this._selectedIcon.location);
                if(position.length == 2) {
                    this._floatTitle.textContent = this._selectedIcon.name;
                    this._floatBody.textContent = this._selectedIcon.description;
                    const posLeft = (position[0]) +(-this._floatdetails.clientWidth / 2) + 10;
                    const posTop =(position[1]) - (this._floatdetails.clientHeight + 48);
                    this._floatdetails.style.left = posLeft + 'px';
                    this._floatdetails.style.top = posTop + 'px';
                    this._floatdetails.style.display = 'block';
                } 
            } else {
                    this._floatdetails.style.display = 'none';
            }
        }
        
        window.requestAnimationFrame(() => this.render());
    }

    private addStyles() { 
        const element = document.createElement('style');
        element.textContent = IconData.styles;
        document.body.appendChild(element);
    }
      
    private getId(icon: Icon): number {
        return this.cantorPairing(this.cantorPairing(icon.productId, icon.modelId), this._iconsCount);
    }
    
    private cantorPairing(x: number, y: number): number {
        return (x + y) * (x + y + 1) / 2 + y;
    }

    onBeforeDraw(width: number, height: number): void {
    }
    
    onAfterDraw(width: number, height: number): void {
    }
    
    onBeforeDrawId(): void {
    }
    
    onAfterDrawId(): void {
    }
    
    onAfterDrawModelId(): void {
    }
}