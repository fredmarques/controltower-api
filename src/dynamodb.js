import uuid from 'node-uuid';
import flatten from 'flat';
import getValue from 'lodash.get';
import { unknownCustomerIdError, fbUserDeniedAccessError } from './errors';
const customersTable = 'ct_customers';
const botsTable = 'ct_bots';

const getCustomer = (dynamo, id, facebookId) => dynamo.get({
    TableName: customersTable,
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
const findCustomersByFacebookId = (dynamo, facebookId) => dynamo.query({
    TableName: customersTable,
    IndexName: 'facebookId-index',
    KeyConditionExpression: 'facebookId = :facebookId',
    ExpressionAttributeValues: { ':facebookId': facebookId }
}).promise().then(data => {
    if (data.Count > 0) {
        return data.Items;
    }
    return null;
});

const createCustomer = (dynamo, facebookId, name, email) => {
    const newCustomer = {
        id: uuid.v4(),
        facebookId,
        name,
        email,
        bots: []
    };
    return dynamo.put({
        TableName: customersTable,
        Item: newCustomer
    }).promise().then(() => newCustomer);
};

const registerBot = (dynamo, id, botId) => dynamo.update({
    TableName: customersTable,
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
        id: uuid.v4()
    };
    return dynamo.put({
        TableName: botsTable,
        Item: newBot
    }).promise().then(() =>
        registerBot(dynamo, customerId, newBot.id).then(() => newBot)
    );
};

const getBot = (dynamo, customerId, id) => dynamo.get({
    TableName: botsTable,
    Key: {
        customerId,
        id
    }
}).promise().then(data => data.Item);


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
    TableName: customersTable,
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
        TableName: botsTable,
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
    updateBot
};
