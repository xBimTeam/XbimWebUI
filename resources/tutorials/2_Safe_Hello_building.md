Live example [here](1_Hello_building.live.html)
------------

In the previous tutorial {@tutorial 1_Hello_building} I've mentioned that the viewer won't run on all devices with all browsers. That's right. We have decided to use the latest technologies
for the sake of efficiency and simplicity. There are several prerequisites browser should fulfil to be able to run the viewer. Don't give up 
at this point please! It will run on several years old PCs with Chrome or Mozilla and it will run on tablets and mobile devices. The main restriction
is about IE which doesn't support WebGL until IE11. To make your life easier viewer has a static function to check it's requirements.

	<script type="text/javascript">
        var check = Viewer.check();
        if (check.noErrors)
        {
			...
        }
    </script>

Easy! Just run this static function and it will report you any errors or warnings (sure, you won't get any most of the time).
[Result](Prerequisities.html) of this function contains list of warnings and list of errors you can use to report to unfortunate user why is his old 
and non-standard-compliant browser not supported. So, if we update our example from above we get the safe version here:

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Hello building!</title>
        <link href="css/layout.css" rel="stylesheet" />
        <script src="js/xbim.bundle.js"></script>
    </head>
    <body>
        <div id="content">
            <canvas id="viewer" width="500" height="300"></canvas>
            <script type="text/javascript">
                var check = Viewer.check();
                if (check.noErrors)
                {
                    var viewer = new Viewer('viewer');
                    viewer.load('data/SampleHouse.wexbim');
                    viewer.start();
                }
            </script>
        </div>    
    </body>
    </html>
    
Right, we might want to add some reporting to user now which could look like this:

	<script type="text/javascript">
        var check = Viewer.check();
        if (check.noErrors)
        {
			//start animation, listen to events and do all the funny stuff
        }
		else
		{
			var msg = document.getElementById('msg');
            msg.innerHTML = '';
			for(var i in check.errors)
			{
				var error = check.errors[i];
				msg.innerHTML += "<div style='color: red;'>" + error + "</div>";
			}
		}
    </script>

And that is all again. We are safe now. We won't try to do anything with obsolete browsers.