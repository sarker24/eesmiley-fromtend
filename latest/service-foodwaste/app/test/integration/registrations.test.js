const app = require('../../src/app').default;
const sinon = require('sinon');
const Queries = require('../../src/services/registrations/util/sql-queries');

const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');
const longLivedAdminAccessToken = app.get('testLongLivedAdminAccessToken');
const longLivedAccessTokenNoCustomer = app.get('testLongLivedAccessTokenNoCustomer');
const longLivedAccessTokenCustomerId11 = app.get('testLongLivedAccessTokenCustomerId11');

describe('registrations endpoint', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  afterEach(() => {
    sandbox.restore();
  });

  it('should get all registrations for current user', () => {
    return chakram.request('GET', '/registrations?startDate=2017-05-01&endDate=2017-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(6);
      res.body.forEach((registration) => {
        expectChakram(registration).to.have.property('registrationPoint');
        expectChakram(registration.registrationPoint).to.have.property('id');
        expectChakram(registration.registrationPoint).to.have.property('name');
      });
    });
  });

  it('should get registrations for multiple accounts if the account is registered to user via settings', () => {
    return chakram.request('GET', '/registrations?accounts=1,2&startDate=2017-05-01&endDate=2017-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      const customerIds = new Set();
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(12);
      res.body.forEach((registration) => {
        const customerId = parseInt(registration.customerId);
        customerIds.add(customerId);
        expectChakram(registration).to.have.property('registrationPoint');
        expectChakram(registration.registrationPoint).to.have.property('id');
        expectChakram(registration.registrationPoint).to.have.property('name');
      });

      expectChakram(customerIds.size).to.equal(2);
      expectChakram(customerIds.has(1)).to.equal(true);
      expectChakram(customerIds.has(2)).to.equal(true);
    });
  });

  it('should get all registrations with registration points for all customers when user is admin', function () {
    return chakram.request('GET', '/registrations?startDate=2017-05-01&endDate=2018-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAdminAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(45);
      expectChakram(res.body.every(registration => registration.hasOwnProperty('registrationPoint'))).to.equal(true);
    });
  });

  it('should get all registrations with registration points for selected accounts when user is admin', function () {
    return chakram.request('GET', '/registrations?accounts=1,2&startDate=2017-05-01&endDate=2017-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAdminAccessToken
      }
    }).then((res) => {
      const customerIds = new Set();
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(12);

      res.body.forEach((registration) => {
        const customerId = parseInt(registration.customerId);
        customerIds.add(customerId);
      });

      expectChakram(customerIds.size).to.equal(2);
      expectChakram(customerIds.has(1)).to.equal(true);
      expectChakram(customerIds.has(2)).to.equal(true);
      expectChakram(res.body.every(registration => registration.hasOwnProperty('registrationPoint'))).to.equal(true);

    });
  });

  it('should get all non-demo registrations without registration points when user is admin and given excludeTestAccounts flag', function () {
    return chakram.request('GET', '/registrations?excludeTestAccounts=true&startDate=2017-05-01&endDate=2017-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAdminAccessToken
      }
    }).then((res) => {
      const customerIds = new Set();
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(7);

      res.body.forEach((registration) => {
        const customerId = parseInt(registration.customerId);
        customerIds.add(customerId);
      });
      expectChakram(customerIds.size).to.equal(2);
      expectChakram(customerIds.has(2)).to.equal(true);
      expectChakram(res.body.every(registration => !registration.hasOwnProperty('registrationPoint'))).to.equal(true);

    });
  });

  it('should get all selected registrations without registration points when user is admin and given excludeTestAccounts flag', function () {
    return chakram.request('GET', '/registrations?accounts=2,4,5&excludeTestAccounts=true&startDate=2017-05-01&endDate=2018-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAdminAccessToken
      }
    }).then((res) => {
      const customerIds = new Set();
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(20);

      res.body.forEach((registration) => {
        const customerId = parseInt(registration.customerId);
        customerIds.add(customerId);
      });
      expectChakram(customerIds.size).to.equal(3);
      expectChakram(customerIds.has(2)).to.equal(true);
      expectChakram(customerIds.has(4)).to.equal(true);
      expectChakram(customerIds.has(5)).to.equal(true);
      expectChakram(res.body.every(registration => !registration.hasOwnProperty('registrationPoint'))).to.equal(true);

    });
  });

  it('should filter out fields if reportFormat parameter is present', function () {
    return chakram.request('GET', '/registrations?startDate=2017-05-01&endDate=2018-06-04&reportFormat=true', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAdminAccessToken
      }
    }).then((res) => {
      const expectedRegistrationAttributes = ['id', 'customerId', 'date', 'registrationPoint'];
      const expectedRegistrationPointAttributes = ['id', 'parentId', 'path', 'name', 'label'];
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.every(registration => {
        const exists = registration.hasOwnProperty('registrationPoint');
        const hasRegAttributes = Object.keys(registration).every(attribute => expectedRegistrationAttributes.includes(attribute));
        const hasRegPointAttributes = Object.keys(registration.registrationPoint).every(attribute => expectedRegistrationPointAttributes.includes(attribute));
        return exists && hasRegAttributes && hasRegPointAttributes;
      })).to.equal(true);
    });
  });

  it('should be able to create a registration', async () => {
    const res = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        'customerId': 1,
        'userId': 1,
        'date': '2017-06-07',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'unit': 'kg',
        'manual': true,
        'registrationPointId': 10001,
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res.body).to.have.property('registrationPoint');
    expectChakram(res.body.registrationPoint).to.have.property('name');
  });

  it('should not be able to create a registration with a customerId or userId different from the ones in the JWT', async () => {
    const userId = '1';
    const customerId = '1';

    const res = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        'customerId': 2838,
        'userId': 234213,
        'date': '2017-06-07',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'scale': true,
        'unit': 'kg',
        'manual': false,
        'registrationPointId': 10057
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
    expectChakram(res.body.hasOwnProperty('userId')).to.equal(true);
    expectChakram(res.body.hasOwnProperty('customerId')).to.equal(true);
    expectChakram(res.body.userId).to.equal(userId);
    expectChakram(res.body.customerId).to.equal(customerId);
  });

  it('should get all registrations if a JWT with customerID as integer is used', () => {
    return chakram.request('GET', '/registrations?startDate=2017-05-01&endDate=2017-06-04', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(6);
    });
  });

  it('should be able to create a registration if a JWT with customerID as integer is used', () => {
    return chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      },
      'body': {
        'date': '2017-06-07',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'unit': 'kg',
        'manual': true,
        'registrationPointId': 10057
      }
    }).then((res) => {
      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
    });
  });

  it('Should fail creating a registration if no customerId is provided in accessToken payload', () => {
    return chakram.request('POST', '/registrations', {
      'body': {
        'date': '2017-06-07',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'unit': 'kg',
        'manual': true,
        'registrationPointId': 10057
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNoCustomer
      }
    }).then((res) => {
      expectChakram(res).to.have.status(401);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.errorCode).to.equal('E029');
    });
  });

  it('should get all registrations including deleted', () => {
    return chakram.request('GET', '/registrations?customerId=11&startDate=2017-01-01&endDate=2017-12-31&includeSoftDeleted=true', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(9);
    });
  });

  it('should get all registrations without deleted', () => {
    return chakram.request('GET', '/registrations?customerId=11&startDate=2017-01-01&endDate=2017-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerId11
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(8);
    });
  });

  it('should associate a registration with multiple projects when creating a registration', async () => {
    /*
     * This test aims to check that when a registration is being created, it will match projects that:
     * have no areas or registrationPoints
     * OR
     * have no areas at all but have registrationPoint(s) that match the registrationPointId given from the registration
     * OR
     * have area(s) that match the areaId given from the registration but have no registrationPoints at all
     * OR
     * have both area(s) and registrationPoint(s) that match the IDs given from the registration
     */
    const res = await chakram.request('POST', '/registrations', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: {
        amount: 123000,
        unit: "kg",
        registrationPointId: 10057,
        date: "2018-08-30"
      }
    });

    expectChakram(res).to.have.status(201);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    /*
     * The registration should be associated to multiple projects. Namely, the ones with the IDs bellow.
     * Get them and check that their status has advanced, because of the new registration.
     * Note: registrations service creates fresh registration timestamp, which means
     * it might filter out projects that are listed here
     */
    const projects = await app.get('sequelize').models.project.findAll({
      where: { id: { $in: [10010, 10030, 10033, 10034] } },
      timestamps: false,
      raw: true
    });

    projects.forEach(project =>
      expectChakram(project.status).to.equal('RUNNING')
    );

    /*
     * Now we check that the associations between the projects and the registration have been created
     */
    const associations = await app.get('sequelize').models.project_registration.findAll({
      where: { registration_id: res.body.id }
    });

    associations.forEach(ass => { // hehehe
      expectChakram(ass.registration_id).equals(res.body.id); // the reg ID from the first run in this test
      expectChakram(['10010', '10030', '10033', '10034'].includes(ass.project_id)).to.equal(true);
    });
  });

  /*
   * ===================================================
   * Registrations Frequency
   * ===================================================
   */
  describe('registrations/frequency endpoint', () => {

    it('should get registrations frequency NOT on target with value < 150', async () => {
      const res = await chakram.request('GET', '/registrations/frequency?start=2018-06-11&end=2018-06-17&accounts=1,2,4,5', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.onTarget).to.equal(false);
      expectChakram(body.pointerLocation).to.equal(60);
      /*
       * accounts 4 and 5 don't have "expectedWeeklyWaste" set but in the frequency endpoint we only check for the
       * "registrationsFrequency" setting
       */
      expectChakram(body.accounts).to.deep.equal([
        {
          "accountId": "1",
          "frequency": 67,
          "name": "Customer 1",
          "onTarget": false,
          "trend": []
        },
        {
          "accountId": "4",
          "frequency": 40,
          "name": "Some company",
          "onTarget": false,
          "trend": [],
        },
        {
          "accountId": "5",
          "frequency": 150,
          "name": "Some other company",
          "onTarget": true,
          "trend": [],
        }
      ]);
      expectChakram(body.accountsWithoutSettings).to.deep.equal(['2']);
    });

    it('should get registrations frequency on target with value = 150', async () => {
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we match the
       * DOWs in which all customers made registrations to the account settings in which they have defined in which
       * DOWs they should register foodwaste
       */
      await Promise.all([
        sequelize.models.registration.build({
          'customerId': 1,
          'userId': 1,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': '2018-06-13'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1,
          'userId': 1,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': '2018-06-13'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 4,
          'userId': 4,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': '2018-06-13'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 4,
          'userId': 4,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': '2018-06-14'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 4,
          'userId': 4,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': '2018-06-15'
        }).save()
      ]);
      const res = await chakram.request('GET', '/registrations/frequency?start=2018-06-11&end=2018-06-17&accounts=1,2,4,5', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.onTarget).to.equal(true);
      expectChakram(body.pointerLocation).to.equal(150);
      /*
       * accounts 4 and 5 don't have "expectedWeeklyWaste" set but in the frequency endpoint we only check for the
       * "registrationsFrequency" setting
       */
      expectChakram(body.accounts).to.deep.equal([
        {
          "accountId": "1",
          "frequency": 150,
          "name": "Customer 1",
          "onTarget": true,
          "trend": []
        },
        {
          "accountId": "4",
          "frequency": 150,
          "name": "Some company",
          "onTarget": true,
          "trend": [],
        },
        {
          "accountId": "5",
          "frequency": 150,
          "name": "Some other company",
          "onTarget": true,
          "trend": [],
        }
      ]);
      expectChakram(body.accountsWithoutSettings).to.deep.equal(['2']);
    });

    it('should return an error when an error is thrown at getting the settings for the accounts', async () => {
      // FIXME: throws unhandled promise rejection warning: frequency hooks use  verify-user-allowed-to-query-accounts module
      // as before hook, which invokes hook.app.service('settings').find,
      // which in turn uses settings.findAll via feathers sequelize => Promise is never caught.
      // need for global promise error handler?
      // sandbox.stub(sequelize.models.settings, 'findAll').rejects({err: 'some err' });

      sandbox.stub(Queries, 'accountsSettings').throws({ err: 'some err' });

      const result = await chakram.request('GET', '/registrations/frequency?start=2018-06-11&end=2018-06-17&accounts=1,2,4,5', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      const body = result.body;

      expectChakram(result).to.have.status(500);
      expectChakram(result).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(body.name).to.equal('GeneralError');
      expectChakram(body.message).to.equal('Could not get the Settings for the given set of accounts');
      expectChakram(body.errorCode).to.equal('E188');
      expectChakram(body.data.accounts).to.deep.equal(['1', '2', '4', '5']);
      expectChakram(body).to.not.have.property('errors');
      expectChakram(body.data).to.not.have.property('errors');
    });

    it('should calculate regs frequency 150 "on-target" for an OPEN period when the account has regs for all days until now', async () => {
      const moment = require('moment').utc;
      /*
       * Since we test for an open period, we use today's date. For that purpose, we have to make the test dynamic, in
       * regards to dates.
       */
      const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const fourDaysAhead = moment().add(4, 'days').format('YYYY-MM-DD');
      /*
       * Then we set the regs. frequency settings for the account to all days of the week (just for this test)
       */
      await sequelize.query("UPDATE settings SET current = jsonb_set(current, '{registrationsFrequency}', :frequency, true)" +
        " WHERE customer_id=1", {
        replacements: { frequency: '{ "0": [1, 2, 3, 4, 5, 6, 0] }' },
        type: sequelize.QueryTypes.UPDATE
      });

      /*
       * Then we add some temporary registrations, that are not defined in the fixtures, so that we match the
       * DOWs in which the account has made registrations, but only for the days "until now"
       */
      await Promise.all([
        sequelize.models.registration.build({
          'customerId': 1,
          'userId': 1,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': twoDaysAgo
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1,
          'userId': 1,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': oneDayAgo
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1,
          'userId': 1,
          'amount': 123000,
          'registrationPointId': 10001,
          'date': today
        }).save()
      ]);
      /*
       * Make the actual request
       */
      const res = await chakram.request('GET', `/registrations/frequency?start=${twoDaysAgo}&end=${fourDaysAhead}`, {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.onTarget).to.equal(true);
      expectChakram(body.pointerLocation).to.equal(150);
      expectChakram(body.accounts).to.deep.equal([
        {
          "accountId": "1",
          "frequency": 150,
          "name": "Customer 1",
          "onTarget": true,
          "trend": []
        }
      ]);
      expectChakram(body.accountsWithoutSettings).to.equal(undefined);
    });

    it('Should return an error when querying for a non-subscribed account ID', async () => {
      const res = await chakram.request('GET', '/registrations/frequency/?start=2018-08-01&end=2018-08-30&accounts=6', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(403);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.errorCode).to.equal('E217');
    });

    it('should get registrations frequency with trend for past periods', async () => {
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we match the
       * DOWs in which all customers made registrations to the account settings in which they have defined in which
       * DOWs they should register foodwaste
       */
      await Promise.all([
        /*
         * original period: 2018-09-03 -> 2018-09-09  // Account 5 will miss 1 reg and Account 1 will have 1 extra, which should not be counted in
         */
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-03'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-08'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-09'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-08'
        }).save(),
        /*
         * period 1: 2018-08-27 -> 2018-09-02
         */
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-01'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-02'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-01'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-09-02'
        }).save(),
        /*
         * period 2: 2018-08-20 -> 2018-08-26   // Account 5 will miss 1 reg for that period/week
         */
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-25'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-26'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-25'
        }).save(),
        /*
         * period 3: 2018-08-13 -> 2018-08-19   // Account 1 will miss 1 reg for that period/week
         */
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-19'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-18'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 5, 'userId': 5, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-19'
        }).save(),
        /*
         * period 4: 2018-08-06 -> 2018-08-12   // Both accounts will have no regs for that period
         */
        /*
         * period 5: 2018-07-30 -> 2018-08-05   // Account 5 will have no regs for this period
         */
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-07-30'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-07-31'
        }).save(),
        sequelize.models.registration.build({
          'customerId': 1, 'userId': 1, 'amount': 123000, 'registrationPointId': 10001, 'date': '2018-08-04'
        }).save()
      ]);
      /*
       * Then we set the regs. frequency settings for account 1 to have some diversity
       */
      await sequelize.query("UPDATE settings SET current = jsonb_set(current, '{expectedFrequency}', :frequency, true)" +
        " WHERE customer_id=1", {
        replacements: { frequency: '[ { "from": "1970-01-01", "days": [1, 2] },{ "from": "2018-08-13", "days": [6, 0]} ]' },
        type: sequelize.QueryTypes.UPDATE
      });

      const res = await chakram.request('GET', '/registrations/frequency?start=2018-09-03&end=2018-09-09&accounts=1,5&period=week', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.deep.equal(
        {
          onTarget: false,
          pointerLocation: 75,
          accounts:
            [{
              accountId: '1',
              onTarget: true,
              frequency: 150,
              name: 'Customer 1',
              trend: [
                { onTarget: true, percentage: 150, periodLabel: '35' },
                { onTarget: true, percentage: 150, periodLabel: '34' },
                { onTarget: false, percentage: 50, periodLabel: '33' },
                { onTarget: false, percentage: 0, periodLabel: '32' },
                { onTarget: true, percentage: 150, periodLabel: '31' }
              ]
            },
              {
                accountId: '5',
                onTarget: false,
                frequency: 50,
                name: 'Some other company',
                trend: [
                  { onTarget: true, percentage: 150, periodLabel: '35' },
                  { onTarget: false, percentage: 50, periodLabel: '34' },
                  { onTarget: true, percentage: 150, periodLabel: '33' },
                  { onTarget: false, percentage: 0, periodLabel: '32' },
                  { onTarget: false, percentage: 0, periodLabel: '31' }
                ]
              }]
        });
      expectChakram(body.accountsWithoutSettings).to.equal(undefined);
    });

  });

  /*
   * ===================================================
   * Registrations Waste
   * ===================================================
   */
  describe('registrations/waste endpoint', () => {
    const sandbox = sinon.createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should build a waste report when hitting /registrations/waste (With 2 settings applying)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-07-01&end=2018-08-30&accounts=1,2,3', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(parseInt(body.actualCost)).to.equal(240000);
      expectChakram(parseInt(body.actualAmount)).to.equal(2400000);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(2628572);
      expectChakram(body.registrationPoints.length).to.equal(3);
      expectChakram(body.accounts.length).to.equal(2);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost)).to.equal(120000);
        expectChakram(parseInt(account.actualAmount)).to.equal(1200000);
        expectChakram(account.registrationPoints.length).to.equal(3);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
      });
    });

    it('Should build a waste report when hitting /registrations/waste(With 1 settings applying from the beginning)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-07-01&end=2018-07-30&accounts=1,2,3', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(parseInt(body.actualCost)).to.equal(120000);
      expectChakram(parseInt(body.actualAmount)).to.equal(1200000);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(857142);
      expectChakram(body.registrationPoints.length).to.equal(3);
      expectChakram(body.accounts.length).to.equal(2);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost)).to.equal(60000);
        expectChakram(parseInt(account.actualAmount)).to.equal(600000);
        expectChakram(account.registrationPoints.length).to.equal(3);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
      });
    });

    it('Should build a waste report when hitting /registrations/waste(With 1 settings applying from the beginning) ' +
      'with trend', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-07-01&end=2018-07-30&accounts=1,2,3&period=month', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;

      expectChakram(parseInt(body.actualCost)).to.equal(120000);
      expectChakram(parseInt(body.actualAmount)).to.equal(1200000);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(857142);
      expectChakram(body.registrationPoints.length).to.equal(3);
      expectChakram(body.accounts.length).to.equal(2);
      expectChakram(body.accounts[0].trend.length).to.equal(5);
      expectChakram(body.accounts[1].trend.length).to.equal(5);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost)).to.equal(60000);
        expectChakram(parseInt(account.actualAmount)).to.equal(600000);
        expectChakram(account.registrationPoints.length).to.equal(3);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
        account.trend.forEach((trendElement) => {
          expectChakram(['2018-06', '2018-05', '2018-04', '2018-03', '2018-02']
            .includes(trendElement.periodLabel)).to.equal(true);
          expectChakram(parseInt(trendElement.actualCost) >= 0).to.equal(true);
          expectChakram(parseInt(trendElement.actualAmount) >= 0).to.equal(true);
          expectChakram(parseInt(trendElement.expectedAmount) >= 0).to.equal(true);
        });
      });
    });

    it('Should build a waste report when hitting /registrations/waste(With 1 settings applying from the beginning) ' +
      'with trend in weeks', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-07-30&end=2018-08-05&accounts=1,2,3&period=week', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(parseInt(body.actualCost)).to.equal(60000);
      expectChakram(parseInt(body.actualAmount)).to.equal(600000);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(371428);
      expectChakram(body.registrationPoints.length).to.equal(3);
      expectChakram(body.accounts.length).to.equal(2);
      expectChakram(body.accounts[0].trend.length).to.equal(5);
      expectChakram(body.accounts[1].trend.length).to.equal(5);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost)).to.equal(30000);
        expectChakram(parseInt(account.actualAmount)).to.equal(300000);
        expectChakram(account.registrationPoints.length).to.equal(3);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
        account.trend.forEach((trendElement) => {
          expectChakram(['30', '29', '28', '27', '26']
            .includes(trendElement.periodLabel)).to.equal(true);
          expectChakram(parseInt(trendElement.actualCost) >= 0).to.equal(true);
          expectChakram(parseInt(trendElement.actualAmount) >= 0).to.equal(true);
          expectChakram(parseInt(trendElement.expectedAmount) >= 0).to.equal(true);
        });
      });
    });

    it('Should build a waste report when hitting /registrations/waste(With 1 settings applying from a random point)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-08-01&end=2018-08-30&accounts=1,2,3', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(parseInt(body.actualCost)).to.equal(120000);
      expectChakram(parseInt(body.actualAmount)).to.equal(1200000);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(1742858);
      expectChakram(body.registrationPoints.length).to.equal(3);
      expectChakram(body.accounts.length).to.equal(2);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost)).to.equal(60000);
        expectChakram(parseInt(account.actualAmount)).to.equal(600000);
        expectChakram(account.registrationPoints.length).to.equal(3);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
      });
    });

    it('Should build a waste report when hitting /registrations/waste(With no data)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-08-01&end=2018-08-30&accounts=3', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram((parseInt(body.actualCost))).to.equal(0);
      expectChakram((parseInt(body.actualAmount))).to.equal(0);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(0);
      expectChakram(body.registrationPoints.length).to.equal(0);
      expectChakram(body.accounts.length).to.equal(0);
    });

    it('Should NOT build a waste report when hitting /registrations/waste(With a not subscribed)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-08-01&end=2018-08-30&accounts=6', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(403);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.errorCode).to.equal('E217');
    });

    it('Should build a waste report with forecasted)', async () => {
      const res = await chakram.request('GET', '/registrations/waste/?start=2018-07-01&end=2038-10-31&accounts=1,2,3', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(parseInt(body.actualCost)).to.equal(251106);
      expectChakram(parseInt(body.actualAmount)).to.equal(2418900);
      expectChakram(body.accountsWithoutSettings[0]).to.equal('3');
      expectChakram(parseInt(body.expectedAmount)).to.equal(423600000);
      expectChakram(body.registrationPoints.length).to.equal(4);
      expectChakram(body.accounts.length).to.equal(2);
      expectChakram(parseInt(body.actualAmount) <= parseInt(body.forecastedAmount)).to.equal(true);
      body.accounts.forEach((account) => {
        expectChakram(parseInt(account.actualCost) === 120000 || parseInt(account.actualCost) === 131106).to.equal(true);
        expectChakram(parseInt(account.actualAmount) <= parseInt(account.forecastedAmount)).to.equal(true);
        expectChakram(parseInt(account.actualAmount) === 1200000 || parseInt(account.actualAmount) === 1218900).to.equal(true);
        expectChakram(account.accountId === '1' || account.accountId === '2').to.equal(true);
        expectChakram(account.name === 'eSmiley' || account.name === 'Fields').to.equal(true);
        if (account.accountId === '1') {
          expectChakram(account.registrationPoints.length).to.equal(4);
        } else {
          expectChakram(account.registrationPoints.length).to.equal(3);
        }
      });
    });
  });

  /*
   * ===================================================
   * Registrations Improvements
   * ===================================================
   */
  describe('registrations/improvements endpoint', () => {

    it('Should return an error when querying for a non-subscribed account ID', async () => {
      const res = await chakram.request('GET', '/registrations/improvements/?start=2018-08-01&end=2018-08-30&accounts=6', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(403);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body.errorCode).to.equal('E217');
    });

    it('should return an error when an error is thrown at getting the settings for the accounts', async () => {
      // see issue with models.settings.findAll above in frequency error test
      //sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.reject({ err: 'some err' }));
      sandbox.stub(Queries, 'accountsSettings').throws({ err: 'some err' });

      const result = await chakram.request('GET', '/registrations/improvements?start=2018-08-01&end=2018-08-30&accounts=1,2,4,5', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      const body = result.body;

      expectChakram(result).to.have.status(500);
      expectChakram(result).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(body.name).to.equal('GeneralError');
      expectChakram(body.message).to.equal('Could not get the Settings for the given set of accounts');
      expectChakram(body.errorCode).to.equal('E198');
      expectChakram(body.data.accounts).to.deep.equal(['1', '2', '4', '5']);
      expectChakram(body).to.not.have.property('errors');
      expectChakram(body.data).to.not.have.property('errors');
    })

    it('should get improvements for a CLOSED period, with trend for past periods', async () => {
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we have regs to
       * calculate improvement on
       */
      await sequelize.models.registration.bulkCreate([
        /*
         * original period: 2018-09-03 -> 2018-09-09
         * Account 5 will miss 2 reg days and Account 1 will have 1 extra reg for a day
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-03'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-04'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-05'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-06'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-07'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-09'
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-03'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-04'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-05'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-09'
        },
        /*
         * period 1: 2018-08-27 -> 2018-09-02
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-27'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-28'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-29'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-30'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-31'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 2300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-01'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-02'
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-27'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 1200, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-28'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-29'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 1300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-30'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-31'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-01'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-02'
        },
        /*
         * period 2: 2018-08-20 -> 2018-08-26
         * Account 1 will miss 2 reg days, which still makes > 70% for that period/week.
         *    It will also have too much waste cost, which renders its improvement to 0.
         * Account 2 will miss 1 reg day
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 52300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-20'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 1300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-21'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-22'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 212300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-25'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 2300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-26'
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-20'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 1300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-21'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 1230, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-22'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 22300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-23'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 1200, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-24'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-25'
        },
        /*
         * period 3: 2018-08-13 -> 2018-08-19
         * Account 1 will miss 3 reg days for that period/week, which is < 70%
         * Account 1 will miss 5 reg days for that period/week, which is < 70%
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-13'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-14'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-15'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-16'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-18'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-19'
        },
        /*
         * period 4: 2018-08-06 -> 2018-08-12   // Both accounts will have no regs for that period
         */

        /*
         * period 5: 2018-07-30 -> 2018-08-05
         * Both accounts will miss 2 reg days, but that is still > 70% reg days for the week
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-07-30'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-07-31'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-01'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-02'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-03'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-01'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-02'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-03'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-04'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-08-05'
        }
      ]);

      const res = await chakram.request('GET',
        '/registrations/improvements?start=2018-09-03&end=2018-09-09&accounts=1,2,5&period=week',
        {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.deep.equal(
        {
          maxCost: 400000,
          improvementCost: 180489,
          expectedCost: 400000,
          expectedWeight: 400000,
          actualCost: 219511,
          totalDays: 7,
          daysUntilNow: 7,
          accounts:
            [
              {
                accountId: '1',
                name: 'Customer 1',
                maxCost: 200000,
                improvementCost: 99132,
                averageCost: 1,
                expectedCost: 200000,
                expectedWeight: 200000,
                actualCost: 100868,
                trend: [
                  { maxCost: 200000, improvementCost: 123900, periodLabel: '35' },
                  { maxCost: 200000, improvementCost: 0, periodLabel: '34' },
                  { maxCost: -1, improvementCost: -1, periodLabel: '33' },
                  { maxCost: -1, improvementCost: -1, periodLabel: '32' },
                  { maxCost: 171429, improvementCost: 51358, periodLabel: '31' }
                ]
              },
              {
                accountId: '2',
                name: 'Fields',
                maxCost: 200000,
                improvementCost: 81357,
                averageCost: 1,
                expectedCost: 200000,
                expectedWeight: 200000,
                actualCost: 118643,
                trend: [
                  { maxCost: 200000, improvementCost: 136000, periodLabel: '35' },
                  { maxCost: 200000, improvementCost: 119370, periodLabel: '34' },
                  { maxCost: -1, improvementCost: -1, periodLabel: '33' },
                  { maxCost: -1, improvementCost: -1, periodLabel: '32' },
                  { maxCost: 171429, improvementCost: 51358, periodLabel: '31' }
                ]
              }
            ],
          accountsWithoutSettings: ['5']
        }
      );
    });

    it('should get improvements for an OPEN period, without trend for past periods', async () => {
      const moment = require('moment').utc;
      /*
       * Since we test for an open period, we use today's date. For that purpose, we have to make the test dynamic, in
       * regards to dates.
       */
      const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const fourDaysAhead = moment().add(4, 'days').format('YYYY-MM-DD');
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we have regs to
       * calculate improvement on
       */
      await sequelize.models.registration.bulkCreate([
        /*
         * period: <twoDaysAgo> --> <fourDaysAhead>
         * The accoutns only need regs for 3 out of 7 days, because we're on the 3rd day of the period (end is in the future)
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        }
      ]);

      const res = await chakram.request('GET',
        `/registrations/improvements?start=${twoDaysAgo}&end=${fourDaysAhead}&accounts=1,2,5`,
        {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.deep.equal(
        {
          maxCost: 400000,
          improvementCost: 97628,
          forecastedCost: 227798,
          expectedCost: 171428,
          expectedWeight: 400000,
          actualCost: 73800,
          totalDays: 7,
          daysUntilNow: 3,
          accounts:
            [
              {
                accountId: '1',
                name: 'Customer 1',
                maxCost: 200000,
                improvementCost: 48814,
                forecastedCost: 113899,
                averageCost: 1,
                expectedCost: 85714,
                expectedWeight: 200000,
                actualCost: 36900,
                trend: []
              },
              {
                accountId: '2',
                name: 'Fields',
                maxCost: 200000,
                improvementCost: 48814,
                forecastedCost: 113899,
                averageCost: 1,
                expectedCost: 85714,
                expectedWeight: 200000,
                actualCost: 36900,
                trend: []
              }
            ],
          accountsWithoutSettings: ['5']
        }
      );
    });

    it('should return -1 values for an OPEN period when < 70% of the requested accounts do not have enough reg days', async () => {
      /*
       * So, the thing is that 2/3 accounts have enough regs, but 2/3 is not 70% of the requested accounts.
       * Therefore the whole request is with -1 values
       */
      const moment = require('moment').utc;
      /*
       * Since we test for an open period, we use today's date. For that purpose, we have to make the test dynamic, in
       * regards to dates.
       */
      const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const fourDaysAhead = moment().add(4, 'days').format('YYYY-MM-DD');
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we have regs to
       * calculate improvement on
       */
      await sequelize.models.registration.bulkCreate([
        /*
         * period: <twoDaysAgo> --> <fourDaysAhead>
         * Account 10240 will not have at least 70% reg days even for the 3/7 days
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 10240, 'userId': 10240, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        // missing the <oneDayAgo> reg day
        {
          'customerId': 10240, 'userId': 10240, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        }
      ]);

      const res = await chakram.request('GET',
        `/registrations/improvements?start=${twoDaysAgo}&end=${fourDaysAhead}&accounts=1,2,10240`,
        {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = {
        ...res.body,
        accounts: res.body.accounts.sort((a, b) => parseInt(a.customerId) - parseInt(b.customerId))
      };

      expectChakram(body).to.deep.equal(
        {
          maxCost: -1,
          improvementCost: -1,
          accounts:
            [
              {
                accountId: '1',
                name: 'Customer 1',
                maxCost: -1,
                improvementCost: -1,
                averageCost: -1,
                expectedWeight: -1,
                actualCost: -1,
                trend: []
              },
              {
                accountId: '2',
                name: 'Fields',
                maxCost: -1,
                improvementCost: -1,
                averageCost: -1,
                expectedWeight: -1,
                actualCost: -1,
                trend: []
              },
              {
                accountId: '10240',
                name: '(1339) KLP Ørestad 5H ',
                maxCost: -1,
                improvementCost: -1,
                averageCost: -1,
                expectedWeight: -1,
                actualCost: -1,
                trend: []
              }
            ],
          accountsWithoutEnoughRegs: [{ id: '10240', name: '(1339) KLP Ørestad 5H ' }]
        }
      );
    });

    it('should get improvements for an OPEN period when 1 of 4 of the requested accounts do not have enough reg days', async () => {
      /*
       * So, the thing is that 3/4 accounts have enough regs, which is 75% of the accounts, so it's valid.
       */
      const moment = require('moment').utc;
      /*
       * Since we test for an open period, we use today's date. For that purpose, we have to make the test dynamic, in
       * regards to dates.
       */
      const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const fourDaysAhead = moment().add(4, 'days').format('YYYY-MM-DD');
      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we have regs to
       * calculate improvement on
       */
      await sequelize.models.registration.bulkCreate([
        /*
         * period: <twoDaysAgo> --> <fourDaysAhead>
         * Account 10240 will not have at least 70% reg days even for the 3/7 days
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 10240, 'userId': 10240, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        // missing the <oneDayAgo> reg day
        {
          'customerId': 10240, 'userId': 10240, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },

        {
          'customerId': 10479, 'userId': 10479, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': twoDaysAgo
        },
        {
          'customerId': 10479, 'userId': 10479, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': oneDayAgo
        },
        {
          'customerId': 10479, 'userId': 10479, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': today
        },
      ]);

      const res = await chakram.request('GET',
        `/registrations/improvements?start=${twoDaysAgo}&end=${fourDaysAhead}&accounts=1,2,10240,10479`,
        {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = res.body;
      expectChakram(body).to.deep.equal(
        {
          maxCost: 673060,
          improvementCost: 177754,
          forecastedCost: 414759,
          expectedCost: 288454,
          expectedWeight: 523000,
          actualCost: 110700,
          totalDays: 7,
          daysUntilNow: 3,
          accounts:
            [
              {
                accountId: '1',
                name: 'Customer 1',
                maxCost: 200000,
                improvementCost: 48814,
                forecastedCost: 113899,
                averageCost: 1,
                expectedCost: 85714,
                expectedWeight: 200000,
                actualCost: 36900,
                trend: []
              },
              {
                accountId: '2',
                name: 'Fields',
                maxCost: 200000,
                improvementCost: 48814,
                forecastedCost: 113899,
                averageCost: 1,
                expectedCost: 85714,
                expectedWeight: 200000,
                actualCost: 36900,
                trend: []
              },
              {
                accountId: '10479',
                name: '(1190) Novo Nordisk EG',
                maxCost: 273060,
                improvementCost: 80126,
                forecastedCost: 186961,
                averageCost: 2.22,
                expectedCost: 117026,
                expectedWeight: 123000,
                actualCost: 36900,
                trend: []
              }
            ],
          accountsWithoutEnoughRegs: [{ id: '10240', name: '(1339) KLP Ørestad 5H ' }]
        }
      );
    });

    it('should return -1 values when < 70% of the requested accounts only have registrationPoints', async () => {
      /*
       * So, the thing is that 2/3 accounts have registrationPoints, but 2/3 is not 70% of the requested accounts.
       * Therefore the whole request is with -1 values
       */

      /*
       * First we add some temporary registrations, that are not defined in the fixtures, so that we have regs to
       * calculate improvement on. This is needed so that we MAKE SURE the calculations are interrupted ONLY because
       * of lack of registrationPoints.
       */
      await sequelize.models.registration.bulkCreate([
        /*
         * original period: 2018-09-03 -> 2018-09-09
         */
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-03'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-04'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-05'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-06'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-07'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 1, 'userId': 1, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-09'
        },

        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-03'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-04'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-05'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-08'
        },
        {
          'customerId': 2, 'userId': 2, 'cost': 12300, 'amount': 12300, 'registrationPointId': 10001,
          'date': '2018-09-09'
        }
      ]);

      const res = await chakram.request('GET',
        '/registrations/improvements?start=2018-09-03&end=2018-09-09&accounts=1,2,10507',
        {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      const body = {
        ...res.body,
        accounts: res.body.accounts.sort((a, b) => parseInt(a.accountId) - parseInt(b.accountId))
      };
      expectChakram(body).to.deep.equal(
        {
          maxCost: -1,
          improvementCost: -1,
          accounts:
            [
              {
                accountId: '1',
                name: 'Customer 1',
                maxCost: -1,
                improvementCost: -1,
                averageCost: -1,
                expectedWeight: -1,
                actualCost: -1,
                trend: []
              },
              {
                accountId: '2',
                name: 'Fields',
                maxCost: -1,
                improvementCost: -1,
                averageCost: -1,
                expectedWeight: -1,
                actualCost: -1,
                trend: []
              }
            ],
          accountsWithoutRegistrationPoints: [{ id: '10507', name: '(1191) Novo Nordisk DF' }]
        }
      );
    });

  })
  ;


});

