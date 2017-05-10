Live example [here](1_Hello_building.live.html)
------------

In this tutorial you will learn how to create the most basic and straightforward viewer. 
It won't do anything except showing the building. It will only use the built-in navigation
of the viewer and will not respond to any events. You can have a look [here](1_Hello_building.live.html) for live example.
No let's dig into the code:

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Hello building!</title>
        <script src="js/xbim.bundle.js"></script>
    </head>
    <body>
        <canvas id="viewer" width="500" height="300"></canvas>
        <script type="text/javascript">
            var viewer = new xViewer('viewer');
            viewer.load('data/SampleHouse.wexbim');
            viewer.start();
        </script>
    </body>
    </html>

Well, this was pretty easy wasn't it? We just referenced the *xbim.browser.bundle.js* library, create {@link xViewer xViewer} object
passing id of `<canvas>` element and start animation. This is it! Just make sure you are running from web server, not just 
as a local file because xViewer uses AJAX to fetch the wexBIM data and some browsers impose CORS restrictions even on local
HTML files. Also make sure you don't use IE less than 11 because you need to have support for WebGL. You will learn how to 
check prerequisites at the end of this tutorial. If it still doesn't work check your webserver is serving wexBIM file as a
static content. If you don't want to install webserver only because of this I recommend [Mongoose](https://code.google.com/p/mongoose/). 
Just drop it into the sample directory and run it. It will serve all files as a static content which is all you need for this tutorial.

Now just a few words about deployment. We have referenced *xbim.browser.bundle.js* which contains *xbim-viewer.js* bundled 
along with two dependant libraries *gl-matrix.js* and *webgl-utils.js*. These are the only external dependencies of the viewer.
As you may have guessed from the name it is debug version. If you download this library it contains multiple 
files for different types of deployment. Bundles are self-contained and are released as minified and debug version.
The library itself is written with [TypeScript](http://www.typescriptlang.org), which is then compiled down to JavaScript
and bundled as a single file to be used in a web browser.
Either reference

        <script src="js/xbim.bundle.js"></script>

for debug bundled version (this will also add you intellisense support in VS if your IDE of choice) or

        <script src="js/xbim.bundle.min.js"></script>

for minified version (this will probably be your choice for release).
If you're using a module loader (and don't yet use TypeScript), you can reference *xbim.bundle.js* or *xbim.bundle.min.js* for an UMD bundled module.

Right, this is about enough for the first tutorial. So if you feel fresh you can jump right into the next one where you will learn 
how to check that the browser is actually able to render the model in {@tutorial 2_Safe_Hello_building}. It'll look the same as this example so you can have a look on [live
show here](1_Hello_building.live.html)