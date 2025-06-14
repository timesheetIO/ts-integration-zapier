/**
 * @fileoverview Main entry point for Timesheet.io Zapier integration
 * @module index
 */

process.env.BASE_URL = process.env.BASE_URL || 'https://auth-json-server.zapier.ninja';

const authentication = require('./authentication');

// Import all resources
const team = require('./resources/team');
const project = require('./resources/project');
const task = require('./resources/task');
const tag = require('./resources/tag');
const rate = require('./resources/rate');
const report = require('./creates/report');

/**
 * Middleware to include Bearer token in all authenticated requests
 * @param {Object} request - The request object to modify
 * @param {Object} z - The Zapier object with utilities
 * @param {Object} bundle - The input bundle containing auth data
 * @returns {Object} Modified request object with Authorization header
 */
const includeBearerToken = (request, z, bundle) => {
    if (bundle.authData.access_token) {
        request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
    }
    return request;
};

/**
 * Main App configuration object for Zapier
 * @type {Object}
 * @property {string} version - App version from package.json
 * @property {string} platformVersion - Zapier platform core version
 * @property {Object} authentication - OAuth2 authentication configuration
 * @property {Array<Function>} beforeRequest - Middleware to run before each request
 * @property {Array<Function>} afterResponse - Middleware to run after each response
 * @property {Object} resources - Resource definitions for CRUD operations
 * @property {Object} triggers - Standalone trigger definitions
 * @property {Object} searches - Standalone search definitions
 * @property {Object} creates - Standalone create action definitions
 */
const App = {
    version: require('./package.json').version,
    platformVersion: require('zapier-platform-core').version,

    authentication: authentication,

    beforeRequest: [
        includeBearerToken
    ],

    afterResponse: [],

    // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
    resources: {
        [team.key]: team,
        [project.key]: project,
        [task.key]: task,
        [tag.key]: tag,
        [rate.key]: rate
    },

    // If you want your trigger to show up, you better include it here!
    triggers: {},

    // If you want your searches to show up, you better include it here!
    searches: {},

    // If you want your creates to show up, you better include it here!
    creates: {
        [report.key]: report
    }
};

module.exports = App;