rem Generate JS file containing all shaders as a JS strings. Shaders are authored in *.c files which makes it easier for development and it has partially right syntax highlighting
Utilities\spacker.exe Viewer xbim-shaders.debug.js -min

rem Create debug bundle. It contains all JS source code in one file including all comments. This is easy to reference and still possible to debug
type Resources\xbim-disclaimer.txt > Build\xbim-viewer.debug.bundle.js
type Viewer\*.debug.js >> Build\xbim-viewer.debug.bundle.js
type Libs\webgl-utils.min.js >> Build\xbim-viewer.debug.bundle.js
type Libs\gl-matrix.min.js >> Build\xbim-viewer.debug.bundle.js
copy /y Libs\webgl-utils.min.js Build\webgl-utils.min.js
copy /y Libs\gl-matrix.min.js Build\gl-matrix.min.js

rem Create minified version of JS where all viewer JS files are minified and put in one file
type Resources\xbim-disclaimer.txt > Build\xbim-viewer.min.js
type Viewer\*.debug.js | Utilities\jsmin.exe >> Build\xbim-viewer.min.js

rem Create minified bundle for release deployment. It contains all xBIM viewer files as well as all libraries
type Build\xbim-viewer.min.js > Build\xbim-viewer.min.bundle.js
type Libs\webgl-utils.min.js >> Build\xbim-viewer.min.bundle.js
type Libs\gl-matrix.min.js >> Build\xbim-viewer.min.bundle.js

rem Copy new built files to the sample project to make sure it's running the with the latest source
xcopy /y Build\xbim-viewer.debug.bundle.js Resources\doctemplate\static\scripts
xcopy /y Build\xbim-browser.js Resources\doctemplate\static\scripts

rem Create build files for the browser
type Resources\xbim-disclaimer.txt > Build\xbim-browser.js
type Browser\*.debug.js >> Build\xbim-browser.js
type Resources\xbim-disclaimer.txt > Build\xbim-browser.min.js
type Browser\*.debug.js | Utilities\jsmin.exe >> Build\xbim-browser.min.js

rem Pack the NuGet package with the latest source
Utilities\NuGet.exe pack  WeXplorer.nuspec
