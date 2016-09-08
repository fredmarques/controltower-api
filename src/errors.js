const existingFacebookIdError = (facebookId, userId) => ({
    error: {
        message: `The facebook id ${facebookId} is already connected to an existing user`,
        userId
    }
});

export {
    existingFacebookIdError
};
