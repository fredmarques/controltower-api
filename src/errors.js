const formatError = message => JSON.stringify({
    error: {
        message
    }
});
const noAuthorizationHeaderError = formatError('No authorization header');
const unknownCustomerIdError = formatError('Invalid customerId');
const unknownBotIdError = formatError('Invalid botId');
const fbUserDeniedAccessError = (facebookId, customerId) => formatError(
    `The facebook user ${facebookId} is not allowed to acces data of customer ${customerId}`
);

export {
    noAuthorizationHeaderError,
    unknownCustomerIdError,
    fbUserDeniedAccessError,
    unknownBotIdError
};
