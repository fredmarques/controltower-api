import uuid from 'node-uuid';
import shortid from 'shortid';
import flatten from 'flat';
import getValue from 'lodash.get';
import {
    unknownCustomerIdError,
    fbUserDeniedAccessError,
    invalidIviteCodeError
} from './errors';
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

const createBot = (dynamo, customerId, botSchema) => {
    const newBot = {
        customerId,
        id: uuid.v4(),
        inviteCode: shortid.generate(),
        admins: [customerId],
        ...botSchema
    };
    return dynamo.put({
        TableName: BOTS_TABLE,
        Item: newBot
    }).promise().then(() =>
        registerBot(dynamo, customerId, newBot.id).then(() => newBot)
    );
};

const createUser = (dynamo, facebookId, botId, customerId, name) => {
    const newUser = {
        botId,
        id: uuid.v4(),
        facebookId,
        name
    };
    console.log('createUser', botId, customerId, newUser);
    return dynamo.put({
        TableName: USERS_TABLE,
        Item: newUser
    }).promise().then(() => newUser);
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

const getUser = (dynamo, botId, id) => dynamo.get({
    TableName: USERS_TABLE,
    Key: {
        botId,
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

const usersWithMutedBot = (dynamo, botId, botStatus) => dynamo.query({
    TableName: USERS_TABLE,
    IndexName: 'botStatus-botId-index',
    KeyConditionExpression: 'botId = :botId and botStatus = :botStatus',
    ExpressionAttributeValues: {
        ':botId': botId,
        ':botStatus': botStatus || 'muted'
    }
}).promise().then(data => data.Items);

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
const addAdminToBot = (dynamo, botOwnerId, botId, adminCustomerId) => {
    const dynamoUpdate = {
        TableName: BOTS_TABLE,
        Key: {
            customerId: botOwnerId,
            id: botId
        },
        UpdateExpression: 'SET admins = list_append(:adminId, admins)',
        ExpressionAttributeValues: {
            ':adminId': [adminCustomerId]
        },
        ReturnValues: 'ALL_NEW'
    };
    // add paramCustomerId to the list
    return dynamo.update(dynamoUpdate).promise().then(data => data.Attributes);
};
const updateBot = (dynamo, paramId, paramCustomerId, newValues) => {
    const { id, customerId, inviteCode, admins, ...others } = newValues;
    noop(id, customerId, inviteCode);
    let params = others;

    // special case, add an admin
    if (admins === 'me' && customerId) {
        return getBot(dynamo, customerId, paramId).then(bot => {
            if (inviteCode !== bot.inviteCode) {
                throw invalidIviteCodeError;
            }
            const isAdminAlready = bot.admins.indexOf(paramCustomerId) !== -1;
            if (isAdminAlready) {
                return bot;
            }
            return addAdminToBot(dynamo, customerId, paramId, paramCustomerId);
        });
    }

    // special case, regenerate invite code
    if (inviteCode === 'new') {
        params = Object.assign(params, { inviteCode: shortid.generate() });
    }

    // regular bot update
    return dynamo.update({
        TableName: BOTS_TABLE,
        Key: {
            customerId: paramCustomerId,
            id: paramId
        },
        ReturnValues: 'ALL_NEW',
        ...expressionParameters({ ...params })
    }).promise().then(data => data.Attributes);
};

const updateUser = (dynamo, paramId, paramBotId, newValues) => {
    const { id, botId, ...others } = newValues;
    noop(id, botId);
    return dynamo.update({
        TableName: USERS_TABLE,
        Key: {
            botId: paramBotId,
            id: paramId
        },
        ReturnValues: 'ALL_NEW',
        ...expressionParameters({ ...others })
    }).promise().then(data => data.Attributes);
};

// updates some attributes with the same new values for multiple users (given list of ids)
const batchUpdateUser = (dynamo, ids, botId, newValues) => {
    let calls = [];
    ids.forEach(id => {
        calls = calls.concat([updateUser(dynamo, id, botId, newValues)]);
    });
    return Promise.all(calls);
};

export {
    getCustomer,
    findCustomersByFacebookId,
    createCustomer,
    updateCustomer,
    createBot,
    getBot,
    updateBot,
    registerBot,
    createUser,
    getUser,
    updateUser,
    usersWithMutedBot,
    batchUpdateUser
};
