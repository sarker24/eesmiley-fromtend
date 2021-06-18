const app = require('../../src/app').default;
const sinon = require('sinon');

const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAdminAccessToken = app.get('testLongLivedAdminAccessToken');

describe('account-status endpoint', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    });

    it('should get account status for selected accounts', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-11-04&accounts=1,51', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '1': {
                    name: 'Customer 1',
                    expectedDays: 81,
                    registeredDays: 1
                },
                '51': {
                    name: 'Customer 51',
                    expectedDays: 162,
                    registeredDays: 1
                }
            });
        });
    });

    it('should get account status for selected accounts within another date period', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-08-04&accounts=1,51', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '1': {
                    name: 'Customer 1',
                    expectedDays: 42,
                    registeredDays: 0
                },
                '51': {
                    name: 'Customer 51',
                    expectedDays: 83,
                    registeredDays: 1
                }
            });
        });
    });

    it('should get account status for selected accounts within another date period and only 1 account', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-08-04&accounts=51', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '51': {
                    name: 'Customer 51',
                    expectedDays: 83,
                    registeredDays: 1
                }
            });
        });
    });

    it('should get account status for selected accounts with a non-admin token', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-08-04&accounts=51', {
            'headers': {
                'Authorization': 'Bearer ' + longLiveAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '1': {
                    name: 'Customer 1',
                    expectedDays: 42,
                    registeredDays: 0
                }
            });
        });
    });

    it('should get account status for selected accounts with subscribed accounts', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-11-04&accounts=1&includeSubscribedAccounts=true', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '1': {
                    name: 'Customer 1',
                    expectedDays: 81,
                    registeredDays: 1,
                    subscribedAccounts: {
                        '4': {
                            expectedDays: 135,
                            name: 'Some company',
                            registeredDays: 0
                        },
                        '5': {
                            expectedDays: 53,
                            name: 'Some other company',
                            registeredDays: 0
                        },
                        '10240': {
                            expectedDays: 81,
                            name: '(1339) KLP Ørestad 5H ',
                            registeredDays: 0
                        },
                        '10244': {
                            expectedDays: 81,
                            name: '(1122) Dong Asnæsværket',
                            registeredDays: 0
                        },
                        '10479': {
                            expectedDays: 81,
                            name: '(1190) Novo Nordisk EG',
                            registeredDays: 0
                        },
                        '10544': {
                            expectedDays: 81,
                            name: '(1189) Novo Nordisk AE',
                            registeredDays: 0
                        }
                    }

                }
            });
        });
    });

    it('should get account status for selected accounts with subscribed accounts from customer id 51', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-11-04&accounts=51&includeSubscribedAccounts=true', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal({
                '51': {
                    name: 'Customer 51',
                    expectedDays: 162,
                    registeredDays: 1,
                    subscribedAccounts: {
                        '1': {
                            expectedDays: 81,
                            name: 'eSmiley',
                            registeredDays: 1
                        },
                    }

                }
            });
        });
    });
    it('should get account status for no valid accounts', () => {
        return chakram.request('GET', '/account-status?start=2017-05-01&end=2017-11-04&accounts=329328439&includeSubscribedAccounts=true', {
            'headers': {
                'Authorization': 'Bearer ' + longLivedAdminAccessToken
            }
        }).then((res) => {
            expectChakram(res).to.have.status(200);
            expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
            expectChakram(res.body).to.have.property('registrationDaysPerAccount');
            expectChakram(res.body.registrationDaysPerAccount).to.deep.equal([]);
        });
    });
});

