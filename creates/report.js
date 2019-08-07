const moment = require('moment');

// Send Report
const sendReport = (z, bundle) => {
    let data = {
        method: 'POST',
        url: 'https://api.timesheet.io/v1/export/send',
        body: {
            email: bundle.inputData.email,
            report: bundle.inputData.report,
            filename: bundle.inputData.filename,
            format: bundle.inputData.format,
            projectIds: bundle.inputData.projectIds,
            type: bundle.inputData.type,
            filter: bundle.inputData.filter,
            summarize: bundle.inputData.summarize,
            start: moment(bundle.inputData.start).parseZone().second(0).millisecond(0).format("YYYY-MM-DD"),
            end: moment(bundle.inputData.end).parseZone().second(0).millisecond(0).format("YYYY-MM-DD")
        }
    };

    let definedFields = [
        {"id": 2, "name": "Date"},
        {"id": 3, "name": "Start Time"},
        {"id": 4, "name": "End Time"},
        {"id": 5, "name": "Abs. Duration"},
        {"id": 6, "name": "Rel. Duration"},
        {"id": 7, "name": "Abs. Salary"},
        {"id": 8, "name": "Rel. Salary"},
        {"id": 9, "name": "Description"},
        {"id": 10, "name": "Location"},
        {"id": 11, "name": "Feeling"},
        {"id": 12, "name": "Billable"},
        {"id": 13, "name": "Paid"},
        {"id": 14, "name": "Type"},
        {"id": 15, "name": "Origin"},
        {"id": 16, "name": "Destination"},
        {"id": 17, "name": "Distance"},
        {"id": 18, "name": "Phone"},
        {"id": 19, "name": "Project"},
        {"id": 20, "name": "Client"},
        {"id": 21, "name": "Pauses"},
        {"id": 22, "name": "Expenses"},
        {"id": 23, "name": "Expenses (paid)"},
        {"id": 24, "name": "Expenses (unpaid)"},
        {"id": 25, "name": "Expense Description"},
        {"id": 26, "name": "Notes"},
        {"id": 28, "name": "Tags"},
        {"id": 29, "name": "Rate"},
        {"id": 30, "name": "Factor"},
        {"id": 31, "name": "Extra/h"},
        {"id": 32, "name": "Rate (enabled)"},
        {"id": 33, "name": "Task ID"},
        {"id": 34, "name": "Project ID"},
        {"id": 35, "name": "Username"}
    ];

    let exportedFields = [];

    if (bundle.inputData.exportedFields) {
        for (let i = 0; i < bundle.inputData.exportedFields.length; i++) {
            for (let j = 0; j < definedFields.length; j++) {
                if (definedFields[j].id.toString() === bundle.inputData.exportedFields[i]) {
                    definedFields[j].position = i;
                    exportedFields.push(definedFields[j]);
                    break;
                }
            }
        }
    }

    data.body.exportedFields = exportedFields;

    return z.request(data)
        .then(response => z.JSON.parse(response.content));
};

module.exports = {
    key: 'report',
    noun: 'Report',

    display: {
        label: 'Send Report',
        description: 'Sends a new Report.',
        important: true
    },

    operation: {
        inputFields: [
            {key: 'email', type: 'string', required: true},
            {
                key: 'report',
                label: 'Report',
                helpText: 'Type of Report',
                required: true,
                type: 'integer',
                choices: [
                    {value: '0', sample: '0', label: "Data Report"},
                    {value: '1', sample: '1', label: "Team Summary"}
                ]
            },
            {
                key: 'projectIds',
                label: 'Projects',
                helpText: 'Includes Tasks of these Projects',
                type: 'string',
                required: false,
                dynamic: 'project.id.title',
                list: true
            },
            {
                key: 'start',
                label: 'Start Date',
                helpText: 'Start date of this Report',
                type: 'datetime',
                required: true
            },
            {
                key: 'end',
                label: 'End Date',
                helpText: 'End date of this Report',
                type: 'datetime',
                required: true
            },
            {
                key: 'type',
                label: 'Type',
                helpText: 'Type of Tasks',
                default: 'all',
                type: 'string',
                choices: [
                    {value: "all", sample: "all", label: "All"},
                    {value: "task", sample: "task", label: "Tasks"},
                    {value: "mileage", sample: "mileage", label: "Mileage"},
                    {value: "call", sample: "call", label: "Call"}
                ]
            },
            {
                key: 'filter',
                label: 'Filter',
                helpText: 'Filter tasks',
                default: 'all',
                type: 'string',
                choices: [
                    {value: "all", sample: "all", label: "All"},
                    {value: "billable", sample: "billable", label: "Billable"},
                    {value: "notBillable", sample: "notBillable", label: "Not billable"},
                    {value: "paid", sample: "paid", label: "Paid"},
                    {value: "unpaid", sample: "unpaid", label: "Unpaid"},
                    {value: "billed", sample: "billed", label: "Billed"},
                    {value: "outstanding", sample: "outstanding", label: "Outstanding"}
                ]
            },
            {
                key: 'exportedFields',
                label: 'Exported Fields',
                required: true,
                list: true,
                choices: [
                    {value: "2", sample: "2", label: "Date"},
                    {value: "3", sample: "3", label: "Start Time"},
                    {value: "4", sample: "4", label: "End Time"},
                    {value: "5", sample: "5", label: "Abs. Duration"},
                    {value: "6", sample: "6", label: "Rel. Duration"},
                    {value: "7", sample: "7", label: "Abs. Salary"},
                    {value: "8", sample: "8", label: "Rel. Salary"},
                    {value: "9", sample: "9", label: "Description"},
                    {value: "10", sample: "10", label: "Location"},
                    {value: "11", sample: "11", label: "Feeling"},
                    {value: "12", sample: "12", label: "Billable"},
                    {value: "13", sample: "13", label: "Paid"},
                    {value: "14", sample: "14", label: "Type"},
                    {value: "15", sample: "15", label: "Origin"},
                    {value: "16", sample: "16", label: "Destination"},
                    {value: "17", sample: "17", label: "Distance"},
                    {value: "18", sample: "18", label: "Phone"},
                    {value: "19", sample: "19", label: "Project"},
                    {value: "20", sample: "20", label: "Client"},
                    {value: "21", sample: "21", label: "Pauses"},
                    {value: "22", sample: "22", label: "Expenses"},
                    {value: "23", sample: "23", label: "Expenses (paid)"},
                    {value: "24", sample: "24", label: "Expenses (unpaid)"},
                    {value: "25", sample: "25", label: "Expense Description"},
                    {value: "26", sample: "26", label: "Notes"},
                    {value: "28", sample: "28", label: "Tags"},
                    {value: "29", sample: "29", label: "Rate"},
                    {value: "30", sample: "30", label: "Factor"},
                    {value: "31", sample: "31", label: "Extra/h"},
                    {value: "32", sample: "32", label: "Rate (enabled)"},
                    {value: "33", sample: "33", label: "Task ID"},
                    {value: "34", sample: "34", label: "Project ID"},
                    {value: "35", sample: "35", label: "Username"}
                ]
            },
            {
                key: 'summarize',
                label: 'Summarize data columns',
                helpText: 'Adds a summary row',
                type: 'boolean',
                required: false
            },
            {
                key: 'format',
                label: 'Format',
                helpText: 'File format',
                required: false,
                type: 'string',
                choices: [
                    {value: "xlsx", sample: "xlsx", label: "Excel (.xlsx)"},
                    {value: "csv", sample: "csv", label: "CSV (.csv)"}
                ]
            },
            {
                key: 'filename',
                label: 'Filename',
                helpText: 'Name of the file',
                type: 'string',
                required: false
            }
        ],
        perform: sendReport,

        sample: {
            email: 'support@timesheet.io',
            report: 0,
            projectIds: ['32453ffdfrefsfererf'],
            start: '2019-08-01',
            end: '2019-08-31',
            type: 'all',
            filter: 'all',
            exportedFields: ['2', '3', '4', '5', '6'],
            summarize: true,
            format: 'xlsx',
            filename: 'timesheet'
        },

        outputFields: [
            {key: 'email', label: 'Email'},
            {key: 'report', label: 'Report'},
            {key: 'projectIds', label: 'Project Ids'},
            {key: 'start', label: 'Start Date'},
            {key: 'end', label: 'End Date'},
            {key: 'type', label: 'Type'},
            {key: 'filter', label: 'Filter'},
            {key: 'exportedFields', label: 'Exported Fields'},
            {key: 'summarize', label: 'Summarize'},
            {key: 'format', label: 'Format'},
            {key: 'filename', label: 'Filename'}
        ]

    }
};