
const formatError = (name, message) => JSON.stringify({
    error: {
        message,
        name
    }
});
const noAuthorizationHeaderError = formatError(
    'noAuthorizationHeaderError', 'No authorization header');
const unknownCustomerIdError = formatError(
    'unknownCustomerIdError', 'Invalid customerId');
const unknownBotIdError = formatError(
    'unknownBotIdError', 'Invalid botId');
const fbUserDeniedAccessError = (facebookId, customerId) => formatError(
    'fbUserDeniedAccessError',
    `The facebook user ${facebookId} is not allowed to acces data of customer ${customerId}`
);
const invalidIviteCodeError = formatError(
    'invalidIviteCodeError', 'Invalid invite code');

const customerNotAdminError = formatError(
    'customerNotAdminError', 'You are not on the admins team for this bot');

export {
    noAuthorizationHeaderError,
    unknownCustomerIdError,
    fbUserDeniedAccessError,
    unknownBotIdError,
    invalidIviteCodeError,
    customerNotAdminError
};
