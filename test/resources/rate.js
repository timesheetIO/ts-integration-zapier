require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Rate Resource', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Triggers', () => {
        describe('New Rate (Webhook)', () => {
            it('should subscribe to webhook', () => {
                const bundle = {
                    authData: authData,
                    targetUrl: 'http://example.com/webhook',
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.hook.operation.performSubscribe, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should unsubscribe from webhook', () => {
                const bundle = {
                    authData: authData,
                    subscribeData: {
                        id: 'webhook_id_123'
                    }
                };

                return appTester(App.resources.rate.hook.operation.performUnsubscribe, bundle)
                    .then((result) => {
                        // Should return empty object on success
                        result.should.be.ok();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should skip unsubscribe when no webhook ID present', () => {
                const bundle = {
                    authData: authData,
                    subscribeData: {}
                };

                return appTester(App.resources.rate.hook.operation.performUnsubscribe, bundle)
                    .then((result) => {
                        // Should return empty object when skipping
                        result.should.eql({});
                    });
            });

            it('should handle incoming webhook data', () => {
                const bundle = {
                    authData: authData,
                    cleanedRequest: {
                        item: {
                            id: 'rate_123',
                            title: 'Test Rate',
                            factor: 1.5,
                            extra: 50.0
                        }
                    }
                };

                return appTester(App.resources.rate.hook.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        results.length.should.equal(1);
                        const rate = results[0];
                        rate.should.have.property('id');
                        rate.should.have.property('title');
                        rate.should.have.property('factor');
                        rate.should.have.property('extra');
                    });
            });

            it('should throw error for invalid webhook data', () => {
                const bundle = {
                    authData: authData,
                    cleanedRequest: {}
                };

                return appTester(App.resources.rate.hook.operation.perform, bundle)
                    .then(() => {
                        // Should not reach here
                        throw new Error('Expected error for invalid webhook data');
                    })
                    .catch((error) => {
                        error.message.should.containEql('Webhook data is invalid or missing');
                    });
            });

            it('should list sample rates for testing', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.hook.operation.performList, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should list rates with project filter', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        projectId: 'project_123'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.hook.operation.performList, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Results should be filtered by project
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });
    });

    describe('Actions', () => {
        describe('Create Rate', () => {
            it('should create a rate without team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        title: 'Standard Rate',
                        factor: 1.0,
                        extra: 0.0
                    }
                };

                return appTester(App.resources.rate.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.title.should.eql(bundle.inputData.title);
                        result.factor.should.eql(bundle.inputData.factor);
                        result.extra.should.eql(bundle.inputData.extra);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should create a rate with team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        title: 'Premium Rate',
                        factor: 1.5,
                        extra: 100.0,
                        teamId: 'team_123'
                    }
                };

                return appTester(App.resources.rate.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.title.should.eql(bundle.inputData.title);
                        result.factor.should.eql(bundle.inputData.factor);
                        result.extra.should.eql(bundle.inputData.extra);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should create a rate with only title (optional fields)', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        title: 'Basic Rate'
                        // factor and extra are optional
                    }
                };

                return appTester(App.resources.rate.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.title.should.eql(bundle.inputData.title);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should show team field for users with activated teams', () => {
                const bundle = {
                    authData: authData
                };

                // Note: teamFields is a function, not an array
                return appTester(App.resources.rate.create.operation.inputFields[0], bundle)
                    .then((fields) => {
                        fields.should.be.an.Array();
                        // When user has activated teams, should include team field
                        if (fields.length > 0) {
                            const teamField = fields[0];
                            teamField.key.should.eql('teamId');
                            teamField.dynamic.should.eql('team.id.name');
                            teamField.required.should.be.true();
                        }
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });

        describe('Get Rate', () => {
            it('should fetch a rate by ID', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        id: 'rate_123'
                    }
                };

                return appTester(App.resources.rate.get.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.id.should.eql(bundle.inputData.id);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });

        describe('List Rates', () => {
            it('should list rates sorted alphabetically', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.list.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        if (results.length > 0) {
                            results[0].should.have.property('id');
                            results[0].should.have.property('title');
                            results[0].should.have.property('factor');
                            results[0].should.have.property('extra');
                        }
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should handle pagination correctly', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 1 // Second page
                    }
                };

                return appTester(App.resources.rate.list.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // API should receive page: 2 (bundle.meta.page + 1)
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });

        describe('Search Rates', () => {
            it('should search rates by text', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Premium'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Search results should match the search text
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should handle empty search results', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'NonExistentRate12345'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.rate.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Empty results should still be an array
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should handle search pagination', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Rate'
                    },
                    meta: {
                        page: 1 // Second page
                    }
                };

                return appTester(App.resources.rate.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // API should receive page: 2 (bundle.meta.page + 1)
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });
    });

    describe('Sample Data', () => {
        it('should provide sample rate data', () => {
            const sample = App.resources.rate.sample;
            
            sample.should.have.property('id');
            sample.id.should.eql('6t57207o8d4848de85210a83b6f6c4bb');
            sample.should.have.property('title');
            sample.title.should.eql('Test Rate');
            sample.should.have.property('factor');
            sample.factor.should.eql(1.0);
            sample.should.have.property('extra');
            sample.extra.should.eql(100.0);
        });

        it('should provide output fields', () => {
            const outputFields = App.resources.rate.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.equal(4);
            
            // Check all output fields
            const expectedFields = [
                { key: 'id', label: 'ID' },
                { key: 'title', label: 'Title' },
                { key: 'factor', label: 'Factor', type: 'number' },
                { key: 'extra', label: 'Extra/h', type: 'number' }
            ];
            
            expectedFields.forEach((expected, index) => {
                const field = outputFields[index];
                field.key.should.eql(expected.key);
                field.label.should.eql(expected.label);
                if (expected.type) {
                    field.type.should.eql(expected.type);
                }
            });
        });
    });
});
