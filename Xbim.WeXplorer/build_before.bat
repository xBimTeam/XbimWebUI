rem Generate JS file containing all shaders as a TypeScript strings. Shaders are authored in *.c files which makes it easier for development and it has partially right syntax highlighting
Utilities\spacker.exe Viewer xbim-shaders.ts -typescript -min && ^
Utilities\spacker.exe Plugins\NavigationCube xbim-navigation-cube-shaders.ts -typescript -min -variable:xCubeShaders 