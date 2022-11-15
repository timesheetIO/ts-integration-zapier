// Get Tag by Id
const getTag = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/tags/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => response.data);
};

// Get List of Tags
const listTags = (z, bundle, sort, order) => {
    let data = {
        url: 'https://api.timesheet.io/v1/tags',
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

const latestTags = (z, bundle) => {
    return listTags(z, bundle, 'created', 'desc');
};

const listTagsByName = (z, bundle) => {
    return listTags(z, bundle, 'alpha', 'asc');
};

// Search Tags by name
const searchTags = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/tags/search',
        body: {
            search: bundle.inputData.text,
            limit: 20,
            page: bundle.meta.page + 1
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

// Create a Tag
const createTag = (z, bundle) => {
    let data = {
        method: 'POST',
        url: 'https://api.timesheet.io/v1/tags',
        body: {
            name: bundle.inputData.name,
            color: bundle.inputData.color
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
                    helpText: 'Team of this Tag',
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
            event: 'tag.create'
        }
    });

    return responsePromise
        .then(response => response.data);
};

const unsubscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE'
    });

    return responsePromise
        .then(response => response.data);
};

const hookInbound = (z, bundle) => {
    return [bundle.cleanedRequest.item];
};

module.exports = {
    key: 'tag',
    noun: 'Tag',

    get: {
        display: {
            label: 'Get Tag',
            description: 'Gets a Tag by id.'
        },
        operation: {
            inputFields: [
                {key: 'id', required: true}
            ],
            perform: getTag
        }
    },

    list: {
        display: {
            label: 'New Tag',
            description: 'Lists the Tags.',
            hidden: true
        },
        operation: {
            perform: listTagsByName
        }
    },

    hook: {
        display: {
            label: 'New Tag',
            description: 'Triggers when a new Tag is added.'
        },
        operation: {
            type: 'hook',
            performSubscribe: subscribeHook,
            performUnsubscribe: unsubscribeHook,
            perform: hookInbound,
            performList: latestTags
        }
    },

    search: {
        display: {
            label: 'Find Tag',
            description: 'Finds a Tag by searching.'
        },
        operation: {
            inputFields: [
                {key: 'text', required: true}
            ],
            perform: searchTags
        }
    },

    create: {
        display: {
            label: 'Create Tag',
            description: 'Creates a new Tag.'
        },
        operation: {
            inputFields: [
                teamFields,
                {key: 'name', label: 'Name', helpText: 'Name of this Tag', type: 'string', required: true},
                {key: 'color', label: 'Color', helpText: 'Color of this Tag', type: 'integer', required: false}
            ],
            perform: createTag
        }
    },

    sample: {
        id: '6p57207o8d4348de85211a83b6f6c4eb',
        title: 'Test Tag',
        color: -12323
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'name', label: 'Name'},
        {key: 'color', label: 'Color', type: 'integer'}
    ]
};
