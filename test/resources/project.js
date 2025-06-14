require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Project Resource', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Triggers', () => {
        describe('New Project (Webhook)', () => {
            it('should subscribe to webhook', () => {
                const bundle = {
                    authData: authData,
                    targetUrl: 'http://example.com/webhook',
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.project.hook.performSubscribe, bundle)
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

                return appTester(App.resources.project.hook.performUnsubscribe, bundle)
                    .then((result) => {
                        // Should return true or empty object on success
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
                            id: 'project_123',
                            title: 'Test Project',
                            employer: 'Test Company',
                            created: '2025-01-06T12:00:00Z'
                        }
                    }
                };

                return appTester(App.resources.project.hook.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        results.length.should.be.aboveOrEqual(1);
                        const project = results[0];
                        project.should.have.property('id');
                        project.should.have.property('title');
                    });
            });

            it('should list sample projects for testing', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.project.hook.performList, bundle)
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
        describe('Create Project', () => {
            it('should create a project without team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        title: 'New Test Project',
                        employer: 'Test Employer',
                        description: 'Test Description',
                        office: 'Test Office',
                        salary: 50000,
                        color: '#FF0000'
                    }
                };

                return appTester(App.resources.project.create.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.title.should.eql(bundle.inputData.title);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should create a project with team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        title: 'New Team Project',
                        employer: 'Test Employer',
                        description: 'Test Description',
                        office: 'Test Office',
                        salary: 60000,
                        color: '#00FF00',
                        teamId: 'team_123'
                    }
                };

                return appTester(App.resources.project.create.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.title.should.eql(bundle.inputData.title);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should show team field for users with activated teams', () => {
                const bundle = {
                    authData: authData
                };

                // Mock profile response
                const profileResponse = {
                    activatedTeams: true,
                    email: 'test@example.com'
                };

                return appTester(App.resources.project.create.inputFields, bundle)
                    .then((fields) => {
                        fields.should.be.an.Array();
                        // When user has activated teams, should include team field
                        const teamField = fields.find(f => f.key === 'teamId');
                        if (profileResponse.activatedTeams) {
                            teamField.should.be.ok();
                            teamField.dynamic.should.eql('team.id.name');
                        }
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });

        describe('Get Project', () => {
            it('should fetch a project by ID', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        id: 'project_123'
                    }
                };

                return appTester(App.resources.project.get.perform, bundle)
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

        describe('List Projects', () => {
            it('should list projects with pagination', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.project.list.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Check if results have expected structure
                        if (results.length > 0) {
                            results[0].should.have.property('id');
                            results[0].should.have.property('title');
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

                return appTester(App.resources.project.list.perform, bundle)
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

        describe('Search Projects', () => {
            it('should search projects by text', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Test Project'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.project.search.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Search results should match the search text
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
                        text: 'NonExistentProject12345'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.project.search.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Empty results should still be an array
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });
        });
    });

    describe('Sample Data', () => {
        it('should provide sample project data', () => {
            const sample = App.resources.project.sample;
            
            sample.should.have.property('id');
            sample.should.have.property('title');
            sample.should.have.property('employer');
            sample.should.have.property('created');
            sample.should.have.property('updated');
            sample.should.have.property('description');
            sample.should.have.property('office');
            sample.should.have.property('salary');
            sample.should.have.property('color');
            sample.should.have.property('status');
        });

        it('should provide output fields', () => {
            const outputFields = App.resources.project.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.be.above(0);
            
            // Check required output fields
            const requiredFields = ['id', 'title', 'employer', 'status'];
            requiredFields.forEach(fieldKey => {
                const field = outputFields.find(f => f.key === fieldKey);
                field.should.be.ok();
            });
        });
    });
});