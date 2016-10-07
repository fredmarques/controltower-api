import { cd, cp, sed, exec } from 'shelljs';

const filesField = `  "files": [
    "config.js",
    "aws.js",
    "dynamodb.js",
    "errors.js",
    "facebook.js"
],`;

exec('node_modules/.bin/babel --out-file dist/aws/config.js config.js');
cd('dist/aws');
cp('../npm/*.js', '.');
cp('../npm/package.json', '.');
sed('-i', /^{/, `{${filesField}`, 'package.json');

sed('-i', '../config-sample', './config', 'aws.js');
