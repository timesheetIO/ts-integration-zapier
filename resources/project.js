// Get Project by Id
const getProject = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/projects/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => z.JSON.parse(response.content));
};

// Get List of Projects
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
        .then(response => z.JSON.parse(response.content).items);
};

const latestProjects = (z, bundle) => {
    return listProjects(z, bundle, 'all', 'created', 'desc');
};

const listProjectsByTitle = (z, bundle) => {
    return listProjects(z, bundle, 'all', 'alpha', 'asc');
};

// Search Project by title
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
        .then(response => z.JSON.parse(response.content).items);
};

// Create a Project
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
    return z.request(data).then(response => z.JSON.parse(response.content));
};

const teamFields = (z, bundle) => {
    const responsePromise = z.request({
        method: 'GET',
        url: 'https://api.timesheet.io/v1/profiles/me'
    });
    return responsePromise
        .then(response => {
            const profile = z.JSON.parse(response.content);
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
        .then(response => z.JSON.parse(response.content));
};

const unsubscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/webhooks/${bundle.subscribeData.id}`,
        method: 'DELETE'
    });

    return responsePromise
        .then(response => z.JSON.parse(response.content));
};

const hookInbound = (z, bundle) => {
    return [bundle.cleanedRequest.item];
};

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
            perform: listProjectsByTitle
        }
    },

    hook: {
        display: {
            label: 'New Project',
            description: 'Triggers when a new Project is added.',
            important: true
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
            description: 'Finds a Project by searching.',
            important: true
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
            description: 'Creates a new Project.',
            important: true
        },
        operation: {
            inputFields: [
                teamFields,
                {key: 'title', label: 'Title', helpText: 'Title of this Project', type: 'string', required: true},
                {key: 'employer', label: 'Client', helpText: 'Client of this Project', type: 'string', required: false},
                {
                    key: 'description',
                    label: 'Description',
                    helpText: 'Description of this Project',
                    type: 'text',
                    required: false
                },
                {key: 'office', label: 'Office', helpText: 'Office of this Project', type: 'string', required: false},
                {
                    key: 'salary',
                    label: 'Salary/h',
                    helpText: 'Default rate per hour of the Project',
                    type: 'number',
                    required: false
                },
                {key: 'color', label: 'Color', helpText: 'Color of the Project', type: 'integer', required: false},
            ],
            perform: createProject
        }
    },

    sample: {
        id: '34434443dssdA3DGAsjf4r90dvs0dv',
        title: 'Test',
        employer: 'Acme Inc.',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        office: '711-2880 Nulla St. Mankato Mississippi 96522',
        salary: 15.0,
        color: 0
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'title', label: 'Title'},
        {key: 'employer', label: 'Client'},
        {key: 'description', label: 'Description'},
        {key: 'office', label: 'Office'},
        {key: 'salary', label: 'Salary/h'},
        {key: 'color', label: 'Color'}
    ]
};
