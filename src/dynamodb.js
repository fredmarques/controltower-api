import uuid from 'node-uuid';
import flatten from 'flat';
import getValue from 'lodash.get';
import { unknownCustomerIdError } from './errors';
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
}).promise();

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
        id: uuid.v4(),
        customerId
    };
    return dynamo.put({
        TableName: botsTable,
        Item: newBot
    }).promise().then(() =>
        registerBot(dynamo, customerId, newBot.id).then(() => newBot)
    );
};


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
    // the UpdateExpression string replacing reserved words with # placeholders
    const expression = reservedWords.reduce((prev, word) =>
        prev.replace(`${word} =`, `#${word} =`),
        `SET ${expressionParts.join(', ')}`
    );
    // ExpressionAttributeValues object that describes the placeholders
    const attributeNames = reservedWords.reduce((prev, word) =>
        Object.assign(prev, { [`#${word}`]: word }),
        {}
    );
    // ExpressionAttributeValues
    const values = keyListDot.reduce((prev, key, index) =>
        Object.assign(prev, { [`:${keyListUnder[index]}`]: getValue(update, key) }),
        {}
    );
    return {
        UpdateExpression: expression,
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


export {
    getCustomer,
    findCustomersByFacebookId,
    createCustomer,
    updateCustomer,
    createBot
};
