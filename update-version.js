const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json');
let versionData = { version: "1.0.0" };

if (fs.existsSync(versionFilePath)) {
    versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
}

// Increment patch version (major.minor.patch)
const parts = versionData.version.split('.').map(Number);
parts[2] += 1;
versionData.version = parts.join('.');
versionData.buildDate = new Date().toISOString();

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 4));
console.log(`Updated to version: ${versionData.version}`);
