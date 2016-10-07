import fetch from 'node-fetch';
import crypto from 'crypto';

const fbApiUrl = 'https://graph.facebook.com';
const fbUserFields = 'id,name,email';

const tokenProof = (secret, accessToken) => {
    const signature = crypto.createHmac('sha256', secret).update(accessToken).digest('hex');
    return `appsecret_proof=${signature}&access_token=${accessToken}`;
};

const getFbUser = (secret, accessToken) => {
    const url = `${fbApiUrl}/me?fields=${fbUserFields}&${tokenProof(secret, accessToken)}`;
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
