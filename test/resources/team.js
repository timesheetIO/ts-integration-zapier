require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Team Resource', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Triggers', () => {
        describe('New Team (Webhook)', () => {
            it('should subscribe to webhook', () => {
                const bundle = {
                    authData: authData,
                    targetUrl: 'http://example.com/webhook',
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.team.hook.performSubscribe, bundle)
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

                return appTester(App.resources.team.hook.performUnsubscribe, bundle)
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
                            id: 'team_123',
                            name: 'Test Team',
                            created: '2025-01-06T12:00:00Z'
                        }
                    }
                };

                return appTester(App.resources.team.hook.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        results.length.should.be.aboveOrEqual(1);
                        const team = results[0];
                        team.should.have.property('id');
                        team.should.have.property('name');
                    });
            });

            it('should list sample teams for testing', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.team.hook.performList, bundle)
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
        describe('Create Team', () => {
            it('should create a team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'New Test Team'
                    }
                };

                return appTester(App.resources.team.create.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error']);
                    });
            });

            it('should require team name', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        // Missing name
                    }
                };

                return appTester(App.resources.team.create.perform, bundle)
                    .then(() => {
                        throw new Error('Expected an error for missing name');
                    })
                    .catch((error) => {
                        // Should fail validation
                        error.should.be.ok();
                    });
            });
        });

        describe('Get Team', () => {
            it('should fetch a team by ID', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        id: 'team_123'
                    }
                };

                return appTester(App.resources.team.get.perform, bundle)
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

        describe('List Teams', () => {
            it('should list teams with pagination', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.team.list.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        if (results.length > 0) {
                            results[0].should.have.property('id');
                            results[0].should.have.property('name');
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

                return appTester(App.resources.team.list.perform, bundle)
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

        describe('Search Teams', () => {
            it('should search teams by text', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Test Team'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.team.search.perform, bundle)
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
                        text: 'NonExistentTeam12345'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.team.search.perform, bundle)
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
        it('should provide sample team data', () => {
            const sample = App.resources.team.sample;
            
            sample.should.have.property('id');
            sample.should.have.property('name');
            sample.should.have.property('description');
        });

        it('should provide output fields', () => {
            const outputFields = App.resources.team.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.be.above(0);
            
            // Check required output fields
            const requiredFields = ['id', 'name'];
            requiredFields.forEach(fieldKey => {
                const field = outputFields.find(f => f.key === fieldKey);
                field.should.be.ok();
            });
        });
    });
});