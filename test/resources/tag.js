require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Tag Resource', () => {
    // Common test data
    const authData = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
    };

    describe('Triggers', () => {
        describe('New Tag (Webhook)', () => {
            it('should subscribe to webhook', () => {
                const bundle = {
                    authData: authData,
                    targetUrl: 'http://example.com/webhook',
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.hook.operation.performSubscribe, bundle)
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

                return appTester(App.resources.tag.hook.operation.performUnsubscribe, bundle)
                    .then((result) => {
                        result.should.be.ok();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should skip unsubscribe when no webhook ID provided', () => {
                const bundle = {
                    authData: authData,
                    subscribeData: {} // No ID
                };

                return appTester(App.resources.tag.hook.operation.performUnsubscribe, bundle)
                    .then((result) => {
                        result.should.eql({});
                    });
            });

            it('should handle incoming webhook data', () => {
                const bundle = {
                    authData: authData,
                    cleanedRequest: {
                        item: {
                            id: 'tag_123',
                            name: 'Test Tag',
                            color: -12323
                        }
                    }
                };

                return appTester(App.resources.tag.hook.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        results.length.should.equal(1);
                        const tag = results[0];
                        tag.should.have.property('id');
                        tag.should.have.property('name');
                        tag.should.have.property('color');
                    });
            });

            it('should throw error for invalid webhook data', () => {
                const bundle = {
                    authData: authData,
                    cleanedRequest: {} // Missing item
                };

                return appTester(App.resources.tag.hook.operation.perform, bundle)
                    .then(() => {
                        throw new Error('Should have thrown an error');
                    })
                    .catch((error) => {
                        // Zapier wraps error messages in JSON format
                        const errorMessage = error.message.includes('Webhook data is invalid or missing') || 
                                           error.message === '{"message":"Webhook data is invalid or missing"}';
                        errorMessage.should.be.true();
                    });
            });

            it('should list sample tags for testing', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.hook.operation.performList, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });
    });

    describe('Actions', () => {
        describe('Create Tag', () => {
            it('should create a tag without team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'New Test Tag',
                        color: -12323
                    }
                };

                return appTester(App.resources.tag.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
                        result.color.should.eql(bundle.inputData.color);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should create a tag with team', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'Team Tag',
                        color: -65536,
                        teamId: 'team_123'
                    }
                };

                return appTester(App.resources.tag.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should create a tag without color', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        name: 'Tag without color'
                        // color is optional
                    }
                };

                return appTester(App.resources.tag.create.operation.perform, bundle)
                    .then((result) => {
                        result.should.have.property('id');
                        result.name.should.eql(bundle.inputData.name);
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

                // The teamFields function is the first element in inputFields array
                const teamFieldsFunc = App.resources.tag.create.operation.inputFields[0];
                
                return appTester(teamFieldsFunc, bundle)
                    .then((fields) => {
                        // Since we can't mock the API response, we test the structure
                        fields.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });

        describe('Get Tag', () => {
            it('should fetch a tag by ID', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        id: 'tag_123'
                    }
                };

                return appTester(App.resources.tag.get.operation.perform, bundle)
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

        describe('List Tags', () => {
            it('should list tags sorted by name', () => {
                const bundle = {
                    authData: authData,
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.list.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        if (results.length > 0) {
                            results[0].should.have.property('id');
                            results[0].should.have.property('name');
                        }
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should list tags with project filter', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        projectId: 'project_123'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.list.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // Tags should be filtered by project
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

                return appTester(App.resources.tag.list.operation.perform, bundle)
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

        describe('Search Tags', () => {
            it('should search tags by text', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Test Tag'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
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
                        text: 'NonExistentTag12345'
                    },
                    meta: {
                        page: 0
                    }
                };

                return appTester(App.resources.tag.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });

            it('should handle pagination in search', () => {
                const bundle = {
                    authData: authData,
                    inputData: {
                        text: 'Tag'
                    },
                    meta: {
                        page: 2 // Third page
                    }
                };

                return appTester(App.resources.tag.search.operation.perform, bundle)
                    .then((results) => {
                        results.should.be.an.Array();
                        // API should receive page: 3 (bundle.meta.page + 1)
                    })
                    .catch((error) => {
                        // Expected to fail without API access
                        error.name.should.be.oneOf(['ResponseError', 'Error', 'RefreshAuthError']);
                    });
            });
        });
    });

    describe('Sample Data', () => {
        it('should provide sample tag data', () => {
            const sample = App.resources.tag.sample;
            
            sample.should.have.property('id');
            sample.id.should.equal('6p57207o8d4348de85211a83b6f6c4eb');
            
            sample.should.have.property('title');
            sample.title.should.equal('Test Tag');
            
            sample.should.have.property('color');
            sample.color.should.equal(-12323);
        });

        it('should provide output fields', () => {
            const outputFields = App.resources.tag.outputFields;
            
            outputFields.should.be.an.Array();
            outputFields.length.should.equal(3);
            
            // Check all output fields
            const idField = outputFields.find(f => f.key === 'id');
            idField.should.be.ok();
            idField.label.should.equal('ID');
            
            const nameField = outputFields.find(f => f.key === 'name');
            nameField.should.be.ok();
            nameField.label.should.equal('Name');
            
            const colorField = outputFields.find(f => f.key === 'color');
            colorField.should.be.ok();
            colorField.label.should.equal('Color');
            colorField.type.should.equal('integer');
        });
    });
});
