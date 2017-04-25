rem Utilities\TypingsBundler.exe Build

rem Generate fresh documentation
rem npm run jsdoc && ^

rem Build packages
rem SET NODE_ENV=development&& webpack -d && ^
rem SET NODE_ENV=production&& webpack -p && ^

rem Copy new built files to the sample project to make sure it's running the with the latest source
rem xcopy /y Build\xbim-viewer.js Resources\doctemplate\static\scripts\
rem xcopy /y Build\xbim-browser.js Resources\doctemplate\static\scripts\