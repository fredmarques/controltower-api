import uuid from 'node-uuid';
import flatten from 'flat';
import getValue from 'lodash.get';
import { unknownCustomerIdError, fbUserDeniedAccessError } from './errors';
const CUSTOMERS_TABLE = 'ct_customers';
const BOTS_TABLE = 'ct_bots';
const USERS_TABLE = 'ct_users';

// Create (customer, bot, user)

const createCustomer = (dynamo, facebookId, name, email) => {
    const newCustomer = {
        id: uuid.v4(),
        facebookId,
        name,
        email,
        bots: []
    };
    return dynamo.put({
        TableName: CUSTOMERS_TABLE,
        Item: newCustomer
    }).promise().then(() => newCustomer);
};

const registerBot = (dynamo, id, botId) => dynamo.update({
    TableName: CUSTOMERS_TABLE,
    Key: { id },
    UpdateExpression: 'SET bots = list_append(:botId, bots)',
    ExpressionAttributeValues: {
        ':botId': [botId]
    },
    ReturnValues: 'ALL_NEW'
}).promise().then(data => data.Attributes);

const createBot = (dynamo, customerId) => {
    const newBot = {
        customerId,
        id: uuid.v4(),
        users: []
    };
    return dynamo.put({
        TableName: BOTS_TABLE,
        Item: newBot
    }).promise().then(() =>
        registerBot(dynamo, customerId, newBot.id).then(() => newBot)
    );
};

const registerUser = (dynamo, id, customerId, userId) => dynamo.update({
    TableName: BOTS_TABLE,
    Key: {
        customerId,
        id
    },
    UpdateExpression: 'SET #users = list_append(:userId, #users)',
    ExpressionAttributeNames: {
        '#users': 'users'
    },
    ExpressionAttributeValues: {
        ':userId': [userId]
    },
    ReturnValues: 'ALL_NEW'
}).promise().then(data => data.Attributes);

const createUser = (dynamo, facebookId, botId, customerId) => {
    const newUser = {
        botId,
        id: uuid.v4(),
        facebookId
    };
    console.log('createUser', botId, customerId, newUser);
    return dynamo.put({
        TableName: USERS_TABLE,
        Item: newUser
    }).promise().then(() =>
        registerUser(dynamo, botId, customerId, newUser.id).then(() => newUser)
    );
};

// Get (customer, bot, user)

const getCustomer = (dynamo, id, facebookId) => dynamo.get({
    TableName: CUSTOMERS_TABLE,
    Key: { id }
}).promise().then(data => {
    if (!data.Item) {
        throw unknownCustomerIdError;
    }
    if (data.Item.facebookId !== facebookId) {
        throw fbUserDeniedAccessError(facebookId, id);
    }
    return data.Item;
});

const getBot = (dynamo, customerId, id) => dynamo.get({
    TableName: BOTS_TABLE,
    Key: {
        customerId,
        id
    }
}).promise().then(data => data.Item);

// Query

const findCustomersByFacebookId = (dynamo, facebookId) => dynamo.query({
    TableName: CUSTOMERS_TABLE,
    IndexName: 'facebookId-index',
    KeyConditionExpression: 'facebookId = :facebookId',
    ExpressionAttributeValues: { ':facebookId': facebookId }
}).promise().then(data => {
    if (data.Count > 0) {
        return data.Items;
    }
    return null;
});

// Update

// generates DynamoDB's
// UpdateExpression, ExpressionAttributeNames and ExpressionAttributeValues
// parameters from a given javascript object containing the values to be updated
const expressionParameters = update => {
    // for the complete list see
    // http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
    const reservedWords = [
        'name'
    ];
    // all flattened keys using dotted notation
    const keyListDot = Object.keys(flatten(update, { delimiter: '.' }));
    // all flattened keys using underscore as the delimiter
    const keyListUnder = Object.keys(flatten(update, { delimiter: '_' }));
    // all attributes that needs to be set
    const expressionParts = keyListDot.map((key, index) =>
        `${key} = :${keyListUnder[index]}`);
    // the UpdateExpression string without # placeholders
    const expression = `SET ${expressionParts.join(', ')}`;
    // ExpressionAttributeValues
    const values = keyListDot.reduce((prev, key, index) =>
        Object.assign(prev, { [`:${keyListUnder[index]}`]: getValue(update, key) }),
        {}
    );
    // replace reserved words with # placeholders
    let replacedWords = [];
    let finalExpression = expression;
    reservedWords.forEach(word => {
        const needle = `([ \.])${word}([ \.])`;
        const re = new RegExp(needle, 'g');
        if (re.test(finalExpression)) {
            finalExpression = finalExpression.replace(re, `$1#${word}$2`);
            replacedWords = replacedWords.concat(word);
        }
    });
    if (replacedWords.length === 0) {
        return {
            UpdateExpression: finalExpression,
            ExpressionAttributeValues: values
        };
    }
    // ExpressionAttributeValues object that describes the placeholders
    const attributeNames = replacedWords.reduce((prev, word) =>
        Object.assign(prev, { [`#${word}`]: word }),
        {}
    );
    return {
        UpdateExpression: finalExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: values
    };
};

const updateCustomer = (dynamo, id, newValues) => dynamo.update({
    TableName: CUSTOMERS_TABLE,
    Key: { id },
    ReturnValues: 'ALL_NEW',
    ...expressionParameters(newValues)
}).promise().then(data => data.Attributes);

const noop = () => null;
const updateBot = (dynamo, paramId, paramCustomerId, newValues) => {
    const { id, customerId, ...others } = newValues;
    noop(id, customerId);
    return dynamo.update({
    // return {
        TableName: BOTS_TABLE,
        Key: {
            customerId: paramCustomerId,
            id: paramId
        },
        ReturnValues: 'ALL_NEW',
        ...expressionParameters({ ...others })
    }).promise().then(data => data.Attributes);
    // };
};

export {
    getCustomer,
    findCustomersByFacebookId,
    createCustomer,
    updateCustomer,
    createBot,
    getBot,
    updateBot,
    createUser
};
