const fs = require('fs');

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

let packageData = fs.readFileSync('package.json', 'utf8');
let pckg = JSON.parse(packageData);

// set patch to date-time based value
const d = new Date();
const stamp = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1, 2)}${pad(d.getUTCDate(), 2)}${pad(d.getUTCHours(),2)}${pad(d.getUTCMinutes(),2)}`;
// let version = pckg.version;
// let parts = version.split('.');
// parts[parts.length - 1] = stamp;
// pckg.version = parts.join('.');
pckg.version = `${pckg.version}-pre${stamp}`;

// remove scripts for publishing
delete pckg.scripts;

// remove development dependencies
delete pckg.devDependencies

packageData = JSON.stringify(pckg, null, 4);
fs.writeFileSync('dist/package.json', packageData, {encoding: 'utf8'});


