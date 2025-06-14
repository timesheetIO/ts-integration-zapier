/**
 * @fileoverview Project resource definition for Timesheet.io Zapier integration
 * @module resources/project
 */

/**
 * Fetches a single project by ID
 * @param {Object} z - The Zapier object with utilities
 * @param {Object} bundle - The input bundle
 * @param {string} bundle.inputData.id - Project ID to fetch
 * @returns {Promise<Object>} Project data
 */
const getProject = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/projects/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => response.data);
};

/**
 * Generic function to list projects with various sorting options
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @param {string} status - Project status filter (all, active, archived)
 * @param {string} sort - Sort field (created, alpha, updated)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Promise<Array>} Array of projects
 */
const listProjects = (z, bundle, status, sort, order) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/projects',
        params: {
            limit: 20,
            page: bundle.meta.page + 1,
            status: status,
            sort: sort,
            order: order
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

/**
 * Lists latest projects sorted by creation date
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @returns {Promise<Array>} Array of latest projects
 */
const latestProjects = (z, bundle) => {
    return listProjects(z, bundle, 'all', 'created', 'desc');
};

/**
 * Lists projects sorted alphabetically by title
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @returns {Promise<Array>} Array of projects sorted by title
 */
const listProjectsByTitle = (z, bundle) => {
    return listProjects(z, bundle, 'all', 'alpha', 'asc');
};

/**
 * Searches for projects by text query
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @param {string} bundle.inputData.text - Search query
 * @returns {Promise<Array>} Array of matching projects
 */
const searchProjects = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/projects/search',
        body: {
            search: bundle.inputData.text,
            limit: 20,
            page: bundle.meta.page + 1
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

/**
 * Creates a new project
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @param {string} bundle.inputData.title - Project title
 * @param {string} bundle.inputData.employer - Employer/client name
 * @param {string} [bundle.inputData.description] - Project description
 * @param {string} [bundle.inputData.office] - Office location
 * @param {number} [bundle.inputData.salary] - Project salary/rate
 * @param {string} [bundle.inputData.color] - Project color in hex format
 * @param {string} [bundle.inputData.teamId] - Team ID to assign project to
 * @returns {Promise<Object>} Created project data
 */
const createProject = (z, bundle) => {
    let data = {
        method: 'POST',
        url: 'https://api.timesheet.io/v1/projects',
        body: {
            title: bundle.inputData.title,
            employer: bundle.inputData.employer,
            description: bundle.inputData.description,
            office: bundle.inputData.office,
            salary: bundle.inputData.salary,
            color: bundle.inputData.color
        }
    };
    if (bundle.inputData.teamId) {
        data.body.teamId = bundle.inputData.teamId;
    }
    return z.request(data).then(response => response.data);
};

/**
 * Dynamic field generator for team selection
 * Shows team field only if user has activated teams
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @returns {Promise<Array>} Array of dynamic field definitions
 */
const teamFields = (z, bundle) => {
    const responsePromise = z.request({
        method: 'GET',
        url: 'https://api.timesheet.io/v1/profiles/me'
    });
    return responsePromise
        .then(response => {
            const profile = response.data;
            if (profile.activatedTeams) {
                return [{
                    key: 'teamId',
                    label: 'Team',
                    helpText: 'Team of this Project',
                    type: 'string',
                    required: true,
                    dynamic: 'team.id.name'
                }];
            } else {
                return [];
            }
        });
};

/**
 * Subscribes to project creation webhook
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @param {string} bundle.targetUrl - Webhook target URL
 * @returns {Promise<Object>} Webhook subscription data
 */
const subscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/webhooks',
        method: 'POST',
        body: {
            target: bundle.targetUrl,
            event: 'project.create'
        }
    });
    return responsePromise
        .then(response => response.data);
};

/**
 * Unsubscribes from project webhook
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The input bundle
 * @param {string} [bundle.subscribeData.id] - Webhook ID to unsubscribe
 * @returns {Promise<Object>} Unsubscribe confirmation
 */
const unsubscribeHook = (z, bundle) => {
    if (!bundle.subscribeData || !bundle.subscribeData.id) {
        console.log('No webhook ID found, skipping webhook deletion');
        return Promise.resolve({});
    }
    
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE'
    });
    return responsePromise
        .then(response => response.data);
};

/**
 * Processes incoming webhook data
 * @param {Object} z - The Zapier object
 * @param {Object} bundle - The webhook bundle
 * @param {Object} bundle.cleanedRequest.payload - Webhook payload
 * @returns {Array} Array containing the webhook payload
 * @throws {Error} When webhook data is invalid
 */
const hookInbound = (z, bundle) => {
    // Validate webhook data
    if (!bundle.cleanedRequest || !bundle.cleanedRequest.payload) {
        throw new z.errors.Error('Webhook data is invalid or missing');
    }
    return [bundle.cleanedRequest.payload];
};

/**
 * Project resource configuration
 * @type {Object}
 */
module.exports = {
    key: 'project',
    noun: 'Project',

    get: {
        display: {
            label: 'Get Project',
            description: 'Gets a Project by id.'
        },
        operation: {
            inputFields: [
                {key: 'id', required: true}
            ],
            perform: getProject
        }
    },

    list: {
        display: {
            label: 'New Project',
            description: 'Lists the Projects.',
            hidden: true
        },
        operation: {
            perform: listProjectsByTitle,
        }
    },

    hook: {
        display: {
            label: 'New Project',
            description: 'Triggers when a new Project is added.'
        },
        operation: {
            type: 'hook',
            performSubscribe: subscribeHook,
            performUnsubscribe: unsubscribeHook,
            perform: hookInbound,
            performList: latestProjects
        }
    },

    search: {
        display: {
            label: 'Find Project',
            description: 'Finds a Project by searching.'
        },
        operation: {
            inputFields: [
                {key: 'text', required: true}
            ],
            perform: searchProjects
        }
    },

    create: {
        display: {
            label: 'Create Project',
            description: 'Creates a new Project.'
        },
        operation: {
            inputFields: [
                {key: 'title', label: 'Title', helpText: 'Title of this Project', type: 'string', required: true},
                {
                    key: 'employer',
                    label: 'Employer',
                    helpText: 'Employer of this Project',
                    type: 'string',
                    required: true
                },
                teamFields,
                {
                    key: 'description',
                    label: 'Description',
                    helpText: 'Description of this Project',
                    type: 'text',
                    required: false
                },
                {
                    key: 'office',
                    label: 'Office',
                    helpText: 'Office of this Project',
                    type: 'string',
                    required: false
                },
                {
                    key: 'salary',
                    label: 'Salary',
                    helpText: 'Salary of this Project in cents',
                    type: 'integer',
                    required: false
                },
                {
                    key: 'color',
                    label: 'Color',
                    helpText: 'Color of this Project (e.g. #ff0000)',
                    type: 'string',
                    required: false
                }
            ],
            perform: createProject
        }
    },

    sample: {
        id: '6e57207d8d4348de85210a83b6f6c4ab',
        title: 'Test Project',
        employer: 'Test Company',
        status: 'open',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        office: 'Munich',
        salary: 100000,
        color: '#ff0000',
        created: "1970-01-01T00:00:00+00:00",
        updated: "1970-01-01T00:00:00+00:00"
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'title', label: 'Title'},
        {key: 'employer', label: 'Employer'},
        {key: 'status', label: 'Status'},
        {key: 'description', label: 'Description'},
        {key: 'office', label: 'Office'},
        {key: 'salary', label: 'Salary', type: 'integer'},
        {key: 'color', label: 'Color'},
        {key: 'created', label: 'Created', type: 'datetime'},
        {key: 'updated', label: 'Updated', type: 'datetime'}
    ]
};