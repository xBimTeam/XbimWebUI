const fs = require('fs');



let packageData = fs.readFileSync('package.json', 'utf8');
let pckg = JSON.parse(packageData);

// set patch to date-time based value
const d = new Date();
const patch = `${d.getFullYear()}${d.getMonth()}${d.getDate()}${d.getHours()}${d.getMinutes()}`;
let version = pckg.version;
let parts = version.split('.');
parts[parts.length - 1] = patch;
pckg.version = parts.join('.');

// remove scripts for publishing
delete pckg.scripts;

// remove development dependencies
delete pckg.devDependencies

packageData = JSON.stringify(pckg, null, 4);
fs.writeFileSync('dist/package.json', packageData, {encoding: 'utf8'});


