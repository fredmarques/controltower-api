import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';
import fetch from 'node-fetch';

const fbApiUrl = 'https://graph.facebook.com';
const fbUserFields = 'id,name,email';

const api = new ApiBuilder();
const dynamo = new AWS.DynamoDB.DocumentClient();

// Create a customer
api.post('/v1/customers', req => {
    const accessToken = req.body.accessToken;
    // test if the acessToken is a valid facebook token
    const url = `${fbApiUrl}/me?access_token=${accessToken}&fields=${fbUserFields}`;
    console.log('url', url);
    return fetch(url)
    .then(res => res.json())
    .then(fbUser => {
        if (fbUser.error) {
            throw JSON.stringify(fbUser);
        }
        // Check to see if there is already an user with this facebookId
        const facebookId = fbUser.id;
        const queryParams = {
            TableName: 'ct_customers',
            IndexName: 'facebookId-index',
            KeyConditionExpression: 'facebookId = :fbId',
            ExpressionAttributeValues: { ':fbId': facebookId },
            ProjectionExpression: 'id'
        };
        return dynamo.query(queryParams).promise()
        .then(data => {
            if (data.Count > 0) {
                const userId = data.Items[0].id;
                const errorMessage = ['The facebook id', facebookId,
                    'is already connected to an existing user'].join(' ');
                throw JSON.stringify({
                    error: {
                        message: errorMessage,
                        userId
                    }
                });
            }
            const id = uuid.v4();
            const newUser = {
                id,
                facebookId: fbUser.id,
                name: fbUser.name,
                email: fbUser.email,
                bots: []
            };
            const params = {
                TableName: 'ct_customers',
                Item: newUser
            };
            console.log(params);
            return dynamo.put(params).promise()
            .then(() => newUser);
        });
    });
}, {
    success: { code: 201 },
    error: { contentType: 'text/plain' }
});

// Create a bot
api.post('/v1/bots', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);

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
        .then(() => id);
}, {
    success: { code: 201 }
});

// Get bot config
api.get('/v1/bots/{botId}', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);
    const botId = req.pathParams.botId;
    return botId;
});

export default api;
