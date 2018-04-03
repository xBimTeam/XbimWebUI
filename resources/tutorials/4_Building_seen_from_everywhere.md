Live example [here](4_Building_seen_from_everywhere.live.html)
------------

In this tutorial we will explore Viewer's navigation, clipping and hiding. This should be enough to enable user
to inspect the building inside out with all the zooming, panning, orbiting and hiding of possible obstacles. 
You can see full live example [here](4_Building_seen_from_everywhere.live.html). 

I'll use ugly obtrusive code with javascript functions defined in *onclick* attributes of HTML elements. This is not the right practise
but I've done it this way for the sake of clarity and simplicity. You are ancouraged to follow 
[these guidlines](http://www.w3.org/wiki/The_principles_of_unobtrusive_JavaScript) to write sustainable
and clear web applications.

### Camera position and target

It is easy to set a camera target based on product ID. Probably the most common way to do that is to
set a target based on user action idicated by either {@link Viewer#event:pick pick} or {@link Viewer#event:mousedown mouse down} events.
This would be a good example:

	viewer.on('pick', function (args) {
        var id = args.id;
        viewer.setCameraTarget(id);
        pickedId = id;
    });

It is also easy to set a camera position with the {@link Viewer#setCameraPosition setCameraPosition()} method.
Following example uses HTML input to set the values but you will surely use some smart logic for intuitive and
fluent user experiance.

    <input type="text" id="camX" value="-15000" />
    <input type="text" id="camY" value="-15000" />
    <input type="text" id="camZ" value="15000" />
    <button onclick="SetCamera()">Set camera</button>
	<script type="text/javascript">
		function SetCamera() {
		    if (viewer) {
		        var iX = document.getElementById('camX');
		        var iY = document.getElementById('camY');
		        var iZ = document.getElementById('camZ');
		        viewer.setCameraPosition([iX.value, iY.value, iZ.value]);
		    }
		}
	</script>

It is always important to be able to show default axis aligned views to the model or it's parts. This is built-in
functionality of the Viewer. It always operates on the origin and distance set by {@link Viewer#setCameraTarget setCameraTarget()} method.
In the example camera target is set every time user picks an element as listed above. 

    <button onclick="if (viewer) viewer.show('front');">Front</button>
    <button onclick="if (viewer) viewer.show('back');">Back</button>
    <button onclick="if (viewer) viewer.show('top');">Top</button>
    <button onclick="if (viewer) viewer.show('bottom');">Bottom</button>
    <button onclick="if (viewer) viewer.show('left');">Left</button>
    <button onclick="if (viewer) viewer.show('right');">Right</button>

Since the first tutorial we were only using default navigation features of the viewer which are orbiting on left mouse
button, panning on middle button and zooming on scroll button. This should be intuitive. Just note that the best practise 
for the viewer is to have it on a single page with no vertical scroll bar. Zooming is hard otherwise because it zooms the model
and scrolls the site at the same time. It is possible to change the default behavior of the left button with the following code
should you wish to do that:

    <button onclick="if (viewer) viewer.navigationMode = 'orbit';">Orbit</button>
    <button onclick="if (viewer) viewer.navigationMode = 'free-orbit';">Free orbit</button>
    <button onclick="if (viewer) viewer.navigationMode = 'pan';">Pan</button>
    <button onclick="if (viewer) viewer.navigationMode = 'zoom';">Zoom</button>
    
	<button onclick="if (viewer) viewer.navigationMode = 'none';">Disable default navigation completely</button>

Default orbit mode is fixed orbit when model rotates around it's Z axis. You can also use free orbit which
rotates model around actual axes and is therefore more free. You can use this to have a look on the model
from unusual angles. Just as a hint - draw circles to adjust a horizont if necessary.

You can also disable the default navigation completely as you can see on the last line of the example 
and implement different navigation yourself. Friendly API is not prepared for that now but it is planned 
in the very next release.

### Clipping

It happens quite often that user wants to see something deep inside the building. Navigation inside of the building might
get complicated quite easily but if you can cut the building and see inside it makes user's life much easier. This is also built in
the viewer by default. You can either set the clipping plane yourself with {@link Viewer#clip clip()} method if you 
pass point on the plane and normal of the plane to the method or you can let user to define clipping plane interactively
if you call the method with no arguments. Use {@link Viewer#unclip unclip()} method than to discard clipping entirely.

	<button onclick="if (viewer) viewer.clip();">Interactive clipping</button>
    <button onclick="if (viewer) viewer.unclip();">Unclip</button> 

    <input type="text" id="clipOrigX" value="0" />
    <input type="text" id="clipOrigY" value="0" />
    <input type="text" id="clipOrigZ" value="0" />
    
	<input type="text" id="clipNormX" value="-1" />
    <input type="text" id="clipNormY" value="0" />
    <input type="text" id="clipNormZ" value="0" />
    
	<button onclick="Clip()">Clip</button>
	<script type="text/javascript">
		function Clip() {
            var oX = document.getElementById('clipOrigX').value;
            var oY = document.getElementById('clipOrigY').value;
            var oZ = document.getElementById('clipOrigZ').value;
                                                         
            var nX = document.getElementById('clipNormX').value;
            var nY = document.getElementById('clipNormY').value;
            var nZ = document.getElementById('clipNormZ').value;

            if (viewer)
                viewer.clip([oX, oY, oZ], [nX, nY, nZ]);
        }
	</script>

### Hiding

Right, so we can clip the model and see it's internals. That's impressive isn't it? But sometimes you also need
to hide only one element or one type of elements, let's say all walls. This is possible by setting state of the 
product with {@link Viewer#setState setState()} method. Use {@link Viewer#resetStates resetStates()} method
to reset all states to default. This method has an optional parameter which you can use to also show spaces. These
are hidden by default unless you show them manualy.

	<select id="cmbHide">
        <option value="noAction">No action</option>
        <option value="hideProduct">Hide product</option>
        <option value="hideType">Hide type</option>
        <option value="highlight">Highlight</option>
    </select>
    <button onclick="if (viewer) viewer.resetStates()">Show all</button>
    <script type="text/javascript">
        function initHiding() {
            viewer.on('pick', function (args) {
                var cmb = document.getElementById('cmbHide');
                var option = cmb.value;
                switch (option) {
                    case 'hideProduct':
                        viewer.setState(xState.HIDDEN, [args.id]);
                        break;
                    case 'hideType':
                        var type = viewer.getProductType(args.id);
                        viewer.setState(xState.HIDDEN, type);
                        break;
					case 'highlight':
                        viewer.setState(xState.HIGHLIGHTED, [args.id]);
                        break;
                    default:
                        break;
                }
            });
        };
    </script> 

###X-Ray rendering mode

You have probably noticed there is one more option and that is *Highlight*. Highlighting is built in core 
of the engine and it is very useful if you need to visually highlight or isolate some objects in your model.
It is particularly useful in combination with x-ray rendering mode where everything is rendered in semitransparent
light blue except for the products which has a state *xState.HIGHLIGHTED* or *xState.XRAYVISIBLE*. To switch
between normal and x-ray rendering mode just set {@link Viewer#renderingMode renderingMode} property of the {@link Viewer Viewer}.
	
	<div>
		Rendering mode
		<label>
		    <input type="radio" name="rRenderingMode" checked="checked" 
				onchange="if (viewer) viewer.renderingMode = 'normal';"/> 
			Normal
		</label>
		<label>
		    <input type="radio" name="rRenderingMode" 
				onchange="if (viewer) viewer.renderingMode = 'x-ray';" /> 
			X-Ray
		</label>
	</div>

And this is the end of this tutorial. I bet you have lots of ideas how to create slick user interface to
make use of all these features. So, go on. If you still have a stamina to learn something more you can
also have a look on the next tutorial called {@tutorial 5_Colourful_building} which will rescribe restyling 
of the model which you can use to visualize results of the analyses as well as just for fun.