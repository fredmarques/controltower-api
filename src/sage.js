import rp from 'request-promise';
import config from '../config-sample';

const SAGE_URL = config.sage.endpoint;

// Creates a new spell (training file) OK
const createSpell = (spellName, description) => {
    const options = {
        uri: `${SAGE_URL}/bots`,
        method: 'POST',
        json: {
            name: spellName,
            desc: description
        }
    };
    return rp(options)
        .then(body => {
            console.log('spellId: ', body.bot_id);
            return body.bot_id;
        })
        .catch(err => {
            console.log(err);
            return false;
        });
};


export {
    createSpell
};
