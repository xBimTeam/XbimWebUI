Live example [here](5_Colourful_building.live.html)
------------

This tutorial will focus on colour presentation of the model. As you have noticed models have a sensible graphical representation
by default. This is taken from IFC model to it should look about the same in all the tools and it should look the same as in your
or your user's authoring environment. But it is important to be able to chenge this representation sometimes to report some kind
of results to the user (classification, error reporting, clash detection etc.). This will be covered in this short tutorial. You can have 
a look on full sample demo [here](5_Colourful_building.live.html).

I'll use ugly obtrusive code with javascript functions defined in *onclick* attributes of HTML elements. This is not the right practise
but I've done it this way for the sake of clarity and simplicity. You are ancouraged to follow 
[these guidlines](http://www.w3.org/wiki/The_principles_of_unobtrusive_JavaScript) to write sustainable
and clear web applications.

First of all it is necessary to define your styles. There is simple function {@link xViewer#defineStyle defineStyle()} to do that.
You can define up to 224 styles. Because I don't have any results to show let's make it random. We'll define new colour for every
product type in the following code:

	<button onclick="Recolour()">Recolour by type</button>
    <button onclick="if (viewer) viewer.resetStyles();">Reset styles</button>
    <script type="text/javascript">
        function Recolour() {
            if (!viewer) return;
            var index = 0;
            for (var i in ProductType) {
                var type = ProductType[i];
                if (!/^[0-9]+$/.test(type)) {
                    continue;
                }
                var colour = [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255];
                viewer.defineStyle(index, colour);
                viewer.setStyle(index, type);
                index++;
            }
        };
    </script>

This is it. You can extend this example as you wish. Just define 0 - 224 colour styles and set them as an overlay style to product
or to type of products. If you want to reset styles to their default use {@link Viewer#resetStyles resetStyles()} function.

There is one more visual feature of the viewer and that is highlighting. You can think about it as a selection but it is not that
clever. It leaves all the eventual selection logic up to you. This is just a visual representation. It is hence ruther *state* than *style*.
You can use it exactly the same way as you did in the last tutorial '{@tutorial 4_Building_seen_from_everywhere}':

	<select id="cmbSelection">
        <option value="noAction">No action</option>
        <option value="select">Select</option>
    </select>
    <button onclick="if (viewer) viewer.resetStates()">Reset</button>
    <script type="text/javascript">
        function initHighlighting() {
            viewer.on('pick', function (args) {
                var cmb = document.getElementById('cmbSelection');
                var option = cmb.value;
                switch (option) {
                    case 'select':
                        viewer.setState(State.HIGHLIGHTED, [args.id]);
                        break;
					case 'hide':
                        viewer.setState(State.HIDDEN, [args.id]);
                        break;
                    default:
                        break;
                }
            });
        };
    </script>

Nice feature of this approach is that highlighting is separated from alternative visual appearance. You can't have a product highlighted and
hidden at the same time but that makes a sense. Important thing is that you can show results of the analyses and do selection at the same time.
And if you discard selection you still have a valid results representation. You can generally combine *styles* and *states* in any way.
