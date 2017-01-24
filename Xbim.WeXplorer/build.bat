rem Generate JS file containing all shaders as a TypeScript strings. Shaders are authored in *.c files which makes it easier for development and it has partially right syntax highlighting
Utilities\spacker.exe Viewer xbim-shaders.ts -typescript -min
Utilities\spacker.exe Plugins\NavigationCube xbim-navigation-cube-shaders.ts -typescript -min -variable:xCubeShaders

rem Generate browser JavaScript bundle with global variables of the complete project
npm run webpack:browser
rem Generate UMD bundle of the complete project
npm run webpack

rem Copy new built files to the sample project to make sure it's running the with the latest source
xcopy /y Build\xbim.browser.bundle.js Resources\doctemplate\static\scripts
xcopy /y Build\xbim.browser.bundle.js.map Resources\doctemplate\static\scripts
