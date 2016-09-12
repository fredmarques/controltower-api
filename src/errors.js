const formatError = message => JSON.stringify({
    error: {
        message
    }
});
const noAuthorizationHeaderError = formatError('No authorization header');
const unknownCustomerIdError = formatError('Invalid customerId');

export {
    noAuthorizationHeaderError,
    unknownCustomerIdError
};
