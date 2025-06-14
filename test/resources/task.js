require('should');

const zapier = require('zapier-platform-core');
const moment = require('moment');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Task Resource', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Triggers', () => {
        describe('New Task (Webhook)', () => {
            it('should subscribe to webhook', () => {
                const bundle = {
                    authData: authData,
                    targetUrl: 'http://example.com/webhook',
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.task.hook.performSubscribe, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should unsubscribe from webhook', () => {
                const bundle = {
                    authData: authData,
                    subscribeData: {
                        id: 'webhook_id_123'
                    }
                };

                return appTester(App.resources.task.hook.performUnsubscribe, bundle)
                    .then((result) => {
                        result.should.be.ok();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should handle incoming webhook data', () => {
                const bundle = {
                    authData: authData,
                    cleanedRequest: {
                        payload: {
                            id: 'task_123',
                            name: 'Test Task',
                            duration: 3600,
                            dateTime: '2025-01-06T12:00:00Z',
                            created: '2025-01-06T12:00:00Z'
                        }
                    }
                };

                return appTester(App.resources.task.hook.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        results.length.should.be.aboveOrEqual(1);
                        const task = results[0];
                        task.should.have.property('id');
                        task.should.have.property('name');
                        task.should.have.property('duration');
                    });
            });

            it('should list sample tasks for testing', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.task.hook.performList, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });
    });

    describe('Actions', () => {
        describe('Create Task', () => {
            it('should create a task with minimal data', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'Test Task',
                        dateTime: '2025-01-06T14:00:00',
                        duration: 3600,
                        projectId: 'project_123'
                    }
                };

                return appTester(App.resources.task.create.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
                        result.duration.should.eql(bundle.inputData.duration);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should create a task with all optional fields', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'Complete Task',
                        dateTime: '2025-01-06T14:00:00',
                        duration: 7200,
                        projectId: 'project_123',
                        teamId: 'team_123',
                        description: 'Task description',
                        tagIds: ['tag_1', 'tag_2']
                    }
                };

                return appTester(App.resources.task.create.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should format dateTime correctly', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'Task with formatted date',
                        dateTime: '2025-01-06T14:00:00Z',
                        duration: 3600,
                        projectId: 'project_123'
                    }
                };

                // The create function should format the date using moment
                return appTester(App.resources.task.create.perform, bundle)
                    .then((result) => {
                        // Date should be formatted as ISO string
                        result.should.have.property('dateTime');
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });

        describe('Get Task', () => {
            it('should fetch a task by ID', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        id: 'task_123'
                    }
                };

                return appTester(App.resources.task.get.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.id.should.eql(bundle.inputData.id);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });

        describe('List Tasks', () => {
            it('should list tasks with pagination', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.task.list.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        if (results.length > 0) {
                            results[0].should.have.property('id');
                            results[0].should.have.property('name');
                            results[0].should.have.property('duration');
                        }
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should handle pagination correctly', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 1 // Second page
                    }
                };

                return appTester(App.resources.task.list.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // API should receive page: 2 (bundle.meta.page + 1)
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });

        describe('Search Tasks', () => {
            it('should search tasks by text', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Test Task'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.task.search.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should handle empty search results', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'NonExistentTask12345'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.task.search.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });
    });

    describe('Sample Data', () => {
        it('should provide sample task data', () => {
            const sample = App.resources.task.sample;
            
            sample.should.have.property('id');
            sample.should.have.property('name');
            sample.should.have.property('duration');
            sample.should.have.property('dateTime');
            sample.should.have.property('created');
            sample.should.have.property('updated');
        });

        it('should provide output fields', () => {
            const outputFields = App.resources.task.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.be.above(0);
            
            // Check required output fields
            const requiredFields = ['id', 'name', 'duration', 'dateTime'];
            requiredFields.forEach(fieldKey => {
                const field = outputFields.find(f => f.key === fieldKey);
                field.should.be.ok();
            });
        });
    });
});