import { cd, cp, exec, sed } from 'shelljs';

const filesField = '  "files": ["aws.js","config.js"],';

exec('node_modules/.bin/babel --out-file dist/aws/config.js config.js');
cd('dist/aws');
cp('../npm/aws.js', '.');
cp('../npm/package.json', '.');
sed('-i', /^{/, `{${filesField}`, 'package.json');
