import config from '../config-sample';
import ApiBuilder from 'claudia-api-builder';
import AWS from 'aws-sdk';
import { getFbUser } from './facebook';
import {
    getCustomer,
    findCustomersByFacebookId,
    createCustomer,
    updateCustomer,
    createBot,
    getBot,
    updateBot,
    createUser,
    getUser,
    updateUser,
    usersWithMutedBot
} from './dynamodb';
import {
    noAuthorizationHeaderError,
    unknownCustomerIdError,
    unknownBotIdError
} from './errors';

const api = new ApiBuilder();
const dynamo = new AWS.DynamoDB.DocumentClient();

const FB_APP_SECRET = config.facebook.appSecret;

const ecommerceBot = {
    type: 'ecommerce',
    facebook: {},
    vtex: {}
};

// extract acess token from request header
const getAccessToken = req => {
    if (!req.normalizedHeaders.authorization) {
        throw noAuthorizationHeaderError;
    }
    return req.normalizedHeaders.authorization.slice('Bearer '.length);
};

// check if the acessToken is a valid Facebook token for the correct
// Facebook app and if so, return a Facebook user object
const auth = req => getFbUser(FB_APP_SECRET, getAccessToken(req));

const getParam = (req, paramName) => {
    if (req.pathParams && req.pathParams[paramName]) {
        return req.pathParams[paramName];
    }
    if (req.queryString && req.queryString[paramName]) {
        return req.queryString[paramName];
    }
    if (req.body && req.body[paramName]) {
        return req.body[paramName];
    }
    return null;
};

const authAndGetCustomer = req =>
    auth(req).then(fbUser => {
        const customerId = getParam(req, 'customerId');
        if (customerId) {
            return getCustomer(dynamo, customerId, fbUser.id);
        }
        return findCustomersByFacebookId(dynamo, fbUser.id).then(customers => {
            if (customers === null) {
                throw unknownCustomerIdError;
            }
            return getCustomer(dynamo, customers[0].id, fbUser.id);
        });
    }
);

// Get customer
api.get('/v1/customers/{customerId}', req =>
    authAndGetCustomer(req)
, {
    error: { contentType: 'text/plain' }
});

// Get bot
api.get('/v1/bots/{botId}', req =>
    authAndGetCustomer(req).then(customer =>
        getBot(dynamo, customer.id, req.pathParams.botId)
), {
    error: { contentType: 'text/plain' }
});

// Get users with muted bot
api.get('/v1/users', req =>
    authAndGetCustomer(req).then(customer =>
        getBot(dynamo, customer.id, getParam(req, 'botId')).then(bot =>
            usersWithMutedBot(dynamo, bot.id, getParam(req, 'botStatus'))
        )
), {
    error: { contentType: 'text/plain' }
});

// Get user
api.get('/v1/users/{userId}', req =>
    authAndGetCustomer(req).then(customer =>
        getBot(dynamo, customer.id, getParam(req, 'botId')).then(bot =>
            getUser(dynamo, bot.id, req.pathParams.userId)
        )
), {
    error: { contentType: 'text/plain' }
});

// Create customer
api.post('/v1/customers', req =>
    auth(req).then(fbUser =>
        findCustomersByFacebookId(dynamo, fbUser.id).then(customers => {
            if (customers !== null) {
                return customers[0];
            }
            return createCustomer(
                dynamo, fbUser.id, fbUser.name, fbUser.email
            ).then(customer =>
                createBot(dynamo, customer.id, ecommerceBot).then(bot =>
                    ({
                        ...customer,
                        bots: [bot.id]
                    })
                )
            );
        })
), {
    success: { code: 201 },
    error: { contentType: 'text/plain' }
});

// Create bot
api.post('/v1/bots', req =>
    authAndGetCustomer(req).then(customer =>
        createBot(dynamo, customer.id, ecommerceBot)
), {
    success: { code: 201 },
    error: { contentType: 'text/plain' }
});

// Create user
api.post('/v1/users', req =>
    authAndGetCustomer(req).then(customer =>
        getBot(dynamo, customer.id, getParam(req, 'botId')).then(bot =>
            // TODO check if the facebook ID is a valid one and include the user name
            createUser(dynamo, getParam(req, 'facebookId'), bot.id, customer.id)
        )
), {
    success: { code: 201 },
    error: { contentType: 'text/plain' }
});

// Update customer
api.put('/v1/customers/{customerId}', req =>
    authAndGetCustomer(req).then(customer =>
        updateCustomer(dynamo, customer.id, req.body)
), {
    error: { contentType: 'text/plain' }
});

// Update bot
api.put('/v1/bots/{botId}', req =>
    authAndGetCustomer(req).then(customer =>
        updateBot(dynamo, req.pathParams.botId, customer.id, req.body)
), {
    error: { contentType: 'text/plain' }
});

// Update user
api.put('/v1/users/{userId}', req =>
    authAndGetCustomer(req).then(customer =>
        getBot(dynamo, customer.id, getParam(req, 'botId')).then(bot => {
            if (!bot || !bot.id) {
                throw unknownBotIdError;
            }
            return updateUser(dynamo, req.pathParams.userId, bot.id, req.body);
        })
), {
    error: { contentType: 'text/plain' }
});

export default api;
