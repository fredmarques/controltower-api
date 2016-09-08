const noAuthorizationHeaderError = 'No authorization header';
const existingFacebookIdError = (facebookId, userId) => ({
    error: {
        message: `The facebook id ${facebookId} is already connected to an existing user`,
        userId
    }
});

export {
    noAuthorizationHeaderError,
    existingFacebookIdError
};
