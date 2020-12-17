Xbim WebUI
=========

Web components for xBIM Toolkit. [Documentation on GitHub Pages.](http://xbimteam.github.io/XbimWebUI/)


## Xbim toolkit

The xBIM Tookit (eXtensible Building Information Modelling) is an open-source, software development BIM toolkit that 
supports the BuildingSmart Data Model (aka the [Industry Foundation Classes IFC](http://en.wikipedia.org/wiki/Industry_Foundation_Classes)).

xBIM allows developers to read, create and view [Building Information (BIM)](http://en.wikipedia.org/wiki/Building_information_modeling) Models in the IFC format. 
There is full support for geometric, topological operations and visualisation. In addition xBIM supports 
bi-directional translation between IFC and COBie formats.

XbimWebUI is a Typescript/Javascript library which can be used for web presentation of BIM models. It uses WebGL and is independent of any third party WebGL framework. We did use SceneJS and other frameworks in past but this is independent of any of them. The viewer takes WexBIM data format as its input. This is our custom binary data format which can be [produced using core xBIM Libraries](http://docs.xbim.net/examples/creating-wexbim-file.html). Detailed documentation is available [**here**](http://docs.xbim.net/XbimWebUI/).

## Getting Started

To install the viewer into your project as an [npm package](https://www.npmjs.com/package/@xbim/viewer), just run

```
npm install @xbim/viewer
```


If you want to contribute or just play with the code, get the code and run

```
npm run start
```

Please note: all the samples in this solution are examples of how to use the Xbim library, and not intended to be used in a 
production environment without further development.

## Licence

The XBIM library is made available under the CDDL Open Source licence.  See the licences folder for a full text.

All licences should support the commercial usage of the XBIM system within a 'Larger Work', as long as you honour 
the licence agreements.

## Support & Help

Please use [GitHub issues](https://github.com/xBimTeam/XbimWebUI/issues) to ask any questions.

## Getting Involved

If you'd like to get involved and contribute to this project, please contact [Martin Cerny](https://www.linkedin.com/in/martin-cerny/) or the Project Coordinator([Steve Lockley](https://www.linkedin.com/in/prof-stephen-lockley-a1984614/)).
