// Get Rate by Id
const getRate = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/rates/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => response.data);
};

// Get List of Rates
const listRates = (z, bundle, sort, order) => {
    let data = {
        url: 'https://api.timesheet.io/v1/rates',
        params: {
            limit: 20,
            page: bundle.meta.page + 1,
            sort: sort,
            order: order
        }
    };

    if (bundle.inputData.projectId) {
        data.params.projectId = bundle.inputData.projectId
    }

    return z.request(data)
        .then(response => response.data.items);
};

const latestRates = (z, bundle) => {
    return listRates(z, bundle, 'created', 'desc');
};

const listRatesByTitle = (z, bundle) => {
    return listRates(z, bundle, 'alpha', 'asc');
};

// Search Rates by name
const searchRates = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/rates/search',
        body: {
            search: bundle.inputData.text,
            limit: 20,
            page: bundle.meta.page + 1
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

// Create a Rate
const createRate = (z, bundle) => {
    let data = {
        method: 'POST',
        url: 'https://api.timesheet.io/v1/rates',
        body: {
            title: bundle.inputData.title,
            factor: bundle.inputData.factor,
            extra: bundle.inputData.extra
        }
    };
    if (bundle.inputData.teamId) {
        data.body.teamId = bundle.inputData.teamId;
    }
    return z.request(data).then(response => response.data);
};

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
                    helpText: 'Team of this Rate',
                    type: 'string',
                    required: true,
                    dynamic: 'team.id.name'
                }];
            } else {
                return [];
            }
        });
};

const subscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/webhooks',
        method: 'POST',
        body: {
            target: bundle.targetUrl,
            event: 'rate.create'
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
    key: 'rate',
    noun: 'Rate',

    get: {
        display: {
            label: 'Get Rate',
            description: 'Gets a Rate by id.'
        },
        operation: {
            inputFields: [
                {key: 'id', required: true}
            ],
            perform: getRate
        }
    },

    list: {
        display: {
            label: 'New Rate',
            description: 'Lists the Rates.',
            hidden: true
        },
        operation: {
            perform: listRatesByTitle
        }
    },

    hook: {
        display: {
            label: 'New Rate',
            description: 'Triggers when a new Rate is added.'
        },
        operation: {
            type: 'hook',
            performSubscribe: subscribeHook,
            performUnsubscribe: unsubscribeHook,
            perform: hookInbound,
            performList: latestRates
        }
    },

    search: {
        display: {
            label: 'Find Rate',
            description: 'Finds a Rate by searching.'
        },
        operation: {
            inputFields: [
                {key: 'text', required: true}
            ],
            perform: searchRates
        }
    },

    create: {
        display: {
            label: 'Create Rate',
            description: 'Creates a new Rate.'
        },
        operation: {
            inputFields: [
                teamFields,
                {key: 'title', label: 'Title', helpText: 'Title of this Rate', type: 'string', required: true},
                {
                    key: 'factor',
                    label: 'Factor',
                    helpText: 'Factor multiplies projects default rate',
                    type: 'number',
                    required: false
                },
                {
                    key: 'extra',
                    label: 'Extra/h',
                    helpText: 'Extra is added to the projects default rate',
                    type: 'number',
                    required: false
                }
            ],
            perform: createRate
        }
    },

    sample: {
        id: '6t57207o8d4848de85210a83b6f6c4bb',
        title: 'Test Rate',
        factor: 1.0,
        extra: 100.0
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'title', label: 'Title'},
        {key: 'factor', label: 'Factor', type: 'number'},
        {key: 'extra', label: 'Extra/h', type: 'number'}
    ]
};
