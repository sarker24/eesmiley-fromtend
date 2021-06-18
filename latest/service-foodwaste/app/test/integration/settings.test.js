const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');
const longLivedAccessTokenNewCustomer = app.get('testLongLivedAccessTokenNewCustomer');
const longLivedAccessTokenCustomer11 = app.get('testLongLivedAccessTokenCustomerId11');
const longLivedAccessTokenCustomer2 = app.get('testLongLivedAccessTokenCustomerId2');

const commons = require('feathers-commons-esmiley');
const sinon = require('sinon');

describe('settings endpoint', () => {
  const sandbox = sinon.createSandbox();
  let legacyResponse;

  beforeEach(() => {

    legacyResponse = {
      current: { dealId: '1', company: 'Customer 1' },
      children: [
        { dealId: '10558', company: '(1139)  Novo Nordisk JC' },
        { dealId: '10712', company: '(1195) Novo Nordisk DD' },
        { dealId: '10795', company: '(1379) KLP 5G' },
        { dealId: '11163', company: '(1337) Havneholmen Atrium ' },
        { dealId: '11167', company: '(1381) Bonnier Publications' },
        { dealId: '11179', company: '(1155) Novo Nordisk  Fritidscenter' },
        { dealId: '10240', company: "(1339) KLP Ørestad 5H " },
        { dealId: '10244', company: "(1122) Dong Asnæsværket" },
        { dealId: '10479', company: "(1190) Novo Nordisk EG" },
        { dealId: '10507', company: "(1191) Novo Nordisk DF" },
        { dealId: '10525', company: "(1194) Novo Nordisk HC" },
        { dealId: '10544', company: "(1189) Novo Nordisk AE" }
      ]
    };

    global.makeHttpRequestMock.resolves(legacyResponse);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all settings', async () => {
    const res = await chakram.request('GET', '/settings', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body).to.deep.equal(
      {
        name: 'Customer 1',
        areas: ['Køkken'],
        accounts: [
          {
            id: 10240,
            name: '(1339) KLP Ørestad 5H ',
            settingsAreSet: true
          },
          {
            id: 10244,
            name: '(1122) Dong Asnæsværket',
            settingsAreSet: false
          },
          {
            id: 10479,
            name: '(1190) Novo Nordisk EG',
            settingsAreSet: true
          },
          {
            id: 10507,
            name: '(1191) Novo Nordisk DF',
            settingsAreSet: false
          },
          {
            id: 10525,
            name: '(1194) Novo Nordisk HC',
            settingsAreSet: false
          },
          {
            id: 10544,
            name: '(1189) Novo Nordisk AE',
            settingsAreSet: false
          },
          { id: 1, name: 'eSmiley', settingsAreSet: true },
          { id: 2, name: 'Fields', settingsAreSet: false },
          { id: 3, name: 'Kebabistan', settingsAreSet: false },
          { id: 4, name: 'Some company', settingsAreSet: false },
          { id: 5, name: 'Some other company', settingsAreSet: false }],
        currency: 'DKK',
        unit: 'kg',
        categories: [{ name: 'Kød', products: [{ cost: 7500, name: 'Svin' }] }],
        expectedWeeklyWaste: { '0': 100000, '2018-08-01': 200000 },
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedFoodwaste: [
          {
            amount: 100000,
            from: "1970-01-01",
            period: "week",
            unit: "g"
          },
          {
            amount: 200000,
            from: "2018-08-01",
            period: "week",
            unit: "g"
          }
        ],
        expectedFoodwastePerGuest: [
          {
            amount: 80,
            from: "1970-01-01",
            period: "fixed",
            unit: "g"
          }
        ],
        expectedFrequency: [
          {
            days: [
              1,
              2,
              3,
            ],
            from: "1970-01-01"
          }
        ],
        perGuestBaseline: [
          {
            amount: 110,
            from: "1970-01-01",
            period: "fixed",
            unit: "g"
          }
        ],
        perGuestStandard: [
          {
            amount: 60,
            from: "1970-01-01",
            period: "fixed",
            unit: "g",
          }
        ]
      });
  });

  it('should be able to create a setting', async () => {
    const res = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          "areas": [
            "KITCHEN"
          ],
          "currency": "EUR",
          "categories": [
            {
              "name": "Nigguh",
              "products": [
                {
                  "cost": 7500,
                  "name": "Svin"
                }
              ]
            }
          ],
          "alarms": {
            "zone": "Europe/Copenhagen",
            "enabled": true,
            "message": "You missing some registrations for today, dawg!",
            "recipients": [
              { "name": "Nigguh", "type": "email", "value": "mah_nigguh@esmiley.dk" },
              { "name": "Nigguh", "type": "sms", "value": "@45+12 34=5 6-7 8/" } // the phone number has spaces and other random symbols
            ],
            "executionTime": "12"
          }
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const settings = res.body;
    expectChakram(settings.hasOwnProperty('id')).to.equal(false);
    expectChakram(settings.areas).to.deep.equal(['KITCHEN']);
    expectChakram(settings.currency).to.equal('EUR');
    expectChakram(settings.categories[0].name).to.equal('Nigguh');
    expectChakram(settings.alarms.recipients[1].value).to.equal('4512345678');

    /*
     * We type the ID statically, instead of getting it dynamically from the response body, because the response is
     * formatted to only return the current settings data, and no other info.
     */
    const getSettingsRes = await chakram.request('GET', '/settings/10000');
    expectChakram(getSettingsRes).to.have.status(200);
    expectChakram(getSettingsRes).to.have.header('content-type', 'application/json; charset=utf-8');

    const newSettings = getSettingsRes.body.current;
    expectChakram(getSettingsRes.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(newSettings.areas).to.deep.equal(['KITCHEN']);
    expectChakram(newSettings.currency).to.equal('EUR');
    expectChakram(newSettings.categories[0].name).to.equal('Nigguh');
    expectChakram(settings.alarms.recipients[1].value).to.equal('4512345678');
  });

  it('should create a bootstrap-task after creating settings', async () => {
    global.makeHttpRequestMock.returns(Promise.resolve(legacyResponse));

    const res = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          "bootstrapTemplateId": 10000,
          "currency": "DKK"
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const settings = res.body;
    expectChakram(settings.hasOwnProperty('id')).to.equal(false);
    expectChakram(settings.name).to.equal('Customer 1');
    expectChakram(settings.currency).to.equal('DKK');
    expectChakram(global.makeHttpRequestMock.calledOnce).to.equal(true);

    /*
     * We get products with the same customerId, ensuring that bootstraps were triggered
     */
    const registrationPointsRes = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });

    expectChakram(registrationPointsRes).to.have.status(200);
    expectChakram(registrationPointsRes).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(registrationPointsRes.body.length > 0).to.equal(true);
  });

  it('should NOT trigger bootstrap populator after creating settings if bootstrapData flag is not true', async () => {
    const regPointsBefore = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });

    const res = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          name: "Some company, yo",
          "currency": "DKK"
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const settings = res.body;
    expectChakram(settings.hasOwnProperty('id')).to.equal(false);
    expectChakram(settings.currency).to.equal('DKK');

    expectChakram(global.makeHttpRequestMock.notCalled).to.equal(true);

    const regPointsAfter = await chakram.request('GET', '/registration-points', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });

    expectChakram(regPointsAfter).to.have.status(200);
    expectChakram(regPointsAfter).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(regPointsAfter.body.length === regPointsBefore.body.length).to.equal(true);
    expectChakram(regPointsAfter.body.length === 0).to.equal(true);
  });

  it('should be able to patch currency', async () => {
    const res = await chakram.request('PATCH', '/settings/10000', {
      'body': [{
        'op': 'replace',
        'path': '/current/currency',
        'value': 'COP'
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const resGet = await chakram.request('GET', '/settings/10000');
    expectChakram(resGet.body.id).to.equal('10000');
    expectChakram(resGet.body.current.currency).to.equal('COP');
  });

  it('should be able to patch currency to COP and then to DKK', () => {
    return chakram.request('PATCH', '/settings/10000', {
      'body': [
        {
          "op": "replace",
          "path": "/current/currency",
          "value": "COP"
        },
        {
          "op": "replace",
          "path": "/current/currency",
          "value": "DKK"
        }
      ],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      return chakram.request('GET', '/settings/10000').then((res) => {
        expectChakram(res.body.id).to.equal('10000');
        expectChakram(res.body.current.currency).to.equal('DKK');
      });
    });
  });

  it('should get all settings if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('GET', '/settings', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body).to.deep.equal(
      {
        name: 'Customer 1',
        areas: ['Køkken'],
        accounts: [
          {
            id: 10240,
            name: '(1339) KLP Ørestad 5H ',
            settingsAreSet: true
          },
          {
            id: 10244,
            name: '(1122) Dong Asnæsværket',
            settingsAreSet: false
          },
          {
            id: 10479,
            name: '(1190) Novo Nordisk EG',
            settingsAreSet: true
          },
          {
            id: 10507,
            name: '(1191) Novo Nordisk DF',
            settingsAreSet: false
          },
          {
            id: 10525,
            name: '(1194) Novo Nordisk HC',
            settingsAreSet: false
          },
          {
            id: 10544,
            name: '(1189) Novo Nordisk AE',
            settingsAreSet: false
          },
          { id: 1, name: 'eSmiley', settingsAreSet: true },
          { id: 2, name: 'Fields', settingsAreSet: false },
          { id: 3, name: 'Kebabistan', settingsAreSet: false },
          { id: 4, name: 'Some company', settingsAreSet: false },
          { id: 5, name: 'Some other company', settingsAreSet: false }],
        currency: 'DKK',
        unit: 'kg',
        categories: [{ name: 'Kød', products: [{ cost: 7500, name: 'Svin' }] }],
        expectedWeeklyWaste: { '0': 100000, '2018-08-01': 200000 },
        registrationsFrequency: { '0': [1, 2, 3] },
        expectedFoodwaste: [
          {
            amount: 100000,
            from: "1970-01-01",
            period: "week",
            unit: "g"
          },
          {
            amount: 200000,
            from: "2018-08-01",
            period: "week",
            unit: "g"
          }
        ],
        expectedFoodwastePerGuest: [
          {
            amount: 80,
            from: "1970-01-01",
            period: "fixed",
            unit: "g"
          }
        ],
        expectedFrequency: [
          {
            days: [
              1,
              2,
              3,
            ],
            from: "1970-01-01"
          }
        ],
        perGuestBaseline: [
          {
            amount: 110,
            from: "1970-01-01",
            period: "fixed",
            unit: "g"
          }
        ],
        perGuestStandard: [
          {
            amount: 60,
            from: "1970-01-01",
            period: "fixed",
            unit: "g",
          }
        ]
      }
    );
  });

  it('should be able to create a setting if a JWT with customerID as integer is used', async () => {
    const res = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          "name": 'Some company',
          "areas": [
            "KITCHEN"
          ],
          "currency": "EUR",
          "categories": [
            {
              "name": "Nigguh",
              "products": [
                {
                  "cost": 7500,
                  "name": "Svin"
                }
              ]
            }
          ],
          "alarms": {
            "zone": "Europe/Copenhagen",
            "enabled": true,
            "message": "You missing some registrations for today, dawg!",
            "recipients": [
              { "name": "Nigguh", "type": "email", "value": "mah_nigguh@esmiley.dk" },
              { "name": "Nigguh", "type": "sms", "value": "@45+12 34=5 6-7 8/" } // the phone number has spaces and other random symbols
            ],
            "executionTime": "12"
          }
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    const settings = res.body;
    expectChakram(settings.hasOwnProperty('id')).to.equal(false);
    expectChakram(settings.name).to.deep.equal('Some company');
    expectChakram(settings.areas).to.deep.equal(['KITCHEN']);
    expectChakram(settings.currency).to.equal('EUR');
    expectChakram(settings.categories[0].name).to.equal('Nigguh');

    expectChakram(settings.alarms.recipients[1].value).to.equal('4512345678');

    /*
     * We type the ID statically, instead of getting it dynamically from the response body, because the response is
     * formatted to only return the current settings data, and no other info.
     */
    const resGet = await chakram.request('GET', '/settings/10000');
    expectChakram(resGet).to.have.status(200);
    expectChakram(resGet).to.have.header('content-type', 'application/json; charset=utf-8');

    const settingsFromGet = resGet.body.current;
    expectChakram(resGet.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(settingsFromGet.areas).to.deep.equal(['KITCHEN']);
    expectChakram(settingsFromGet.currency).to.equal('EUR');
    expectChakram(settingsFromGet.categories[0].name).to.equal('Nigguh');
    expectChakram(settings.alarms.recipients[1].value).to.equal('4512345678');
  });

  /*
   * ========================================================================
   * /settings/<customer_id>/accounts endpoint
   */
  describe('accounts endpoint', () => {

    it('Should return an object of lists of "subscribed" and "notSubscribed" accounts', async () => {
      const res = await chakram.request('GET', '/settings/1/accounts', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.have.property('subscribed');
      expectChakram(body).to.have.property('notSubscribed');

      expectChakram(body.subscribed.length).to.equal(6);
      // The following accounts have their own records in the Settings model in DB. That's why we don't stub anything
      expectChakram(body.subscribed[0].id).to.equal(10240);
      expectChakram(body.subscribed[0]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[0].settingsAreSet).to.equal(true);  // has both regFrequency and expectedWeeklyWaste set with values

      expectChakram(body.subscribed[1].id).to.equal(10244);
      expectChakram(body.subscribed[1]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[1].settingsAreSet).to.equal(false); // has both settings set but expectedWaste is an empty object

      expectChakram(body.subscribed[2].id).to.equal(10479);
      expectChakram(body.subscribed[2]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[2].settingsAreSet).to.equal(true); // has both regFrequency and expectedWeeklyWaste set with values

      expectChakram(body.subscribed[3].id).to.equal(10507);
      expectChakram(body.subscribed[3]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[3].settingsAreSet).to.equal(false); // has both settings set but regFrequency is an empty array

      expectChakram(body.subscribed[4].id).to.equal(10525);
      expectChakram(body.subscribed[4]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[4].settingsAreSet).to.equal(false); // regFrequency setting is not set at all

      expectChakram(body.subscribed[5].id).to.equal(10544);
      expectChakram(body.subscribed[5]).to.have.property('settingsAreSet');
      expectChakram(body.subscribed[5].settingsAreSet).to.equal(false); // expectedWaste setting is not set at all
    });

    it('Should remove subscribed account that has been removed from legacy', async () => {
      const legacyUpdateResponse = {
        ...legacyResponse,
        children: legacyResponse.children.filter(account => account.dealId !== '10240')
      };
      global.makeHttpRequestMock.resolves(legacyUpdateResponse);

      const res = await chakram.request('GET', '/settings/1/accounts', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.have.property('subscribed');
      expectChakram(body).to.have.property('notSubscribed');

      const expectedSubIds = new Set([10244, 10479, 10507, 10525, 10544]);

      expectChakram(body.subscribed.length).to.equal(expectedSubIds.size);
      expectChakram(body.subscribed.every(account => expectedSubIds.has(account.id))).to.equal(true);
    });

    it('Should return all accounts from Legacy as "notSubscribed" when the customer has no "accounts" in their settings',
      async () => {
        const res = await chakram.request('GET', '/settings/11/accounts', {
          'headers': {
            'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
          }
        });
        expectChakram(res).to.have.status(200);
        expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

        const body = res.body;
        expectChakram(body).to.have.property('subscribed');
        expectChakram(body).to.have.property('notSubscribed');

        expectChakram(body.subscribed).to.deep.equal([]);
        expectChakram(body.notSubscribed.length).to.equal(12);
        /*
         * since we change "deadlId" and "company" params from Legacy to "id" and "name", we can't deep.equal() check
         * with the legacyAccounts object directly. Therefore we choose a few accounts to match the ID and name values
         */
        expectChakram(body.notSubscribed[0]).to.deep.equal({ id: 10558, name: '(1139)  Novo Nordisk JC' });
        expectChakram(body.notSubscribed[2]).to.deep.equal({ id: 10795, name: '(1379) KLP 5G' });
        expectChakram(body.notSubscribed[5]).to.deep.equal({ id: 11179, name: '(1155) Novo Nordisk  Fritidscenter' });
        expectChakram(body.notSubscribed[8]).to.deep.equal({ id: 10479, name: '(1190) Novo Nordisk EG' });

      });

    it('Should return an error when getting accounts from Legacy returns an error', async () => {
      global.makeHttpRequestMock.rejects({ err: 'some err' });

      const res = await chakram.request('GET', '/settings/1/accounts', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(500);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.message).to.equal('Could not retrieve settings for customer');
      expectChakram(body.errorCode).to.equal('E187');
    });

  });

  /*
   * ==========================================
   * Checking for accounts having set settings
   */
  it('Should return settings with no "accounts" property', async () => {
    const settings = {
      currency: 'DKK',
      bootstrapData: false,
      categoriesHidden: false,
      showDeactivatedAreas: false,
      languageBootstrapData: 'dk',
      expectedFrequency: [
        {
          days: [
            1,
            2,
            3,
          ],
          from: "1970-01-01"
        }
      ],
      perGuestBaseline: [
        {
          amount: 110,
          from: "1970-01-01",
          period: "fixed",
          unit: "g"
        }
      ],
      perGuestStandard: [
        {
          amount: 40,
          from: "1970-01-01",
          period: "fixed",
          unit: "g",
        }
      ]
    };
    const res = await chakram.request('POST', '/settings', {
      'body': {
        settings
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNewCustomer
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    // we add the name to the object we want to check against, because it was added to the record dynamically
    settings.name = 'Customer 1';

    Object.keys(settings).forEach(key => expectChakram(settings[key]).to.deep.equal(res.body[key]));
  });

  it('Should filter out accounts that user does not have access to', async () => {

    const accounts = [{ id: 1, name: 'heman\'s secret account' }, {
      id: 10558,
      name: '(1139)  Novo Nordisk JC'
    }, { id: 10712, name: '(1195) Novo Nordisk DD' }];

    const settings = {
      name: 'Some company',
      currency: 'DKK',
      bootstrapData: false,
      categoriesHidden: false,
      showDeactivatedAreas: false,
      languageBootstrapData: 'dk',
      accounts
    };
    const res = await chakram.request('POST', '/settings', {
      'body': {
        settings
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.accounts.some(account => account.id === 1)).to.equal(false);
  });

  it('Should return settings with "accounts" property all with "false" settingsAreSet property when the accounts ' +
    'in the passed list have no settings set in the DB', async () => {

    const accounts = [{ id: 10558, name: '(1139)  Novo Nordisk JC' }, { id: 10712, name: '(1195) Novo Nordisk DD' }];
    const settings = {
      name: 'Some company',
      currency: 'DKK',
      bootstrapData: false,
      categoriesHidden: false,
      showDeactivatedAreas: false,
      languageBootstrapData: 'dk',
      accounts
    };
    const res = await chakram.request('POST', '/settings', {
      'body': {
        settings
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    // add the properties that are supposed to be present after the request, just for easier comparison
    accounts[0].settingsAreSet = false;
    accounts[1].settingsAreSet = false;
    expectChakram(res.body.accounts).to.deep.equal(accounts);

    // also check that the customer has their proper settings set now
    const resGet = await chakram.request('GET', '/settings', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
      }
    });
    expectChakram(resGet.body.accounts).to.deep.equal(accounts);
  });

  it('Should return settings with "accounts" property with "true" settingsAreSet property when one of the accounts ' +
    'in the passed list has settings set in the DB', async () => {
    // account with customerID 10240 has their settings properly set (in the model fixtures)
    //     const accounts = [{ id: 10558, name: '(1139)  Novo Nordisk JC' }, { id: 10712, name: '(1195) Novo Nordisk DD' }];
    const accounts = [{ id: 10240, name: 'Hakuna matata' }, { id: 10558, name: '(1139)  Novo Nordisk JC' }];
    const settings = {
      name: 'Some company',
      currency: 'DKK',
      bootstrapData: false,
      categoriesHidden: false,
      showDeactivatedAreas: false,
      languageBootstrapData: 'dk',
      accounts
    };
    const res = await chakram.request('POST', '/settings', {
      'body': {
        settings
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
      }
    });
    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    // add the properties that are supposed to be present after the request, just for easier comparison
    accounts[0].settingsAreSet = true;
    accounts[1].settingsAreSet = false;
    expectChakram(res.body.accounts).to.deep.equal(accounts);

    // also check that the customer has their proper settings set now
    const resGet = await chakram.request('GET', '/settings', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer11
      }
    });
    expectChakram(resGet.body.accounts).to.deep.equal(accounts);
  });

  it('Should return settings with "accounts" property with "false" settingsAreSet property when one of the accounts ' +
    'in the passed list has settings set in the DB', async () => {
    /*
     * Customer with ID 1 has the following accounts in their settings, but without the 'settingsAreSet' property,
     * so we set them here as mock object to compare to.
     * Each account that has "false" value doesn't have their own settings properly set. "true" mean the settings are OK
     */
    const accounts = [
      { id: 10240, name: "(1339) KLP Ørestad 5H ", settingsAreSet: true },
      { id: 10244, name: "(1122) Dong Asnæsværket", settingsAreSet: false },
      { id: 10479, name: "(1190) Novo Nordisk EG", settingsAreSet: true },
      { id: 10507, name: "(1191) Novo Nordisk DF", settingsAreSet: false },
      { id: 10525, name: "(1194) Novo Nordisk HC", settingsAreSet: false },
      { id: 10544, name: "(1189) Novo Nordisk AE", settingsAreSet: false },
      { id: 1, name: "eSmiley", settingsAreSet: true },
      { id: 2, name: "Fields", settingsAreSet: false },
      { id: 3, name: "Kebabistan", settingsAreSet: false },
      {
        id: 4,
        name: 'Some company',
        settingsAreSet: false
      },
      {
        id: 5,
        name: 'Some other company',
        settingsAreSet: false
      }
    ];

    const res = await chakram.request('GET', '/settings', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.accounts).to.deep.equal(accounts);
  });

  it('should be able to enable guest types using delete migration with PATCH', async () => {
    const { body: guestRegistrationsBefore } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const res = await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true, migrationStrategy: { op: 'delete' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: guestRegistrationsAfter } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const sumOfGuestsBefore = guestRegistrationsBefore.reduce((sum, current) => sum + current.amount, 0);
    const sumOfGuestsAfter = guestRegistrationsAfter.reduce((sum, current) => sum + current.amount, 0);

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.current.guestTypes.enabled).to.equal(true);
    expectChakram(sumOfGuestsBefore > 0).to.equal(true);
    expectChakram(sumOfGuestsAfter === 0).to.equal(true);
    expectChakram(guestRegistrationsBefore.length > 0).to.equal(true);
    expectChakram(guestRegistrationsAfter.length === 0).to.equal(true);
  });

  it('should be able to enable guest types using useDefault migration with PATCH', async () => {
    const { body: guestRegistrationsBefore } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const res = await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true, migrationStrategy: { op: 'useDefault', value: '10000' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: guestRegistrationsAfter } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const sumOfGuestsBefore = guestRegistrationsBefore.reduce((sum, current) => sum + current.amount, 0);
    const sumOfGuestsAfter = guestRegistrationsAfter.reduce((sum, current) => sum + current.amount, 0);

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.current.guestTypes.enabled).to.equal(true);
    expectChakram(sumOfGuestsBefore > 0).to.equal(true);
    expectChakram(sumOfGuestsBefore === sumOfGuestsAfter).to.equal(true);
    expectChakram(guestRegistrationsBefore.length === guestRegistrationsAfter.length).to.equal(true);
    expectChakram(guestRegistrationsBefore.every(registration => !registration.guestType)).to.equal(true);
    expectChakram(guestRegistrationsAfter.every(registration => registration.guestType.id === '10000')).to.equal(true);
  });

  it('should be able to disable guest types using delete migration with PATCH', async () => {
    await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true, migrationStrategy: { op: 'useDefault', value: '10000' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: guestRegistrationsBefore } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const res = await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: false, migrationStrategy: { op: 'delete' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: guestRegistrationsAfter } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const sumOfGuestsBefore = guestRegistrationsBefore.reduce((sum, current) => sum + current.amount, 0);
    const sumOfGuestsAfter = guestRegistrationsAfter.reduce((sum, current) => sum + current.amount, 0);

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.current.guestTypes.enabled).to.equal(false);
    expectChakram(sumOfGuestsBefore > 0).to.equal(true);
    expectChakram(guestRegistrationsBefore.every(registration => registration.guestType.id === '10000')).to.equal(true);
    expectChakram(sumOfGuestsAfter === 0).to.equal(true);
    expectChakram(guestRegistrationsAfter.length === 0).to.equal(true);
  });

  it('should be able to disable guest types using nullify migration with PATCH', async () => {
    await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true, migrationStrategy: { op: 'useDefault', value: '10000' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: guestRegistrationsBefore } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const { body: extraRegistration } = await chakram.request('POST', '/guest-registrations', {
      'body': {
        'date': guestRegistrationsBefore[0].date,
        "guestTypeId": 10001,
        "amount": 1000
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const res = await chakram.request('PATCH', '/settings/10001', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: false, migrationStrategy: { op: 'nullify' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });


    const { body: guestRegistrationsAfter } = await chakram.request('GET', '/guest-registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomer2
      }
    });

    const sumOfGuestsBefore = guestRegistrationsBefore.reduce((sum, current) => sum + current.amount, 0) + extraRegistration.amount;
    const sumOfGuestsAfter = guestRegistrationsAfter.reduce((sum, current) => sum + current.amount, 0);

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.current.guestTypes.enabled).to.equal(false);
    expectChakram(sumOfGuestsBefore > 0).to.equal(true);
    expectChakram(sumOfGuestsBefore === sumOfGuestsAfter).to.equal(true);
    expectChakram(guestRegistrationsBefore.every(registration => !!registration.guestType)).to.equal(true);
    expectChakram(guestRegistrationsAfter.every(registration => !registration.guestType)).to.equal(true);
  });

  it('should be able to create a setting with enabled guest types with POST', async () => {
    await chakram.request('POST', '/guest-types', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        'name': 'first guest type here'
      }
    });

    const res = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          "guestTypes": {
            "enabled": true,
            "migrationStrategy": {
              "op": "delete"
            }
          }
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.guestTypes.enabled).to.equal(true);

  });

  it('should not be able to enable guest types when default guest type doesnt exist', async () => {
    const res = await chakram.request('PATCH', '/settings/10000', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true, migrationStrategy: { op: 'delete' } }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(500);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.errorCode).to.equal('E271');

  });

  it('should not be able to enable guest types without migration strategy', async () => {
    const res = await chakram.request('PATCH', '/settings/10000', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: true }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(500);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
  });

  it('should not be able to disable guest types without migration strategy', async () => {
    const res = await chakram.request('PATCH', '/settings/10000', {
      'body': [{
        'op': 'add',
        'path': '/current/guestTypes',
        'value': { enabled: false }
      }],
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(500);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
  });
});
