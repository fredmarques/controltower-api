import { cd, cp, sed } from 'shelljs';

const filesField = `  "files": [
    "aws.js",
    "dynamodb.js",
    "errors.js",
    "facebook.js"
],`;

cd('dist/aws');
cp('../npm/*.js', '.');
cp('../npm/package.json', '.');
sed('-i', /^{/, `{${filesField}`, 'package.json');
