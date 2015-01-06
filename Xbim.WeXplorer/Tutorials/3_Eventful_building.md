Live example [here](3_Eventful_building.live.html)
------------

In this tutorial we'll have a look on events fired by the viewer on different occasions. 
All of them are documented in {@link xViewer xViewer}. You can see full live example [here](3_Eventful_building.live.html) 
if you are running this tutorial from web server. Alsso make sure your webserver is set up to serve wexBIM files as
a static content. If you don't want to set up any complex webserver I recommend [Mongoose](https://code.google.com/p/mongoose/). 
Just run the executable in the executable in Docs folder and browse to tutorial or the live example.

I'll use ugly obtrusive code with javascript functions defined in *onclick* attributes of HTML elements. This is not the right practise
but I've done it this way for the sake of clarity and simplicity. You are ancouraged to follow 
[these guidlines](http://www.w3.org/wiki/The_principles_of_unobtrusive_JavaScript) to write sustainable
and clear web applications.


And now, let's dig into the code. It is pretty easy to register your handler with the following function:
	
	viewer.on('event_name', callback); //see documentation {@link xViewer#on here}.

You can also remove handler with similar code if you are not interested in it any more:

	viewer.onRemove('event_name', callback); //see documentation {@link xViewer#onRemove here}.
	
We will show some of the most useful events you might want to watch in the following example. 
It is based on the previous tutorial {@tutorial 2_Safe_Hello_building} so we won't list full
page code but rather code snippets. To see a complete example have a look on the code of 
[live example](3_Eventful_building.live.html).

I'll show you complete listing of the new code now. It is pretty much self explaining but I'll cover 
every event in the following text.
	
	viewer.on('loaded', function () {
        //Hide any loaders you have used to keep your user excited 
        //while their precious models are being processed and loaded
        //and start the animation.
        viewer.start();
    });

    viewer.on('error', function (arg) {
        var container = document.getElementById('errors');
        if (container) {
            //preppend error report
            container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre> <br />" + container.innerHTML;
        }
    });

    viewer.on('fps', function (fps) {
        var span = document.getElementById('fps');
        if (span) {
            span.innerHTML = fps;
        }
    });
    
    var timer = 0;
    viewer.on('pick', function (args) {
        var id = args.id;

        var span = document.getElementById('productId');
        if (span) {
            span.innerHTML = id;
        }

        //you can use ID for funny things like hiding or 
        //recolouring which will be covered in one of the next tutorials

        var time = (new Date()).getTime();
        if (time - timer < 200)
            viewer.zoomTo(id);
        timer = time;
     
    });
    viewer.on('mouseDown', function (args) {
        viewer.setCameraTarget(args.id);
    });

So, let's have a look on the {@link xViewer#event:loaded loaded} event. It is the first one to occur 
and you are likely to use it to hide any loader images you may have used to keep users attention.
It is also better to start animation when model is loaded already. However, viewer won't crash
if you start it at any time. 

	viewer.on('loaded', function () {
        //Hide any loaders you have used to keep your user excited 
        //while their precious models are being processed and loaded
        //and start the animation.
        viewer.start();
    });

{@link xViewer#event:error Error} is very important event to listen to and you should listen to it 
all the time. You should still use try-catch statements but this might report some useful
information. It's up to you if you expose messages to user but you should watch it carefully.

    viewer.on('error', function (arg) {
        var container = document.getElementById('errors');
        if (container) {
            //preppend error report
            container.innerHTML = "<pre style='color:red;'>" + arg.message + "</pre> <br />" + container.innerHTML;
        }
    });

{@link xViewer#event:fps FPS} stands for 'frames per second'. This event is fired every 30<sup>th</sup> frame.
It is one of the performance indicators. Viewer's animation loop it bound to refresh of the browser screen
so it won't usually exceed 60fps. If you get bellow about 15fps user experience starts to be a bit sluggish.

    viewer.on('fps', function (fps) {
        var span = document.getElementById('fps');
        if (span) {
            span.innerHTML = fps;
        }
    });

{@link xViewer#event:pick Pick} is probably the most important user interaction event. It happens every time
when user clicks on the area of `<canvas>`. It's argument contains product ID which you can use for things
like selection, restyling and other interactive operations. This example also implements simple double click
handler which zooms to picked product. If user clicks out of the model ID is null.

    var timer = 0;
    viewer.on('pick', function (args) {
        var id = args.id;

        var span = document.getElementById('productId');
        if (span) {
            span.innerHTML = id;
        }

        //you can use ID for funny things like hiding or 
        //recolouring which will be covered in one of the next tutorials

        var time = (new Date()).getTime();
        if (time - timer < 200)
            viewer.zoomTo(id);
        timer = time;
     
    });

{@link xViewer#event:mouseDown Mouse down} is another user interaction event. It happens every time when mouseDown event
happens in `<canvas>`. It contains the same argument as {@link xViewer#event:pick pick} event which is product ID or null 
if user clicks to empty space.

    viewer.on('mouseDown', function (args) {
        viewer.setCameraTarget(args.id);
    });

You can inspect full code in [live example](3_Eventful_building.live.html).