import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';

const api = new ApiBuilder();

api.post('/v1/customers', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);
    // const accessToken = req.body.accessToken;
    return 'bar';
});

// Create a bot
api.post('/v1/bots', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);
    const dynamo = new AWS.DynamoDB.DocumentClient();

    const customerId = req.body.customerId;
    // TODO: check if customerId already existis in data table

    const id = uuid.v4();
    const params = {
        TableName: 'ct_bots',
        Item: {
            id,
            customerId
        }
    };
    return dynamo.put(params).promise()
    .then(() => id)
    .catch(err => {
        throw err;
    });
});

// Get bot config
api.post('/v1/bot/{botId}', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);
    const botId = req.pathParams.botId;
    return botId;
});

export default api;
