import fetch from 'node-fetch';

const fbApiUrl = 'https://graph.facebook.com';
const fbUserFields = 'id,name,email';

const getFbUser = accessToken => {
    const url = `${fbApiUrl}/me?access_token=${accessToken}&fields=${fbUserFields}`;
    return fetch(url)
    .then(res => res.json())
    .then(fbUser => {
        if (fbUser.error) {
            throw JSON.stringify(fbUser);
        }
        return fbUser;
    });
};

export {
    getFbUser
};
