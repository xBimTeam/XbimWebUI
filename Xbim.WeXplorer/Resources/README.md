xBIM WeXplorer
==============

WeXplorer is the visualization part of xBIM toolkit that deals with visualization of IFC data on web using preprocessed wexBIM file. 
It uses cutting edge web technologies like WebGL so it is not supposed to work in old browsers but should work very well with Chrome or 
Mozzilla since 2011, IE11 and others with support for this technology. Use xBIM Essentials and xBIM Geometry to create optimized and 
compressed wexBIM files for visualization. WeXplorer also contains [xBrowser](xBrowser.html) for visualization of COBieLite data from JSON.


The main classes which exposes all necessary API calls are [xViewer](xViewer.html) for 3D visualization and [xBrowser](xBrowser.html) for
visualization of semantic data from COBie. These are the only two class you need to load and render IFC models in wexBIM format and to browse
related semantic data. If you have a WebGL enabled browser and you are looking at this documentation fron web, you should be able to see an
example of 3D browser at the very bottom of this page.

This viewer is part of xBIM toolkit which can be used to create wexBIM files from IFC, ifcZIP and ifcXML. WexBIM files are highly optimized for
transmition over internet and rendering performance. Viewer uses WebGL technology for hardware accelerated 3D rendering and SVG for
certain kinds of user interaction. This means that it won't work with obsolete and non-standard-compliant browsers like IE10 and less.
COBieLite JSON files can also be created using [xBIM](https://github.com/xBimTeam/XbimExchange). 

xBIM
----

[xBIM](https://github.com/xBimTeam) is an [Open Source Toolkit](http://www.openbim.org) for developing IFC based applications (BuildingSmart Data model). 
It provides full support for reading and writing geometry, topology and data in accordance with the Ifc2x3 schema.
xBIM reads and writes IFC, IfcXMl and IfcZip formats. The xBIM project provides packages to convert IFC models to COBie 
spreadsheets in both UK and US cultures as well as a range of 3D viewing controls for use with Windows forms, WPF, WEBGL and OpenGL platforms.
IOS and Android versions are under development.

Simple example...
-----------------

	<!DOCTYPE html>
	<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
	    <title>Hello building!</title>
	    <script src="js/xbim-viewer.debug.bundle.js"></script>
	</head>
	<body>
	    <div id="content">
	        <canvas id="viewer" width="500" height="300"></canvas>
	        <script type="text/javascript">
	            var viewer = new xViewer('viewer');
	            viewer.load('data/SampleHouse.wexbim');
	            viewer.start();
	        </script>
	    </div>    
	</body>
	</html>

You can find more examples in tutorials or try to find your answers in the API documentation.