const getAccessToken = (z, bundle) => {
    const promise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/oauth2/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json'
        },
        body: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: bundle.inputData.code,
            redirect_uri: bundle.inputData.redirect_uri,
            grant_type: 'authorization_code'
        }
    });

    return promise.then((response) => {
        if (response.status !== 200) {
            throw new Error('Unable to fetch access token: ' + response.content);
        }

        const result = JSON.parse(response.content);
        return {
            access_token: result.access_token,
            refresh_token: result.refresh_token
        };
    });
};

const refreshAccessToken = (z, bundle) => {
    const promise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/oauth2/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json'

        },
        body: {
            grant_type: 'refresh_token',
            refresh_token: bundle.authData.refresh_token
        }
    });


    return promise.then((response) => {
        if (response.status !== 200) {
            throw new Error('Unable to fetch access token: ' + response.content);
        }

        const result = JSON.parse(response.content);
        return {
            access_token: result.access_token
        };
    });
};

const testAuth = (z, bundle) => {
    const promise = z.request({
        method: 'GET',
        url: 'https://api.timesheet.io/v1/profiles/me',
    });

    return promise.then((response) => {
        if (response.status === 401) {
            throw new Error('The access token you supplied is not valid');
        }
        return response.data;
    });
};

module.exports = {

    type: 'oauth2',

    oauth2Config: {

        authorizeUrl: {
            url: 'https://api.timesheet.io/oauth2/auth',
            method: 'GET',
            params: {
                client_id: '{{process.env.CLIENT_ID}}',
                state: '{{bundle.inputData.state}}',
                redirect_uri: '{{bundle.inputData.redirect_uri}}',
                response_type: 'code'
            }
        },

        getAccessToken: getAccessToken,

        refreshAccessToken: refreshAccessToken,

        autoRefresh: true
    },

    test: testAuth,
    connectionLabel: '{{email}}'
};
