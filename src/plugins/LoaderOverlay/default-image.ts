export class DefaultImage {
    public image: HTMLImageElement;
    /**
     *
     */
    constructor() {
        const data = `
        <svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" id="svg2" viewBox="0 0 463.89 438.88" version="1.0">
          <g id="layer1" transform="translate(-42.339 -276.34)">
            <path id="rect2391" d="m437.15 499.44zl-162.82-144.19-162.9 144.25v206.12c0 5.33 4.3 9.6 9.62 9.6h101.81v-90.38c0-5.32 4.27-9.62 9.6-9.62h83.65c5.33 0 9.6 4.3 9.6 9.62v90.38h101.84c5.32 0 9.6-4.27 9.6-9.6v-206.18zm-325.72 0.06z"/>
            <path id="path2399" d="m273.39 276.34l-231.05 204.59 24.338 27.45 207.65-183.88 207.61 183.88 24.29-27.45-231-204.59-0.9 1.04-0.94-1.04z"/>
            <path id="rect2404" d="m111.43 305.79h58.57l-0.51 34.69-58.06 52.45v-87.14z"/>
          </g>
        </svg>`;
        
        const blob = new Blob([data], {type: 'image/svg+xml'});

        const url = URL.createObjectURL(blob);

        const image = document.createElement('img');
        image.src = url;

        this.image = image;
    }
}