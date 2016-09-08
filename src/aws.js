import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';
import { getFbUser } from './facebook';
import { findCustomersByFacebookId, createCustomer } from './dynamodb';
import { existingFacebookIdError } from './errors';

const api = new ApiBuilder();
const dynamo = new AWS.DynamoDB.DocumentClient();

// Create a customer
api.post('/v1/customers', req => {
    const accessToken = req.body.accessToken;
    // check if the acessToken is a valid facebook token
    // then check if there is already a customer connected to that facebookId
    // and if not, create the new customer
    return getFbUser(accessToken).then(fbUser =>
        findCustomersByFacebookId(dynamo, fbUser.id).then(data => {
            if (data.Count > 0) {
                throw JSON.stringify(
                    existingFacebookIdError(fbUser.id, data.Items[0].id)
                );
            }
            return createCustomer(dynamo, fbUser.id, fbUser.name, fbUser.email);
        })
    );
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
