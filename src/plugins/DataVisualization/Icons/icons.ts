import { Viewer } from "../../../viewer";
import { IPlugin } from "../../plugin";
import { ClusterIcon, Icon } from "./icon";
import { mat4, vec3, vec4 } from "gl-matrix";
import { IconData } from "./icons-data";
import { VectorUtils } from "../../../common/vector-utils";
import { throttle } from "lodash";
import { PerformanceRating } from "../../../performance-rating";


export class Icons implements IPlugin {
    /** Minimum number of icons in a cell before they are rendered as a cluster. */
    public minimumIconsToCluster: number = 3;
    /** Cell size as a percentage of the canvas's shorter dimension; the computed size is clamped to 48-120px. */
    public clusterCellSize: number = 12;
    /** When true, place cluster badges at the center of their cell; otherwise use the mean member position. */
    public useClusterCellCenter = true;
    /** Minimum depth-based scale factor applied to icons and cluster badges when simulating depth with z-order. */
    public minimumIconImageScale = 0.6;


    private _viewer: Viewer;
    private _icons: HTMLDivElement;
    private _floatdetails: HTMLDivElement;
    private _floatTitle: HTMLDivElement;
    private _floatBody: HTMLDivElement;
    private _instances : { [id: string] : Icon} = {}
    private _selectedIcon: Icon | undefined;
    private _floatingDetailsEnabled: boolean = true;
    private _iconsCount = 0;
    
    private _clusterElements: { element: HTMLDivElement, count: HTMLSpanElement, summary: HTMLSpanElement, products: { id: number, model: number }[] }[] = [];
    private _renderedIconElements: { element: HTMLElement, depth: number }[] = [];

    init(viewer: Viewer): void {
        this._viewer = viewer;
        this.addStyles();
        const iconsDiv = document.createElement('div');
        iconsDiv.id = 'icons';
        this._icons = iconsDiv;
        iconsDiv.addEventListener('mousedown', event => {
            const target = event.target;
            if (!(target instanceof Element) || !target.closest('.icon-image, .icon-cluster')) return;

            const mouseEvent = new MouseEvent('mousedown', {
                bubbles: false,
                cancelable: true,
                view: window,
                detail: event.detail,
                screenX: event.screenX,
                screenY: event.screenY,
                clientX: event.clientX,
                clientY: event.clientY,
                button: event.button,
                buttons: event.buttons,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
            }) as MouseEvent & { fromPlugin?: boolean };
            mouseEvent.fromPlugin = true;
            this._viewer.canvas.dispatchEvent(mouseEvent);
        }, true);
        iconsDiv.addEventListener('wheel', event => {
            // propogate mouse wheel events to the viewer canvas so the icon overlays don't affect zooming
            const wheelEvent = new WheelEvent('wheel', {
                bubbles: false,
                cancelable: true,
                clientX: event.clientX,
                clientY: event.clientY,
                screenX: event.screenX,
                screenY: event.screenY,
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                deltaZ: event.deltaZ,
                deltaMode: event.deltaMode,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
            });
            this._viewer.canvas.dispatchEvent(wheelEvent);
            if (wheelEvent.defaultPrevented) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

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


    }

    /** Removes an icon from the system
     * 
     * @param icon 
     * @returns 
     */
    public removeIcon(icon: Icon) {
        const id = Object.keys(this._instances).find(key => this._instances[key] === icon);
        if (id === undefined) {
            return;
        }

        delete this._instances[id];
        document.getElementById('icon' + id)?.remove();

        if (this._selectedIcon === icon) {
            this._selectedIcon = undefined;
        }
    }

    /** Register an icon with the Data Visualization system 
     * 
    */
    public addIcon(icon: Icon){
        const id = this.getId(icon);
        const iconElement = document.createElement('div');
        const image = document.createElement('img');
        image.classList.add('icon-image')
        image.draggable = false;
        image.addEventListener("click", this.onIconClicked.bind(this), false);
        if(!icon.imageData){
            icon.imageData = IconData.defaultIcon;

        }
        if(!icon.imageData.startsWith('data:image/')){
            image.src = 'data:image/png;base64,' + icon.imageData; // assume it is png
            image.height = icon.height ?? IconData.defaultIconHeight;
            image.width = icon.width ?? IconData.defaultIconWidth;
        }
        else{
            image.src = icon.imageData;
            image.height = 24;
            image.width = 18;
        }
        image.id = id.toString();
        if(icon.products && icon.products.length && !icon.location) {
            const wcs = this._viewer.getCurrentWcs();
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
            icon.products.forEach(product => {
                const bb = this._viewer.getProductBoundingBox(product.id, product.model);
                if (bb && bb.length === 6) {
                    minX = Math.min(minX, bb[0]);
                    minY = Math.min(minY, bb[1]);
                    minZ = Math.min(minZ, bb[2]);
                    
                    maxX = Math.max(maxX, bb[0] + bb[3]);
                    maxY = Math.max(maxY, bb[1] + bb[4]);
                    maxZ = Math.max(maxZ, bb[2] + bb[5]);
                }
            });
            if (minX !== Infinity && minY !== Infinity && minZ !== Infinity) {
                const centerX = (minX + maxX) / 2 - wcs[0];
                const centerY = (minY + maxY) / 2 - wcs[1];
                const centerZ = (minZ + maxZ) / 2 - wcs[2];
                icon.location = new Float32Array([centerX, centerY, centerZ]);
            }
        }
        
        const valueDiv = document.createElement('div');
        valueDiv.classList.add('icon-value-readout');
        valueDiv.id = 'value-' + id;
        valueDiv.style.display = 'none'; // Initially hidden
        
        this._instances[id.toString()] = icon;
        iconElement.id = "icon" + id;
        iconElement.appendChild(valueDiv);
        iconElement.appendChild(image);
        this._icons.appendChild(iconElement);
        this._iconsCount++;
    }

    public updateIconsLocations(){
        Object.keys(this._instances).forEach(key => {
            const icon = this._instances[key];
            if (icon.products && icon.products.length) {
                const wcs = this._viewer.getCurrentWcs();
                let minX = Infinity, minY = Infinity, minZ = Infinity;
                let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
                icon.products.forEach(product => {
                    const bb = this._viewer.getProductBoundingBox(product.id, product.model);
                    if (bb && bb.length === 6) {
                        minX = Math.min(minX, bb[0]);
                        minY = Math.min(minY, bb[1]);
                        minZ = Math.min(minZ, bb[2]);
                        
                        maxX = Math.max(maxX, bb[0] + bb[3]);
                        maxY = Math.max(maxY, bb[1] + bb[4]);
                        maxZ = Math.max(maxZ, bb[2] + bb[5]);
                    }
                });
                if (minX !== Infinity && minY !== Infinity && minZ !== Infinity) {
                    const centerX = (minX + maxX) / 2 - wcs[0];
                    const centerY = (minY + maxY) / 2 - wcs[1];
                    const centerZ = (minZ + maxZ) / 2 - wcs[2];
                    icon.location = new Float32Array([centerX, centerY, centerZ]);
                }
            }
        });
    }
    public setFloatingDetailsState(enabled: boolean){
        this._floatingDetailsEnabled = enabled;
    }

    public moveIconTo(icon: Icon, location: Float32Array, speed: number): void {
        if (!icon.location) {
            console.warn("Icon location is not defined.");
            return;
        }
    
        icon.addMovementToQueue(location, speed);
        if (!icon.isMoving) {
            this.processMovementQueue(icon);
        }
    }
    
    private processMovementQueue(icon: Icon): void {
        if (!icon.movementQueue || icon.movementQueue.length === 0) {
            icon.isMoving = false;
            return;
        }
    
        const { location, speed } = icon.movementQueue.shift();
    
        icon.isMoving = true;
    
        const startLocation = icon.location;
    
        const vector = [
            location[0] - startLocation[0],
            location[1] - startLocation[1],
            location[2] - startLocation[2],
        ];
    
        const distance = Math.sqrt(
            vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2
        );
    
        if (distance === 0) {
            this.processMovementQueue(icon);
            return;
        }
    
        const direction = vector.map((v) => v / distance);
        const totalTime = distance / speed;
        const intervalTime = 16;
        const steps = Math.ceil(totalTime * (1000 / intervalTime));
        let currentStep = 0;
    
        const intervalId = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(intervalId);
                icon.location = location;
                this.processMovementQueue(icon);
                return;
            }
    
            const progress = currentStep / steps;
            icon.location = new Float32Array([
                startLocation[0] + direction[0] * distance * progress,
                startLocation[1] + direction[1] * distance * progress,
                startLocation[2] + direction[2] * distance * progress,
            ]);
    
            currentStep++;
        }, intervalTime);
    }

    private onIconClicked(ev: PointerEvent ){
        ev.stopPropagation();
        const icon: Icon = this._instances[(ev.target as Element).id];
        if(!icon) return;
        if(this._selectedIcon && icon && icon === this._selectedIcon)
        {
            this.closeFloatingBox()
            return;
        }
        if(icon.onIconSelected) icon.onIconSelected(); 
        this._selectedIcon = icon;
        this.render();
    }

    private closeFloatingBox(){
        this._selectedIcon = null;
        this.render();
    }

    private render() {
        const canvas = this._viewer.canvas;
        
        if(canvas && this._icons) {

            this._icons.style.width = canvas.clientWidth + 'px';
            this._icons.style.height = canvas.clientHeight + 'px';

            var wcs = this._viewer.getCurrentWcs();
            var a = this._viewer.getClip()?.PlaneA;
            var b = this._viewer.getClip()?.PlaneB;
            const planeA = a ? this.transformPlane(a, wcs) : null;
            const planeB = b? this.transformPlane(this._viewer.getClip()?.PlaneB, wcs) : null;
            const box = this._viewer.sectionBox.getBoundingBox(wcs);
            const modelView = this._viewer.mvMatrix;
            const viewProjection = mat4.multiply(mat4.create(), this._viewer.pMatrix, modelView);
            const depthRange = this.getViewDepthRange(this._viewer.getTargetBoundingBox(), modelView);

            this._renderedIconElements = [];
            this.renderSingleIcons(planeA, planeB, box, modelView, viewProjection, depthRange);

            this.renderClusteredIcons(planeA, planeB, box, modelView, viewProjection, depthRange);
            this.applyIconZOrder();

            if(this._selectedIcon && this._selectedIcon.isEnabled && this._floatdetails && this._floatingDetailsEnabled) {
                const position = this._viewer.getHtmlCoordinatesOfVector(this._selectedIcon.location);
                if(position.length == 2 && this.isWithinNearFrustum(this._selectedIcon.location, viewProjection)) {
                    this._floatTitle.textContent = this._selectedIcon.name;
                    this._floatBody.innerHTML = this._selectedIcon.description;
                    const posLeft = (position[0]) +(-this._floatdetails.clientWidth / 2) + 10;
                    const posTop =(position[1]) - (this._floatdetails.clientHeight + 24);
                    this._floatdetails.style.left = posLeft + 'px';
                    this._floatdetails.style.top = posTop + 'px';
                    this._floatdetails.style.display = 'block';
                } else {
                    this._floatdetails.style.display = 'none';
                }
            } else {
                    this._floatdetails.style.display = 'none';
            }
        }
    }

    private renderClusteredIcons(planeA: Float32Array | null, planeB: Float32Array | null, box: Float32Array, modelView: mat4, viewProjection: mat4, depthRange: { min: number, max: number }) {
        const canvasSize = Math.min(this._viewer.canvas.clientWidth, this._viewer.canvas.clientHeight);
        const cellSize = Math.max(48, Math.min(120, canvasSize * this.clusterCellSize / 100));
        const buckets = new Map<string, ({icon:ClusterIcon, key: string, iconLabel: HTMLElement, position: number[]})[]>();

        Object.keys(this._instances).forEach(k => {
            const icon = this._instances[k];
            if (!(icon instanceof ClusterIcon)) return;
            
            let iconLabel = document.getElementById('icon' + k);

            if (iconLabel && icon && icon.location && icon.isEnabled) {
                
                if (!this.canBeRendered(icon, planeA, planeB, box) || !this.isWithinNearFrustum(icon.location, viewProjection)) {
                    iconLabel.style.display = 'none';
                    
                    return;
                }

                const position = this._viewer.getHtmlCoordinatesOfVector(icon.location);
                if (position.length == 2) {

                    const iconheight = icon.height ?? IconData.defaultIconHeight;
                    const iconwidth = icon.width ?? IconData.defaultIconWidth;
                    const cellX = Math.floor((position[0] - iconwidth / 2) / cellSize); 
                    const cellY = Math.floor((position[1] - iconheight / 2)/ cellSize); 
                    const key = `${cellX},${cellY}`;

                    let bucket = buckets.get(key);
                    if (!bucket) {
                        bucket = [];
                        buckets.set(key, bucket);
                    }
                    bucket.push({icon, key: k, iconLabel, position});
                }
            } else {
                if (iconLabel)
                    iconLabel.style.display = 'none';
            }

        });

        let clusterIndex = 0;
        buckets.forEach((icons, clusterKey) => {
            if (icons.length === 1 || icons.length < this.minimumIconsToCluster) {
                icons.forEach(({icon, key, iconLabel, position}) => {
                    this.renderIcon(icon, position, iconLabel, key, modelView, depthRange);
                });
            } else {
                icons.forEach(item => item.iconLabel.style.display = 'none');

                let cluster = this._clusterElements[clusterIndex];
                if (!cluster) {
                    const element = document.createElement('div');
                    const count = document.createElement('span');
                    const summary = document.createElement('span');
                    element.className = 'icon-cluster';
                    count.className = 'icon-cluster-count';
                    summary.className = 'icon-cluster-summary';
                    element.appendChild(count);
                    element.appendChild(summary);
                    this._icons.appendChild(element);
                    cluster = { element, count, summary, products: [] };
                    element.addEventListener('click', event => {
                        event.stopPropagation();
                        if (cluster.products.length > 0) {
                            this._viewer.zoomTo(cluster.products);
                        }
                    });
                    this._clusterElements.push(cluster);
                }

                const cellCoordinates = clusterKey.split(',');
                const centerX = this.useClusterCellCenter
                    ? (Number(cellCoordinates[0]) + 0.5) * cellSize
                    : icons.reduce((sum, item) => sum + item.position[0], 0) / icons.length;
                const centerY = this.useClusterCellCenter
                    ? (Number(cellCoordinates[1]) + 0.5) * cellSize
                    : icons.reduce((sum, item) => sum + item.position[1], 0) / icons.length;
                cluster.count.textContent = icons.length.toString();
                const summary = this.getClusterSummary(icons.map(item => item.icon));
                cluster.element.classList.toggle('icon-cluster-categorical', summary.type === 'categorical');
                cluster.element.style.background = '';
                if (summary.type === 'categorical') {
                    const total = summary.categories.reduce((sum, category) => sum + category.count, 0);
                    let offset = 0;
                    const segments = summary.categories.map(category => {
                        const end = offset + category.count / total * 360;
                        const segment = `${category.color} ${offset}deg ${end}deg`;
                        offset = end;
                        return segment;
                    });
                    cluster.element.style.background = `conic-gradient(${segments.join(', ')})`;
                    cluster.summary.textContent = '';
                    const breakdown = summary.categories.map(category => `${category.value}: ${category.count}`).join('\n');
                    cluster.element.title = breakdown;
                    cluster.element.setAttribute('aria-label', `Cluster of ${total} icons. ${breakdown.replace(/\n/g, ', ')}`);
                } else {
                    cluster.summary.textContent = summary.type === 'numeric' ? summary.text : '';
                    cluster.element.title = icons.map(item => item.icon.name).join(', ');
                    cluster.element.setAttribute('aria-label', `${icons.length} clustered icons`);
                }
                const products = new Map<string, { id: number, model: number }>();
                icons.forEach(item => item.icon.products?.forEach(product => {
                    products.set(`${product.model}:${product.id}`, product);
                }));
                cluster.products = Array.from(products.values());
                cluster.element.style.left = (centerX - 36) + 'px';
                cluster.element.style.top = (centerY - 36) + 'px';
                cluster.element.style.display = 'flex';
                const averageDepth = icons.reduce((sum, item) => sum + this.getViewDepth(item.icon.location, modelView), 0) / icons.length;
                const depthSpan = depthRange.max - depthRange.min;
                const normalizedDepth = depthSpan > 0
                    ? Math.max(0, Math.min(1, (averageDepth - depthRange.min) / depthSpan))
                    : 0;
                const depthScale = 1 - normalizedDepth * (1 - this.minimumIconImageScale);
                cluster.element.style.transform = `scale(${depthScale})`;
                this._renderedIconElements.push({ element: cluster.element, depth: averageDepth });
                clusterIndex++;
            }
        });

        for (let index = clusterIndex; index < this._clusterElements.length; index++) {
            this._clusterElements[index].element.style.display = 'none';
        }
    }

    private getClusterSummary(icons: ClusterIcon[]):
        { type: 'numeric', text: string } |
        { type: 'categorical', categories: { value: string, count: number, color: string }[] } |
        { type: 'none' } {
        if (icons.length > 0 && icons.every(icon => icon.categoryColor !== null)) {
            const categoryCounts = new Map<string, { count: number, color: string | null }>();
            icons.forEach(icon => {
                const value = icon.categoryLabel ?? (icon.value == null ? 'Unknown' : String(icon.value));
                const category = categoryCounts.get(value);
                if (category) {
                    category.count++;
                    if (!category.color && icon.categoryColor) category.color = icon.categoryColor;
                } else {
                    categoryCounts.set(value, { count: 1, color: icon.categoryColor });
                }
            });

            const fallbackColors = ['#e76f51', '#2a9d8f', '#e9c46a', '#6d9dc5', '#c77dff', '#f4a261'];
            const categories = Array.from(categoryCounts.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([value, category], index) => ({
                    value,
                    count: category.count,
                    color: category.color || fallbackColors[index % fallbackColors.length]
                }));
            return { type: 'categorical', categories };
        }

        if (!icons.every(icon => typeof icon.value === 'number' && isFinite(icon.value))) {
            return { type: 'none' };
        }

        const unit = icons[0].unit.trim();
        if (icons.some(icon => icon.unit.trim() !== unit)) return { type: 'none' };

        const values = icons.map(icon => icon.value as number);
        const min = Math.min.apply(Math, values);
        const max = Math.max.apply(Math, values);
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;
        const format = (value: number) => Number(value.toPrecision(3)).toString();
        const suffix = unit ? ' ' + unit : '';
        return { type: 'numeric', text: `min ${format(min)}${suffix}\navg ${format(average)}${suffix}\nmax ${format(max)}${suffix}` };
    }


    private renderSingleIcons(planeA: Float32Array | null, planeB: Float32Array | null, box: Float32Array, modelView: mat4, viewProjection: mat4, depthRange: { min: number, max: number }) {
        Object.getOwnPropertyNames(this._instances).forEach(k => {
            const icon: Icon = this._instances[k];
            if (icon instanceof ClusterIcon) return;
            let iconLabel = document.getElementById('icon' + k);
            if (iconLabel && icon && icon.location && icon.isEnabled) {

                if (!this.canBeRendered(icon, planeA, planeB, box) || !this.isWithinNearFrustum(icon.location, viewProjection)) {
                    iconLabel.style.display = 'none';
                    return;
                }

                const position = this._viewer.getHtmlCoordinatesOfVector(icon.location);
                if (position.length == 2) {

                    this.renderIcon(icon, position, iconLabel, k, modelView, depthRange);
                }

            } else {
                if (iconLabel)
                    iconLabel.style.display = 'none';
            }
        });
    }

    private renderIcon(icon: Icon, position: number[], iconLabel: HTMLElement, key: string, modelView: mat4, depthRange: { min: number, max: number }) {
        const iconheight = icon.height ?? IconData.defaultIconHeight;
        const iconwidth = icon.width ?? IconData.defaultIconWidth;
        const posLeft = (position[0] - iconwidth / 2);
        const posTop = (position[1] - iconheight / 2);
        iconLabel.style.position = 'absolute';
        iconLabel.style.display = 'block';
        iconLabel.style.left = posLeft + 'px';
        iconLabel.style.top = posTop + 'px';
        const depth = this.getViewDepth(icon.location, modelView);
        this._renderedIconElements.push({ element: iconLabel, depth });
        const depthSpan = depthRange.max - depthRange.min;
        const normalizedDepth = depthSpan > 0
            ? Math.max(0, Math.min(1, (depth - depthRange.min) / depthSpan))
            : 0;
        const depthScale = 1 - normalizedDepth * (1 - this.minimumIconImageScale);
        const image = iconLabel.querySelector<HTMLImageElement>('.icon-image');
        if (image) {
            image.style.transform = `scale(${depthScale})`;
        }
        if (!icon.isValueDisplayed) {
            iconLabel.title = icon.valueReadout;
        }
        if (icon.valueReadout && icon.isValueDisplayed) {
            const valueDiv = document.getElementById('value-' + key);
            if (valueDiv) {
                valueDiv.innerHTML = (icon.overlayValue || icon.valueReadout) ;
                valueDiv.style.display = 'block';
                valueDiv.style.top = (iconheight + 0) + 'px';
                valueDiv.style.transform = `translateX(-50%) scale(${depthScale})`;
            }
        } else {
            const valueDiv = document.getElementById('value-' + key);
            if (valueDiv) {
                valueDiv.style.display = 'none';
            }
        }
    }

    private applyIconZOrder() {
        const orderedElements = this._renderedIconElements.slice().sort((a, b) => b.depth - a.depth);
        orderedElements.forEach((item, index) => {
            item.element.style.zIndex = (index + 1).toString();
        });
    }

    private getViewDepth(position: Float32Array, modelView: mat4): number {
        const viewPosition = vec3.transformMat4(vec3.create(), position, modelView);
        return -viewPosition[2];
    }

    private isWithinNearFrustum(position: Float32Array, viewProjection: mat4): boolean {
        const worldPosition = vec4.fromValues(position[0], position[1], position[2], 1);
        const clipPosition = vec4.transformMat4(vec4.create(), worldPosition, viewProjection);
        const w = clipPosition[3];

        return w > 0 &&
            clipPosition[0] >= -w && clipPosition[0] <= w &&
            clipPosition[1] >= -w && clipPosition[1] <= w &&
            clipPosition[2] >= -w;
    }

    private getViewDepthRange(bounds: number[] | Float32Array, modelView: mat4): { min: number, max: number } {
        if (!bounds || bounds.length !== 6) return { min: -1, max: 1 };

        let min = Infinity;
        let max = -Infinity;
        for (let x = 0; x <= 1; x++) {
            for (let y = 0; y <= 1; y++) {
                for (let z = 0; z <= 1; z++) {
                    const corner = new Float32Array([
                        bounds[0] + bounds[3] * x,
                        bounds[1] + bounds[4] * y,
                        bounds[2] + bounds[5] * z
                    ]);
                    const depth = this.getViewDepth(corner, modelView);
                    if (isFinite(depth)) {
                        min = Math.min(min, depth);
                        max = Math.max(max, depth);
                    }
                }
            }
        }

        return min <= max ? { min, max } : { min: -1, max: 1 };
    }

    private addStyles() { 
        const element = document.createElement('style');
        element.textContent = IconData.styles;
        document.body.appendChild(element);
    }
      
    public getId(icon: Icon): number {
        const uniqueValue = Date.now().toString();
        if (icon.products && icon.products.length > 0) {
          const sortedProductIds = icon.products.map(p => p.id).slice().sort((a, b) => a - b);
          const idString = sortedProductIds.join('-') + '-' + icon.name + '-' + this._iconsCount + '-' + uniqueValue;
          return this.hashString(idString);
        } else {
          return this.hashString(Math.random().toString());
        }
    }
      
    private hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
    }
    
    private cantorPairing(x: number, y: number): number {
        return ((x + y) * (x + y + 1)) / 2 + y;
    }

    private canBeRendered(icon: Icon, planeA: Float32Array, planeB: Float32Array, box: Float32Array): boolean {
        let canBeRendered = true;
        const point = icon.location;
    
        let isProductInModel = false;
        if (icon.products && icon.products.length > 0) {
            this._viewer.activeHandles.forEach(handle => {
                icon.products.forEach(product => {
                    if (this._viewer.isProductInModel(product.id, handle.id)) {
                        isProductInModel = true;
                    }
                });
            });
    
            if (!isProductInModel) {
                return false;
            }
        }
      
        if (planeA) {
            const relPlaneA = this.pointPlaneRelation(
                planeA[0],
                planeA[1],
                planeA[2],
                planeA[3],
                point[0],
                point[1],
                point[2]
            );
            canBeRendered = canBeRendered && relPlaneA > 0;
        }
    
        if (planeB) {
            const relPlaneB = this.pointPlaneRelation(
                planeB[0],
                planeB[1],
                planeB[2],
                planeB[3],
                point[0],
                point[1],
                point[2]
            );
            canBeRendered = canBeRendered && relPlaneB > 0;
        }
    
        if (box) {
            const minX = box[0], minY = box[1], minZ = box[2];
            const maxX = box[0] + box[3], maxY = box[1] + box[4], maxZ = box[2] + box[5];
            canBeRendered = canBeRendered && (
                point[0] >= minX && point[0] <= maxX &&
                point[1] >= minY && point[1] <= maxY &&
                point[2] >= minZ && point[2] <= maxZ
            );
        }
    
        return canBeRendered;
    }


    private pointPlaneRelation(A: number, B: number, C: number, D: number, x1: number, y1: number, z1: number) {
        let result = A * x1 + B * y1 + C * z1 + D;
        result = result / Math.sqrt(A*A + B*B + C*C);
        if (result > 0) {
            return 1; // Point is above the plane
        } else if (result < 0) {
            return -1; // Point is below the plane
        } else {
            return 0; // Point is on the plane
        }
    }

    private transformPlane(plane: number[], transform: vec3): Float32Array {
        const normalLength = vec3.len(VectorUtils.getVec3(plane));
        // plane components
        const a = plane[0];
        const b = plane[1];
        const c = plane[2];
        let d = plane[3];

        // point closest to [0,0,0]
        let x = (a * -d) / normalLength;
        let y = (b * -d) / normalLength;
        let z = (c * -d) / normalLength;

        // translate
        x -= transform[0];
        y -= transform[1];
        z -= transform[2];

        //compute new normal equation of the plane
        d = 0.0 - a * x - b * y - c * z;

        return new Float32Array([a, b, c, d]);
    }

    onBeforeDraw(width: number, height: number): void {
    }

    throttledRefresh = throttle(this.render, 1000/30);          // 30 FPS
    backOffThrottledRefresh = throttle(this.render, 1000/5);    // 5 FPS

    onAfterDraw(width: number, height: number): void {
        if (this._viewer.performance === PerformanceRating.HIGH)
            this.throttledRefresh();
        else
            this.backOffThrottledRefresh();
    }
    
    onBeforeDrawId(): void {
    }
    
    onAfterDrawId(): void {
    }
    
    onAfterDrawModelId(): void {
    }
}
