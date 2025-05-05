process.env.BASE_URL = process.env.BASE_URL || 'https://auth-json-server.zapier.ninja';

const authentication = require('./authentication');

const team = require('./resources/team');
const project = require('./resources/project');
const task = require('./resources/task');
const tag = require('./resources/tag');
const rate = require('./resources/rate');
const report = require('./creates/report');

const includeBearerToken = (request, z, bundle) => {
    if (bundle.authData.access_token) {
        request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
    }
    return request;
};

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

// Finally, export the app.
module.exports = App;
