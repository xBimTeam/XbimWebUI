import { Viewer, Product, State, ViewType, RenderingMode, ProductType, NavigationCube } from '../..';
import { Viewpoint } from '../../src/bcf';
import { CameraType } from '../../src/camera';
import { Grid } from '../../src/plugins/Grid/grid';

const viewer = new Viewer("viewer");
const cube = new NavigationCube();
const grid = new Grid();
cube.ratio = 0.05;
cube.stopped = false;
cube.passiveAlpha = 1.0;
cube.trueNorth = 0;
viewer.addPlugin(grid);
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

const view: Viewpoint = {"index":3963,"guid":"c3f5348f-6947-4ddf-aa1e-749882f86acc-00000138","orthogonal_camera":{"camera_view_point":[-0.2514822145506841,-0.10837116318477324,30.02010689454086],"camera_direction":[0,0,-0.9999999999999999],"camera_up_vector":[0.49999999999999944,0.8660254037844389,0],"view_to_world_scale":0.1,"width":34.79627847673113,"height":29.468081170622376},"perspective_camera":null,"lines":[],"clipping_planes":[{"location":[0,0,4.5],"direction":[0,0,-1]}],"bitmaps":[],"snapshot":{"snapshot_type":"jpg","snapshot_data":"/9j/4AAQSkZJRgABAQEAlgCWAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCACpAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9O/CPHh60wMff/wDQ2rYrH8Jf8i/a/wDA/wD0Nq2KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAMfwl/yL9r/wP/0Nq2Kx/CX/ACL9p/wP/wBDatigAooooAKKKKACiiigAooooAKKKKAEC7c+/NLRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBj+Ev+Rftf+B/+htWxWP4S/wCRftf+B/8AobVsUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAY/hL/kX7X/AIH/AOhtWxWP4S/5F+1/4H/6G1bFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAGP4S/5F+1/4H/6G1bFY/hL/AJF+1/4H/wChtWxQAUUUUAFFFFABRRRQAUUUUAFFFFADWdVxuYDJwMnrTqxvEH+v0n/r8T+RrZoAKKKKACiiigAooooAKKKKACikz270tABRRRQBj+E/+Rftf+B/+htWxWP4S/5F+1/4H/6G1bFACEBgQRkGloooAKKKKACiiigAooooAKKKKAKWqaWmqJCrSyQmJ/MVozg5wf8AGqv9gyf9BO9/7+Vr0UAZH9gyf9BO9/7+Uf2DJ/0E73/v5WvRQBlJociOrf2leNg5wZODWrRRQAUUUUAFFFFACYGc45paKKACiiigDH8I/wDIv2v/AAP/ANDatisfwl/yL9r/AMD/APQ2rYoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAx/CX/Iv2n/A//Q2rYrH8Jf8AIv2v/A//AENq2KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAMfwl/yL9r/wAD/wDQ2rYrH8Jf8i/a/wDA/wD0Nq2KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAMfwl/yL9p/wP/0Nq2Kx/CX/ACL9r/wP/wBDatigAooooAKKKKACiiigAooooAKKKKAEGec/hS0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAc74X1axt9Dto5by3jkXflXlUEfOexNan9uab/0ELX/AL/L/jXmtv8A8esP+4P5VJ/FQB6N/bmnf9BC1/7/AC/40f25pv8A0ELX/v8AL/jXnPpRQB6N/bmm/wDQQtf+/wAv+NH9uab/ANBC1/7/AC/415zQKAPRv7c03/oIWv8A3+X/ABo/tzTf+gha/wDf5f8AGvOTQe1AHo39uab/ANBC1/7/AC/40f25pv8A0ELX/v8AL/jXnNHrQB6N/bmm/wDQQtf+/wAv+NH9uab/ANBC1/7/AC/415zRQB6N/bmm/wDQQtf+/wAv+NH9uab/ANBC1/7/AC/415zQaAPRv7c03/oIWv8A3+X/ABo/tzTf+gha/wDf5f8AGvOfSj0oA9G/tzTf+gha/wDf5f8AGj+3NO/6CFr/AN/l/wAa857UtAHov9uab/0ELX/v8v8AjR/bmm/9BC1/7/L/AI15z6UtAHov9uad/wBBC1/7/L/jR/bmm/8AQQtf+/y/415z/jS0Aei/25pv/QQtf+/y/wCNH9uab/0ELX/v8v8AjXnVFAHov9uab/0ELX/v8v8AjRXnD/db/PaigD//2Q=="},"components":null};

window['view'] = view;
const envelopeBase64 = "lVecBQQEAAAAIAAAADAAAAAAAAAABAAAAAEAAAAAAIA/yP1R7OeyNsDPkDXkFpo1wAAAAAAAAAhAAQAEAAAAVjxyQUmsq0EAAIBAAAAAAAAAAAAAAAAAVjzyQUmsK0IAAABBmAAAAKuqKj/JyMg+09LSPgAAgD+mAAAAxQE/l7VBt9CUQQAAAAC46qpAzBJQQAAAgEBFAQAAxQE1wLZBG6qtQQAAAAA9lo0/mx3QPwAAgEBgAQAAxQEAAAAAAAAAAAAAAABWPPJBvTGNQQAAAEF7AQAAxQHEehQ+xwiMQQAAAABpcW1Byk/LQQAAAEEEAAAAAQAAAKYAAADFAQAAAACYAAAAtQAAAAEIAAAADAAAAO5R4EER05ZBAAAAADXAtkER065BAACAQO5R4EER05ZBAACAQDXAtkER065BAAAAAD+XtUG30KxBAACAQD+XtUG30KxBAAAAAPgo30G30JRBAAAAAPgo30G30JRBAACAQAYAAAACAAAAPyoAAQIBAAMCAAAAwVQDBAEEAwUCAAAAwtEEBgcGBAUCAAAAP6gHAAIABwYCAAAAfn4GAwADBgUCAAAAAH4BBwIHAQQBAAAARQEAAMUBAAAAAJgAAAC1AAAAAQgAAAAMAAAAP5e9QfWrukEAAAAANcC2QRHTrkEAAIBAP5e9QfWrukEAAIBANcC2QRHTrkEAAAAAj8K4QRuqrUEAAIBAj8K4QRuqrUEAAAAAmZm/Qf+CuUEAAAAAmZm/Qf+CuUEAAIBABgAAAAIAAADBVAABAgEAAwIAAADB0QMEAQQDBQIAAAA/qAQGBwYEBQIAAAA/KgcAAgAHBgIAAAB+fgYDAAMGBQIAAAAAfgEHAgcBBAEAAAB7AQAAxQEAAAAAmAAAALUAAAABCAAAAAwAAADF08o+xwiMQQAAAABUw29BzhcrQgAAAEHF08o+xwiMQQAAAEFUw29BzhcrQgAAAAChvmtBSawrQgAAAEGhvmtBSawrQgAAAADEehQ+vDGNQQAAAADEehQ+vDGNQQAAAEEGAAAAAgAAAD+oAAECAQADAgAAAD8qAwQBBAMFAgAAAMFUBAYHBgQFAgAAAMHRBwACAAcGAgAAAH5+BgMAAwYFAgAAAAB+AQcCBwEEAQAAAGABAADFAQAAAACYAAAAtQAAAAEIAAAADAAAAFY88kFjloA+AAAAAOF6FD69MY1BAAAAQVY88kFjloA+AAAAQeF6FD69MY1BAAAAAAAA4KRjL4tBAAAAQQAA4KRjL4tBAAAAAGAT8UEAAOAoAAAAAGAT8UEAAOAoAAAAQQYAAAACAAAAPyoAAQIBAAMCAAAAwVQDBAEEAwUCAAAAwtEEBgcGBAUCAAAAP6gHAAIABwYCAAAAfn4GAwADBgUCAAAAAH4BBwIHAQQ=";
const envelope = baseToBlob(envelopeBase64);

viewer.loadAsync(envelope);
//viewer.loadAsync('/tests/data/rac_envelope.wexbim')

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
        viewer.show(ViewType.DEFAULT, undefined, undefined, false);
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
    const v = Viewpoint.GetViewpoint(viewer, (id, model) => `${model}_${id}`)
    // window['view'] = v;
    return v;
};

window['setView'] = (v: Viewpoint) => {
    v = v || window['view'];
    if (v == null)
        return;
    Viewpoint.SetViewpoint(viewer, v, null, 200);
};


