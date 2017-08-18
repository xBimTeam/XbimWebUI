rem Generate fresh documentation
npm run jsdoc && ^

rem Build packages
SET NODE_ENV=development&& webpack -d && ^
SET NODE_ENV=production&& webpack -p && ^

rem Copy new built files to the sample project to make sure it's running the with the latest source
xcopy /y Build\xbim-viewer.js Resources\doctemplate\static\scripts\