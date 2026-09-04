#!/usr/bin/env node
// Syncs the version declared in package.json (single source of truth) into
// android/app/build.gradle (versionName) and the hardcoded version texts in
// www/index.html (Help screen + About modal). Run with `npm run sync-version`
// after bumping package.json's "version" field.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;

if (!version) {
    console.error('No version found in package.json');
    process.exit(1);
}

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const { regex, replacement, label } of replacements) {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
        } else {
            console.warn(`  [warn] pattern not found for "${label}" in ${filePath}`);
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.relative(root, filePath)}`);
    }
    return changed;
}

replaceInFile(path.join(root, 'android', 'app', 'build.gradle'), [
    { regex: /versionName\s+"[^"]*"/, replacement: `versionName "${version}"`, label: 'versionName' }
]);

replaceInFile(path.join(root, 'www', 'index.html'), [
    { regex: /(Versión )\d+\.\d+\.\d+/, replacement: `$1${version}`, label: 'Help screen version' },
    { regex: /(SmartFinance ver\. )\d+\.\d+\.\d+/, replacement: `$1${version}`, label: 'About modal version' }
]);

console.log(`\nSmartFinance version synced to ${version}.`);
console.log('Reminder: bump "versionCode" in android/app/build.gradle manually for each release build (Android build-number, unrelated to semver).');
