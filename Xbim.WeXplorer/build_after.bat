rem Generate all bundles of the complete project and of independent parts
npm run webpack && ^

rem Generate fresh documentation
npm run jsdoc && ^

rem Copy new built files to the sample project to make sure it's running the with the latest source
xcopy /y Build\xbim.bundle.js Resources\doctemplate\static\scripts\
xcopy /y Build\xbim.bundle.js.map Resources\doctemplate\static\scripts\
