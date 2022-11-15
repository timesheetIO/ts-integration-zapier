const moment = require('moment');

// Get Task by Id
const getTask = (z, bundle) => {
    const responsePromise = z.request({
        url: `https://api.timesheet.io/v1/tasks/${bundle.inputData.id}`,
    });
    return responsePromise
        .then(response => response.data);
};

// Get List of Tasks
const listTasks = (z, bundle, sort, order) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/tasks',
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

const latestTasks = (z, bundle) => {
    return listTasks(z, bundle, 'created', 'desc');
};

const listTasksByDateTime = (z, bundle) => {
    return listTasks(z, bundle, 'dateTime', '');
};

// Search Tasks by name
const searchTasks = (z, bundle) => {
    const responsePromise = z.request({
        method: 'POST',
        url: 'https://api.timesheet.io/v1/tasks/search',
        body: {
            search: bundle.inputData.text,
            limit: 20,
            page: bundle.meta.page + 1
        }
    });
    return responsePromise
        .then(response => response.data.items);
};

// Create a Task
const createTask = (z, bundle) => {
    let data = {
        method: 'POST',
        url: 'https://api.timesheet.io/v1/tasks',
        body: {
            projectId: bundle.inputData.projectId,
            startDateTime: moment(bundle.inputData.startDateTime).parseZone().second(0).millisecond(0).format(),
            endDateTime: moment(bundle.inputData.endDateTime).parseZone().second(0).millisecond(0).format(),
            description: bundle.inputData.description,
            billable: bundle.inputData.billable,
            billed: bundle.inputData.billable && bundle.inputData.billed,
            paid: bundle.inputData.billable && bundle.inputData.paid,
            tags: bundle.inputData.tags,
            location: bundle.inputData.location,
            rateId: bundle.inputData.rateId
        }
    };

    return z.request(data)
        .then(response => response.data);
};

const subscribeHook = (z, bundle) => {
    const responsePromise = z.request({
        url: 'https://api.timesheet.io/v1/webhooks',
        method: 'POST',
        body: {
            target: bundle.targetUrl,
            event: 'task.create'
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
    key: 'task',
    noun: 'Task',

    get: {
        display: {
            label: 'Get Task',
            description: 'Gets a Task by id.'
        },
        operation: {
            inputFields: [
                {key: 'id', required: true}
            ],
            perform: getTask
        }
    },

    list: {
        display: {
            label: 'New Task',
            description: 'Lists the Tasks.',
            hidden: true
        },
        operation: {
            perform: listTasksByDateTime
        }
    },

    hook: {
        display: {
            label: 'New Task',
            description: 'Triggers when a new Task is added.',
            important: true
        },
        operation: {
            type: 'hook',
            performSubscribe: subscribeHook,
            performUnsubscribe: unsubscribeHook,
            perform: hookInbound,
            performList: latestTasks
        }
    },

    search: {
        display: {
            label: 'Find Task',
            description: 'Finds a Task by searching.'
        },
        operation: {
            inputFields: [
                {key: 'text', required: true}
            ],
            perform: searchTasks
        }
    },

    create: {
        display: {
            label: 'Create Task',
            description: 'Creates a new Task.',
            important: true
        },
        operation: {
            inputFields: [
                {
                    key: 'projectId',
                    label: 'Project',
                    helpText: 'Project of this Task',
                    type: 'string',
                    required: true,
                    dynamic: 'project.id.title',
                    altersDynamicFields: true
                },
                {
                    key: 'startDateTime',
                    label: 'Start Date',
                    helpText: 'Start date of this Task',
                    type: 'datetime',
                    required: true
                },
                {
                    key: 'endDateTime',
                    label: 'End Date',
                    helpText: 'End date of this Task',
                    type: 'datetime',
                    required: true
                },
                {
                    key: 'description',
                    label: 'Description',
                    helpText: 'Description of this Task',
                    type: 'text',
                    required: false
                },
                {key: 'location', label: 'Location', helpText: 'Location of work', type: 'string', required: false},
                {
                    key: 'billable',
                    label: 'Billable',
                    helpText: 'Is the Task billable?',
                    default: 'yes',
                    type: 'boolean',
                    required: false,
                    altersDynamicFields: true
                },
                function (z, bundle) {

                    let dynamicFields = [];

                    if (bundle.inputData.billable === 'true') {
                        dynamicFields.push({
                            key: 'billed',
                            label: 'Billed',
                            helpText: 'Was the Task billed?',
                            default: 'no',
                            type: 'boolean',
                            required: false
                        });
                        dynamicFields.push({
                            key: 'paid',
                            label: 'Paid',
                            helpText: 'Was the Task paid?',
                            default: 'no',
                            type: 'boolean',
                            required: false,
                            altersDynamicFields: true
                        });
                    }


                    if (bundle.inputData.projectId && bundle.inputData.projectId !== '') {
                        dynamicFields.push({
                            key: 'rateId',
                            label: 'Rate',
                            helpText: 'Rate of this Task',
                            type: 'string',
                            required: false,
                            dynamic: 'rate.id.title'
                        });
                        dynamicFields.push({
                            key: 'tags',
                            label: 'Tags',
                            helpText: 'Tags of this Task',
                            type: 'string',
                            required: false,
                            dynamic: 'tag.id.name',
                            list: true
                        });
                    }
                    return dynamicFields;
                }
            ],
            perform: createTask
        }
    },

    sample: {
        id: '6w57407o8d4348dg85111a83b6f6c4eb',
        projectId: '6e57207d8d4348de85210a83b6f6c4ab',
        startDateTime: '2022-11-14T16:00:00+00:00',
        endDateTime: '2022-11-14T17:00:00+00:00',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        location: '711-2880 Nulla St. Mankato Mississippi 96522'
    },

    outputFields: [
        {key: 'id', label: 'ID'},
        {key: 'projectId', label: 'Project'},
        {key: 'startDateTime', label: 'Start Date'},
        {key: 'endDateTime', label: 'End Date'},
        {key: 'description', label: 'Description'},
        {key: 'location', label: 'Location'}
    ]
};
