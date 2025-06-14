/**
 * @fileoverview OAuth2 authentication configuration for Timesheet.io Zapier integration
 * @module authentication
 */

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param {Object} z - The Zapier object with utilities
 * @param {Object} bundle - The input bundle containing request data
 * @param {string} bundle.inputData.code - OAuth2 authorization code from redirect
 * @param {string} bundle.inputData.redirect_uri - The redirect URI used in authorization
 * @returns {Promise<Object>} Object containing access_token and refresh_token
 * @throws {Error} When token exchange fails
 */
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
            throw new z.errors.Error('Unable to fetch access token: ' + response.content);
        }

        return {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
        };
    });
};

/**
 * Refreshes an expired access token using the refresh token
 * @param {Object} z - The Zapier object with utilities
 * @param {Object} bundle - The input bundle containing auth data
 * @param {string} bundle.authData.refresh_token - The refresh token to use
 * @returns {Promise<Object>} Object containing new access_token
 * @throws {RefreshAuthError} When refresh fails (triggers re-authentication)
 */
const refreshAccessToken = (z, bundle) => {
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
            grant_type: 'refresh_token',
            refresh_token: bundle.authData.refresh_token
        }
    });

    return promise.then((response) => {
        if (response.status !== 200) {
            throw new z.errors.RefreshAuthError('Unable to refresh access token: ' + response.content);
        }

        return {
            access_token: response.data.access_token
        };
    });
};

/**
 * Tests the authentication by fetching the user's profile
 * @param {Object} z - The Zapier object with utilities
 * @param {Object} bundle - The input bundle containing auth data
 * @returns {Promise<Object>} User profile data including email
 * @throws {Error} When authentication is invalid
 */
const testAuth = (z, bundle) => {
    const promise = z.request({
        method: 'GET',
        url: 'https://api.timesheet.io/v1/profiles/me',
    });

    return promise.then((response) => {
        if (response.status === 401) {
            throw new z.errors.Error('The access token you supplied is not valid');
        }
        return response.data;
    });
};

/**
 * OAuth2 authentication configuration
 * @type {Object}
 * @property {string} type - Authentication type (oauth2)
 * @property {Object} oauth2Config - OAuth2 specific configuration
 * @property {Object} oauth2Config.authorizeUrl - Authorization endpoint configuration
 * @property {Function} oauth2Config.getAccessToken - Token exchange function
 * @property {Function} oauth2Config.refreshAccessToken - Token refresh function
 * @property {boolean} oauth2Config.autoRefresh - Enable automatic token refresh
 * @property {Function} test - Authentication test function
 * @property {string} connectionLabel - Template for connection display name
 */
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