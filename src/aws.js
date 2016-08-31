import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';

import config from './config';

const api = new ApiBuilder();

AWS.config.update(config.AWS);

const testFilePath = config.testFilePath;

api.post('/setups/{setupId}', req => {
    const setupId = req.pathParams.setupId;
    console.log('request.pathParams.name', setupId);
    console.log('req.body', req.body);
    const s3 = new AWS.S3(config.S3);
    console.log('testFilePath', testFilePath);
    return s3.getObject({ Key: testFilePath }).promise()
    .then(contents => {
        console.log('testFileContents', contents);
        const body = contents.Body.toString();
        const result = `setupId: ${setupId}, contents: ${body}`;
        return result;
    });
});

export default api;
