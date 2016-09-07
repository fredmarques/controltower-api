import ApiBuilder from 'claudia-api-builder';
const api = new ApiBuilder();

api.post('/v1/customers', req => {
    console.log('request.pathParams', JSON.stringify(req.pathParams));
    console.log('req.body', req.body);
    // const accessToken = req.body.accessToken;
    return 'bar';
});

export default api;
