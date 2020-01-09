import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube } from '../..';
import { Viewpoint } from '../../src/bcf';
import { CameraType } from '../../src/camera';

const viewer = new Viewer("viewer");
const cube = new NavigationCube();
cube.ratio = 0.05;
cube.stopped = false;
cube.passiveAlpha = 1.0;
cube.trueNorth = 30;
viewer.addPlugin(cube);

function baseToBlob(data: string): Blob {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(data);

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia]);
}

const planes = [{
    location: [6.034891241332059, 11.932034652111764, 2.938690319308495],
    direction: [1, 0, 0]
},
{
    location: [6.034891241332059, 11.932034652111764, 2.938690319308495],
    direction: [0, 1, 0]
},
{
    location: [6.034891241332059, 11.932034652111764, 2.938690319308495],
    direction: [0, 0, 1]
},
{
    location: [-14.445182511038018, -17.41165259822041, -3.638160847426593],
    direction: [-1, 0, 0]
},
{
    location: [-14.445182511038018, -17.41165259822041, -3.638160847426593],
    direction: [0, -1, 0]
},
{
    location: [-14.445182511038018, -17.41165259822041, -3.638160847426593], 
    direction: [0, 0, -1]
}];

// const view: Viewpoint = {"index":3211,"guid":"c3f5348f-6947-4ddf-aa1e-749882f86acc-00000138","orthogonal_camera":{"camera_view_point":[-0.2514822145506841,-0.10837116318477324,33.480000000000004],"camera_direction":[0,0,-0.9999999999999999],"camera_up_vector":[0.49999999999999944,0.8660254037844389,0],"view_to_world_scale":0.6460945433866981},"perspective_camera":null,"lines":[],"clipping_planes":[{"location":[-22.68806613853348,-4.17890379855089,-27.48],"direction":[0.8660254037844389,-0.49999999999999944,0]},{"location":[-22.68806613853348,-4.17890379855089,-27.48],"direction":[0.49999999999999944,0.8660254037844389,0]},{"location":[-22.68806613853348,-4.17890379855089,-27.48],"direction":[0,0,0.9999999999999999]},{"location":[22.185101709432107,3.9621614721813434,33.480000000000004],"direction":[-0.8660254037844389,0.49999999999999944,0]},{"location":[22.185101709432107,3.9621614721813434,33.480000000000004],"direction":[-0.49999999999999944,-0.8660254037844389,0]},{"location":[22.185101709432107,3.9621614721813434,33.480000000000004],"direction":[0,0,-0.9999999999999999]}],"bitmaps":[],"snapshot":{"snapshot_type":"jpg","snapshot_data":"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ABRRRQAUUUUAFFFFAGP4m8M2/iqyitbmaeCOOXzc27BWPysuMkHAwx6YOQOawf8AhVttgD+3/EHClc/2i/Oe/wBR6121FAHEn4W2x/5j/iAfIE/5CL/n9felb4W2xJ/4n2vgYxgak/T0/wDr9feu1ooA4n/hVttznX/EHIIP/Exfp/8AW9etWdN+HcGm38F0uta1O0RU+XPfM6Ng55Xpz39a62igCvD811cv3XbHj6Ddn/x79KsVXtfma4f+FpTj8AFP6g1YqpbiRXs/lSSPvHIw9gCcgfkRViq8f7u8lXoHVXHueQT+W2rFEtwQVU1XSrLXdMu9N1K0hv8AT7uJoLi1uYxJHLGwIZGU8EEEgg+tW6KkZQj010t1tTcM9oqeXhwWkK4xguTz9cZ9880VfooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAr2P+pPvJIR/32asVX0//AI8Lb/rkv8hVinLdiWxXmyt1buOcloz9CM5/NR+dWKKKBhRRRSAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKgvXMdnOynDLGxB/Cp6gvVMls6AE78IcdgTgn8Ac047oRKiLGiooCqowAOgFOoopDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiobu4+y27ybGlYcLGmMux6KM8ZJ9eKAJqK4/wPd+M0a+i8Z2Wi27S3Uj2Emh3M0yLCTlY5vNRT5gH8Sja2DwnAPYUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVDcwmZVKnbIjB0J9f/rjI/GpqKAKawTTuvnJHHGHEhCSF9xHTqBgAgH8KuUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/Z"},"components":null};
const envelopeBase64 = "lVecBQQEAAAAIAAAADAAAAAAAAAABAAAAAEAAAAAAIA/yP1R7OeyNsDPkDXkFpo1wAAAAAAAAAhAAQAEAAAAVjxyQUmsq0EAAIBAAAAAAAAAAAAAAAAAVjzyQUmsK0IAAABBmAAAAKuqKj/JyMg+09LSPgAAgD+mAAAAxQE/l7VBt9CUQQAAAAC46qpAzBJQQAAAgEANAQAAxQE1wLZBG6qtQQAAAAA9lo0/mx3QPwAAgEAoAQAAxQEAAAAAAAAAAAAAAABWPPJBvTGNQQAAAEFDAQAAxQHEehQ+xwiMQQAAAABpcW1Byk/LQQAAAEEEAAAAAQAAAKYAAADFAQAAAACYAAAAtQAAAAEIAAAADAAAAO5R4EER05ZBAAAAADXAtkER065BAACAQO5R4EER05ZBAACAQDXAtkER065BAAAAAD+XtUG30KxBAACAQD+XtUG30KxBAAAAAPgo30G30JRBAAAAAPgo30G30JRBAACAQAYAAAACAAAAPyoAAQIBAAMCAAAAwVQDBAEEAwUCAAAAwtEEBgcGBAUCAAAAP6gHAAIABwYCAAAAfn4GAwADBgUCAAAAAH4BBwIHAQQBAAAADQEAAMUBAAAAAJgAAAC1AAAAAQgAAAAMAAAAP5e9QfWrukEAAAAANcC2QRHTrkEAAIBAP5e9QfWrukEAAIBANcC2QRHTrkEAAAAAj8K4QRuqrUEAAIBAj8K4QRuqrUEAAAAAmZm/Qf+CuUEAAAAAmZm/Qf+CuUEAAIBABgAAAAIAAADBVAABAgEAAwIAAADB0QMEAQQDBQIAAAA/qAQGBwYEBQIAAAA/KgcAAgAHBgIAAAB+fgYDAAMGBQIAAAAAfgEHAgcBBAEAAABDAQAAxQEAAAAAmAAAALUAAAABCAAAAAwAAADF08o+xwiMQQAAAABUw29BzhcrQgAAAEHF08o+xwiMQQAAAEFUw29BzhcrQgAAAAChvmtBSawrQgAAAEGhvmtBSawrQgAAAADEehQ+vDGNQQAAAADEehQ+vDGNQQAAAEEGAAAAAgAAAD+oAAECAQADAgAAAD8qAwQBBAMFAgAAAMFUBAYHBgQFAgAAAMHRBwACAAcGAgAAAH5+BgMAAwYFAgAAAAB+AQcCBwEEAQAAACgBAADFAQAAAACYAAAAtQAAAAEIAAAADAAAAFY88kFjloA+AAAAAOF6FD69MY1BAAAAQVY88kFjloA+AAAAQeF6FD69MY1BAAAAAAAA4KRjL4tBAAAAQQAA4KRjL4tBAAAAAGAT8UEAAOAoAAAAAGAT8UEAAOAoAAAAQQYAAAACAAAAPyoAAQIBAAMCAAAAwVQDBAEEAwUCAAAAwtEEBgcGBAUCAAAAP6gHAAIABwYCAAAAfn4GAwADBgUCAAAAAH4BBwIHAQQ=";
const envelope = baseToBlob(envelopeBase64);

viewer.loadAsync(envelope);

var progress = document.getElementById("progress");
// viewer.loadAsync("/tests/data/LakesideRestaurant.wexbim", null, null, (msg) => {
//     progress.innerHTML = `${msg.message}, done:${msg.percent}%`;
// });
viewer.start();

// viewer.on('pointerdown', (args) => {
//     console.log(args);
// });

viewer.on('loaded', args => {
    try {
        // viewer.sectionBox.setToPlanes(planes);
        viewer.zoomTo();
    } catch (e) {

    }
});

viewer.on('pick', args => {
    console.log(args.xyz);
});

window['viewer'] = viewer;
// window['view'] = view;
window['planes'] = planes;
window['clip'] = () => {
    viewer.sectionBox.setToPlanes(planes);
};

window['showTop'] = () => {
    viewer.camera = CameraType.ORTHOGONAL;
    viewer.show(ViewType.TOP);
};

window['getView'] = () => {
    const v = Viewpoint.GetViewpoint(viewer)
    window['view'] = v;
    return v;
};

window['setView'] = (v: Viewpoint) => {
    v = v || window['view'];
    if (v == null)
        return;
    Viewpoint.SetViewpoint(viewer, v);
};


