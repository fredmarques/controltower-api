import uuid from 'node-uuid';

const customersTable = 'ct_customers';

const getCustomer = (dynamo, id) => dynamo.get({
    TableName: customersTable,
    Key: { id }
}).promise();

const findCustomersByFacebookId = (dynamo, facebookId) => dynamo.query({
    TableName: customersTable,
    IndexName: 'facebookId-index',
    KeyConditionExpression: 'facebookId = :facebookId',
    ExpressionAttributeValues: { ':facebookId': facebookId },
    ProjectionExpression: 'id'
}).promise();

const createCustomer = (dynamo, facebookId, name, email) => {
    const newUser = {
        id: uuid.v4(),
        facebookId,
        name,
        email,
        bots: []
    };
    return dynamo.put({
        TableName: customersTable,
        Item: newUser
    }).promise().then(() => newUser);
};

export {
    getCustomer,
    findCustomersByFacebookId,
    createCustomer
};
