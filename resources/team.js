// Get Team by Id
const getTeam = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/teams/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => response.data);
};

// Get List of Teams
const listTeams = (z, bundle, sort, order) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/teams',
        params: {
            limit: 20,
            page: bundle.meta.page + 1,
            sort: sort,
            order: order
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

const latestTeams = (z, bundle) => {
    return listTeams(z, bundle, 'created', 'desc');
};

const listTeamsByName = (z, bundle) => {
    return listTeams(z, bundle, 'alpha', 'asc');
};

// Search Teams by name
const searchTeams = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/teams/search',
        body: {
            search: bundle.inputData.text,
            limit: 20,
            page: bundle.meta.page + 1
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

// Create a Team
const createTeam = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/teams',
        body: {
            name: bundle.inputData.name,
            description: bundle.inputData.description
        }
    });
    return responsePromise
        .then(response => response.data);
};

const subscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/webhooks',
        method: 'POST',
        body: {
            target: bundle.targetUrl,
            event: 'team.create'
        }
    });

    return responsePromise
        .then(response => {
            if (response.status !== 200 && response.status !== 201) {
                throw new z.errors.Error(`Webhook registration failed: ${response.content}`);
            }
            return response.data;
        });
};

const unsubscribeHook = (z, bundle) => {
    // Skip if we don't have an ID
    if (!bundle.subscribeData || !bundle.subscribeData.id) {
        z.console.log('No webhook ID found, skipping webhook deletion');
        return Promise.resolve({});
    }
    
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE'
    });

    return responsePromise
        .then(response => response.data);
};

const hookInbound = (z, bundle) => {
    // Validate webhook data
    if (!bundle.cleanedRequest || !bundle.cleanedRequest.item) {
        throw new z.errors.Error('Webhook data is invalid or missing');
    }
    return [bundle.cleanedRequest.item];
};

module.exports = {
    key: 'team',
    noun: 'Team',

    get: {
        display: {
            label: 'Get Team',
            description: 'Gets a Team by id.'
        },
        operation: {
            inputFields: [
                {key: 'id', required: true}
            ],
            perform: getTeam
        }
    },

    list: {
        display: {
            label: 'New Team',
            description: 'Lists the Teams.',
            hidden: true
        },
        operation: {
            perform: listTeamsByName,
        }
    },

    hook: {
        display: {
            label: 'New Team',
            description: 'Triggers when a new Team is added.'
        },
        operation: {
            type: 'hook',
            performSubscribe: subscribeHook,
            performUnsubscribe: unsubscribeHook,
            perform: hookInbound,
            performList: latestTeams
        }
    },

    search: {
        display: {
            label: 'Find Team',
            description: 'Finds a Team by searching.'
        },
        operation: {
            inputFields: [
                {key: 'text', required: true}
            ],
            perform: searchTeams
        }
    },

    create: {
        display: {
            label: 'Create Team',
            description: 'Creates a new Team.'
        },
        operation: {
            inputFields: [
                {key: 'name', label: 'Name', helpText: 'Name of this Team', type: 'string', required: true},
                {
                    key: 'description',
                    label: 'Description',
                    helpText: 'Description of this Team',
                    type: 'text',
                    required: false
                }
            ],
            perform: createTeam
        }
    },

    sample: {
        id: '2i57207d2d4348de85210a13b6f6g4ab',
        name: 'Test Team',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.'
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'name', label: 'Name'},
        {key: 'description', label: 'Description'}
    ]
};
