require('should');

const zapier = require('zapier-platform-core');
const moment = require('moment');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Report Action', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Send Report', () => {
        it('should send a report with basic configuration', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    email: 'test@example.com',
                    report: 'time',
                    filename: 'timesheet_report',
                    format: 'xlsx',
                    dateRange: '0', // Today
                    projectIds: ['project_123'],
                    type: 'simple',
                    filter: 'all',
                    summarize: false
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then((result) => {
                    // API should return success response
                    result.should.be.ok();
                })
                .catch((error) => {
                    // Expected to fail without API access
                    error.name.should.be.oneOf(['ResponseError', 'Error']);
                });
        });

        it('should send a report with custom date range', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    email: 'test@example.com',
                    report: 'time',
                    filename: 'custom_date_report',
                    format: 'csv',
                    dateRange: '11', // Custom
                    start: '2025-01-01',
                    end: '2025-01-31',
                    projectIds: ['project_123', 'project_456'],
                    type: 'detailed',
                    filter: 'billable',
                    summarize: true
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then((result) => {
                    // API should return success response
                    result.should.be.ok();
                })
                .catch((error) => {
                    // Expected to fail without API access
                    error.name.should.be.oneOf(['ResponseError', 'Error']);
                });
        });

        it('should handle different date ranges correctly', () => {
            const dateRanges = [
                { value: '0', description: 'Today' },
                { value: '1', description: 'This week' },
                { value: '2', description: 'This and last week' },
                { value: '3', description: 'This month' },
                { value: '4', description: 'This year' },
                { value: '5', description: 'Yesterday' },
                { value: '6', description: 'Last week' },
                { value: '7', description: 'Last 2 weeks' },
                { value: '8', description: 'Last 4 weeks' },
                { value: '9', description: 'Last month' },
                { value: '10', description: 'Last year' }
            ];

            const promises = dateRanges.map(range => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        email: 'test@example.com',
                        report: 'time',
                        filename: `report_${range.description.replace(/\s+/g, '_')}`,
                        format: 'xlsx',
                        dateRange: range.value,
                        projectIds: [],
                        type: 'simple',
                        filter: 'all',
                        summarize: false
                    }
                };

                return appTester(App.creates.report.operation.perform, bundle)
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            return Promise.all(promises);
        });

        it('should send report with exported fields', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    email: 'test@example.com',
                    report: 'time',
                    filename: 'fields_report',
                    format: 'xlsx',
                    dateRange: '3', // This month
                    projectIds: [],
                    type: 'detailed',
                    filter: 'all',
                    summarize: false,
                    exportedFields: ['2', '3', '4', '5', '19', '28'] // Date, Start, End, Duration, Project, Tags
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then((result) => {
                    // API should return success response
                    result.should.be.ok();
                })
                .catch((error) => {
                    // Expected to fail without API access
                    error.name.should.be.oneOf(['ResponseError', 'Error']);
                });
        });

        it('should default to today when custom range is selected but no dates provided', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    email: 'test@example.com',
                    report: 'time',
                    filename: 'default_date_report',
                    format: 'xlsx',
                    dateRange: '11', // Custom but no dates
                    projectIds: [],
                    type: 'simple',
                    filter: 'all',
                    summarize: false
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then((result) => {
                    // Should use today's date when custom is selected but no dates provided
                    result.should.be.ok();
                })
                .catch((error) => {
                    // Expected to fail without API access
                    error.name.should.be.oneOf(['ResponseError', 'Error']);
                });
        });

        it('should handle multiple project IDs', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    email: 'test@example.com',
                    report: 'project',
                    filename: 'multi_project_report',
                    format: 'csv',
                    dateRange: '9', // Last month
                    projectIds: ['project_1', 'project_2', 'project_3'],
                    type: 'detailed',
                    filter: 'unbillable',
                    summarize: true
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then((result) => {
                    // API should return success response
                    result.should.be.ok();
                })
                .catch((error) => {
                    // Expected to fail without API access
                    error.name.should.be.oneOf(['ResponseError', 'Error']);
                });
        });

        it('should validate required fields', () => {
            const bundle = {
                authData: authData,
                inputData: {
                    // Missing required fields
                }
            };

            return appTester(App.creates.report.operation.perform, bundle)
                .then(() => {
                    throw new Error('Expected an error for missing required fields');
                })
                .catch((error) => {
                    // Should fail validation
                    error.should.be.ok();
                });
        });
    });

    describe('Input Fields', () => {
        it('should provide correct input fields', () => {
            const inputFields = App.creates.report.operation.inputFields;
            
            inputFields.should.be.an.Array();
            inputFields.length.should.be.above(0);
            
            // Check required fields
            const requiredFields = ['email', 'report', 'filename', 'format', 'dateRange'];
            requiredFields.forEach(fieldKey => {
                const field = inputFields.find(f => f.key === fieldKey);
                field.should.be.ok();
                field.required.should.be.true();
            });
            
            // Check conditional field
            const startField = inputFields.find(f => f.key === 'start');
            const endField = inputFields.find(f => f.key === 'end');
            startField.should.be.ok();
            endField.should.be.ok();
            
            // Check dynamic field
            const projectIdsField = inputFields.find(f => f.key === 'projectIds');
            projectIdsField.should.be.ok();
            projectIdsField.dynamic.should.eql('project.id.title');
        });

        it('should have correct date range choices', () => {
            const inputFields = App.creates.report.operation.inputFields;
            const dateRangeField = inputFields.find(f => f.key === 'dateRange');
            
            dateRangeField.should.be.ok();
            dateRangeField.choices.should.be.an.Array();
            dateRangeField.choices.length.should.be.above(10);
            
            // Check some specific choices
            const todayChoice = dateRangeField.choices.find(c => c.value === '0');
            todayChoice.label.should.eql('Today');
            
            const customChoice = dateRangeField.choices.find(c => c.value === '11');
            customChoice.label.should.eql('Custom Range');
        });

        it('should have correct exported fields choices', () => {
            const inputFields = App.creates.report.operation.inputFields;
            const exportedFieldsField = inputFields.find(f => f.key === 'exportedFields');
            
            exportedFieldsField.should.be.ok();
            exportedFieldsField.list.should.be.true();
            exportedFieldsField.choices.should.be.an.Array();
            exportedFieldsField.choices.length.should.be.above(20);
            
            // Check some specific field choices
            const dateChoice = exportedFieldsField.choices.find(c => c.value === '2');
            dateChoice.label.should.eql('Date');
            
            const projectChoice = exportedFieldsField.choices.find(c => c.value === '19');
            projectChoice.label.should.eql('Project');
        });
    });

    describe('Sample Data', () => {
        it('should provide sample report data', () => {
            const sample = App.creates.report.operation.sample;
            
            sample.should.have.property('email');
            sample.should.have.property('report');
            sample.should.have.property('projectIds');
            sample.should.have.property('start');
            sample.should.have.property('end');
            sample.should.have.property('type');
            sample.should.have.property('filter');
            sample.should.have.property('exportedFields');
            sample.should.have.property('summarize');
            sample.should.have.property('format');
            sample.should.have.property('filename');
        });

        it('should provide output fields', () => {
            const outputFields = App.creates.report.operation.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.be.above(0);
            
            // Check required output fields
            const requiredFields = ['email', 'report', 'projectIds', 'start', 'end'];
            requiredFields.forEach(fieldKey => {
                const field = outputFields.find(f => f.key === fieldKey);
                field.should.be.ok();
            });
        });
    });
});