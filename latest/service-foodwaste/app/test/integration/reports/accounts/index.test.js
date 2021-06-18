const REPORT_IDS = require('../../../../src/services/reports/accounts/index').REPORT_IDS;
const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');
const sum = require('../../../../src/util/array').sum;
const round = require('../../../../src/util/math').round;

describe('accounts', () => {

  // for performance, better would be setup fixtures per test in this manner instead of calling api endpoints.
  // this way we can also decouple fixtures between tests (now changing the fixtures might break some tests) and sharing
  // makes it time consuming to figure out what points and registrations what customers have
  async function createRegistrationPoints(points) {
    const promises = points.map(point => {
      const { cost = 1000, name, label = 'product', image = null, active = true, customerId = 1, userId = 1 } = point;
      return chakram.request('POST', '/registration-points',
        {
          headers: {
            'Authorization': 'Bearer ' + adminToken
          },
          body: {
            customerId,
            userId,
            name,
            cost,
            active,
            image,
            label
          }
        });
    });

    const responses = await Promise.all(promises);
    return responses.map(response => response.body);
  }

  async function createGuestRegistrations(dateAmounts) {
    const promises = dateAmounts.map(dateAmount => {
      const { date, amount, customerId = 1, userId = 1 } = dateAmount;
      return chakram.request('POST', '/guest-registrations', {
        headers: {
          Authorization: 'Bearer ' + adminToken
        },
        body: {
          customerId,
          userId,
          date,
          amount
        }
      });
    });

    const responses = await Promise.all(promises);
    return responses.map(response => response.body);
  }

  async function createRegistrations(dateAmounts) {
    const promises = dateAmounts.map(dateAmount => {
      const { date, amount, userId = 1, customerId = 1, registrationPointId = 10070 } = dateAmount;
      return chakram.request('POST', '/registrations', {
        headers: {
          Authorization: 'Bearer ' + adminToken
        },
        body: {
          customerId,
          userId,
          date,
          amount,
          registrationPointId,
          'currency': 'DKK',
          'kgPerLiter': 150,
          'unit': 'kg',
          'manual': true,
        }
      });
    });

    const responses = await Promise.all(promises);
    return responses.map(response => response.body);  }

  describe('areas series', () => {
    it('should return valid total response for single account group', async () => {
      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[0].id).to.equal(REPORT_IDS.areasGroups);
      expectChakram(res.body.series[0].unit).to.equal('kg');
      expectChakram(res.body.series[0].series.length).to.equal(1);
      expectChakram(res.body.series[0].series[0].name).to.equal('optionalName');
      expectChakram(res.body.series[0].series[0].aggregates).to.deep.equal({ total: 1700600, avg: 340120, max: 601300, min: 9400 });
      expectChakram(res.body.series[0].series[0].series.length).to.equal(5);
    });

    it('should return valid total response for single account group when given customer doesnt have registration points', async () => {
      const accountsQuery = [
        { accounts: '5', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[0].id).to.equal(REPORT_IDS.areasGroups);
      expectChakram(res.body.series[0].unit).to.equal('kg');
      expectChakram(res.body.series[0].series.length).to.equal(1);
      expectChakram(res.body.series[0].series[0].name).to.equal('optionalName');
      expectChakram(res.body.series[0].series[0].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0 });
      expectChakram(res.body.series[0].series[0].series.length).to.equal(0);
    });

    it('should return valid per-guest response for single account group ', async () => {
      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      await createGuestRegistrations([{ date: '2010-01-01', amount: 1000 }]);
      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=perGuest`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[0].id).to.equal(REPORT_IDS.areasGroups);
      expectChakram(res.body.series[0].unit).to.equal('kg');
      expectChakram(res.body.series[0].series.length).to.equal(1);
      expectChakram(res.body.series[0].series[0].name).to.equal('optionalName');
      expectChakram(res.body.series[0].series[0].aggregates).to.deep.equal({
        max: 601.3,
        min: 9.4,
        total: 1700.6,
        avg: 340.12
      });
      expectChakram(res.body.series[0].series[0].series.length).to.equal(5);
    });

    it('should return valid response for multiple account groups', async () => {

      const accountsQuery = [
        { accounts: '1,2', name: '1,2' },
        { accounts: '1', name: '1', category: '10008' }, // belongs to area Test
        { accounts: '3', name: '3'}
      ];

      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const registrationPointsData = [
        { name: 'Customer 1 Area 1', label: 'area'},
        { name: 'Customer 1 Area 2', label: 'area'},
        { name: 'Customer 2 Area 1', label: 'area', userId: 2, customerId: 2 },
        { name: 'Customer 3 Area 1', label: 'area', userId: 3, customerId: 3 },
      ];

      const registrationPoints = await createRegistrationPoints(registrationPointsData);

      const registrations = [
        { date: '2019-05-01', amount: 500, registrationPointId: 10001 }, // Kitchen
        { date: '2019-05-01', amount: 500, registrationPointId: 10002 }, // Office
        { date: '2019-04-01', amount: 1000, registrationPointId: 10004 }, // Second Kitchen
        { date: '2019-01-01', amount: 2000, registrationPointId: 10008 }, // Test - Cake
        { date: '2019-02-01', amount: 120000, customerId: 2, registrationPointId: 10044 }, // Kitchen - Salmon
        ...registrationPoints.map(point => ({
          date: '2019-04-01', amount: parseInt(point.customerId) === 3 ? 250 : 9000, registrationPointId: parseInt(point.id), customerId: parseInt(point.customerId), userId: parseInt(point.userId)
        })),
      ];

      await createRegistrations(registrations);

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      const expectedNamesAndTotalsPerGroup = [{
        Kitchen: 120500,
        Test: 2000,
        Other: 1500,
        "Customer 1 Area 1": 9000,
        "Customer 1 Area 2": 9000,
        "Customer 2 Area 1": 9000,
      }, {
        Test: 2000
      }, {
        Other: 250
      }];

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

      res.body.series[0].series.forEach((groupSeries, index) => {
        groupSeries.series.forEach(areaSeries => {
          expectChakram(expectedNamesAndTotalsPerGroup[index]).to.have.property(areaSeries.name);
          expectChakram(areaSeries.aggregates.total).to.equal(expectedNamesAndTotalsPerGroup[index][areaSeries.name]);
        });
      });
    });
  });

  describe('account totals series', () => {
    it('should return valid total response for single account group', async () => {
      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[1].id).to.equal(REPORT_IDS.accountsGroups);
      expectChakram(res.body.series[1].series.length).to.equal(1);
      expectChakram(res.body.series[1].aggregates).to.deep.equal({ avg: 1700600 });
      expectChakram(res.body.series[1].series[0].id).to.equal('foodwastePerAccount');
      expectChakram(res.body.series[1].series[0].name).to.equal('optionalName');
      expectChakram(res.body.series[1].series[0].points.length).to.equal(1);
    });

    it('should return valid per-guest response for single account group', async () => {
      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      await createGuestRegistrations([{ date: '2010-01-01', amount: 1000 }]);
      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=perGuest`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[1].id).to.equal(REPORT_IDS.accountsGroups);
      expectChakram(res.body.series[1].series.length).to.equal(1);
      expectChakram(res.body.series[1].aggregates).to.deep.equal({ avg: 1700.6 });

      expectChakram(res.body.series[1].series[0].id).to.equal('foodwastePerGuestPerAccount');
      expectChakram(res.body.series[1].series[0].name).to.equal('optionalName');
      expectChakram(res.body.series[1].series[0].points.length).to.equal(1);
    });

    it('should return valid response for multiple accounts', async () => {

      const accountsQuery = [
        { accounts: '1,2', name: '1,2' },
        { accounts: 'top2', name: 'top2' }, // top 2 accounts = 1,2
        { accounts: 'bottom2', name: 'bottom2' }, // bottom 2 accounts have no registrations
        { accounts: '*', name: 'all' } // only accounts 1,2 have registrations
      ];

      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2001-01-01&to=2019-01-01&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });


      expectChakram(res).to.have.status(200);
      expectChakram(res.body.series[1].series.length).to.equal(4);
      expectChakram(res.body.series[1].aggregates).to.deep.equal({ avg: 1250300 });
      expectChakram(res.body.series[1].series[0].name).to.equal('1,2');
      expectChakram(res.body.series[1].series[0].aggregates).to.deep.equal({
        avg: 1250300,
        max: 1700600,
        min: 800000,
        total: 2500600
      });
      expectChakram(res.body.series[1].series[1].name).to.equal('top2');
      expectChakram(res.body.series[1].series[1].aggregates).to.deep.equal({
        avg: 1250300,
        max: 1700600,
        min: 800000,
        total: 2500600
      });
      expectChakram(res.body.series[1].series[2].name).to.equal('bottom2');
      expectChakram(res.body.series[1].series[2].aggregates).to.deep.equal({
        avg: 0,
        max: 0,
        min: 0,
        total: 0
      });
      expectChakram(res.body.series[1].series[3].name).to.equal('all');
      expectChakram(res.body.series[1].series[3].aggregates).to.deep.equal({
        avg: 1250300,
        max: 1700600,
        min: 800000,
        total: 2500600
      });
    });
  });

  describe('group totals series', () => {
    it('should return valid total response for single account group', async () => {
      const registrations = [
        { date: '2019-01-01', amount: 2000 },
        { date: '2019-02-01', amount: 1000, customerId: 2, registrationPointId: 10044 },
        { date: '2019-04-01', amount: 2000, customerId: 10479, registrationPointId: 10087 },
      ];

      await createRegistrations(registrations);

      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
      expectChakram(res.body.series[2].series.length).to.equal(2);
      expectChakram(res.body.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
      expectChakram(res.body.series[2].series[0].aggregates).to.deep.equal({ total: 5000 });
      expectChakram(res.body.series[2].series[0].points.length).to.equal(2);
      expectChakram(res.body.series[2].series[0].points).to.deep.equal([
        { label: 'optionalName', value: 2000 },
        { label: 'Other', value: 3000 }
      ]);
      expectChakram(res.body.series[2].series[1].id).to.equal(REPORT_IDS.totalRatiosSeries);
      expectChakram(res.body.series[2].series[1].aggregates).to.deep.equal({ total: 100 });
      expectChakram(res.body.series[2].series[1].points.length).to.equal(2);
      expectChakram(res.body.series[2].series[1].points).to.deep.equal([
        { label: 'optionalName', value: 40 },
        { label: 'Other', value: 60 }
      ]);
    });

    it('should return valid total response for single account group in cost dimension', async () => {
      const registrations = [
        { date: '2019-01-01', amount: 2000 }, // cost 1000
        { date: '2019-02-01', amount: 1000, customerId: 2, registrationPointId: 10044 }, // cost 1000
        { date: '2019-04-01', amount: 2000, customerId: 10479, registrationPointId: 10087 }, // cost 2460
      ];
      await createRegistrations(registrations);

      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&dimension=cost&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
      expectChakram(res.body.series[2].series.length).to.equal(2);
      expectChakram(res.body.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
      expectChakram(res.body.series[2].series[0].aggregates).to.deep.equal({ total: 4460 });
      expectChakram(res.body.series[2].series[0].points.length).to.equal(2);
      expectChakram(res.body.series[2].series[0].points).to.deep.equal([
        { label: 'optionalName', value: 1000 },
        { label: 'Other', value: 3460 }
      ]);
      expectChakram(res.body.series[2].series[1].id).to.equal(REPORT_IDS.totalRatiosSeries);
      expectChakram(res.body.series[2].series[1].aggregates).to.deep.equal({ total: 100 });
      expectChakram(res.body.series[2].series[1].points.length).to.equal(2);
      expectChakram(res.body.series[2].series[1].points).to.deep.equal([
        { label: 'optionalName', value: 22.42 },
        { label: 'Other', value: 77.58 }
      ]);
    });

    it('should return valid per-guest response for single account group', async () => {
      const registrations = [
        { date: '2019-01-01', amount: 2000 },
        { date: '2019-02-01', amount: 1000, customerId: 2, registrationPointId: 10044 },
        { date: '2019-04-01', amount: 2000, customerId: 10479, registrationPointId: 10087 },
      ];
      await createRegistrations(registrations);
      await createGuestRegistrations([
        { date: '2019-01-01', amount: 100 },
        { date: '2019-04-01', amount: 100, customerId: 2 }
      ]);

      const accountsQuery = [
        { accounts: '1', name: 'optionalName' }
      ];
      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');
      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=perGuest`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
      expectChakram(res.body.series[2].series.length).to.equal(1);
      expectChakram(res.body.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
      expectChakram(res.body.series[2].series[0].points.length).to.equal(1);
      expectChakram(res.body.series[2].series[0].points).to.deep.equal([
        { label: 'optionalName', value: 20 }
      ]);
    });

    it('should return valid response for multiple accounts', async () => {

      const accountsQuery = [
        { accounts: '1,2', name: '1,2' },
        { accounts: 'top2', name: 'top2' },
        { accounts: 'bottom2', name: 'bottom2' },
        { accounts: '*', name: 'all' }
      ];

      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');
      const registrations = [
        { date: '2019-01-01', amount: 2000 },
        { date: '2019-02-01', amount: 10000, customerId: 2, registrationPointId: 10044 },
        { date: '2019-03-01', amount: 500, customerId: 10240, registrationPointId: 10085 },
        { date: '2019-04-01', amount: 500, customerId: 10479, registrationPointId: 10087 },
      ];

      await createRegistrations(registrations);

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
      expectChakram(res.body.series[2].series.length).to.equal(2);
      expectChakram(res.body.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
      expectChakram(res.body.series[2].series[0].aggregates).to.deep.equal({ total: 38000 });
      expectChakram(res.body.series[2].series[0].points.length).to.equal(5);
      expectChakram(res.body.series[2].series[0].points).to.deep.equal([
        {
          label: '1,2',
          value: 12000
        },
        {
          label: 'top2',
          value: 12000
        },
        {
          label: 'bottom2',
          value: 1000
        },
        {
          label: 'all',
          value: 13000
        },
        {
          label: 'Other',
          value: 0 // * selector without registration point selectors includes all registrations
        }
      ]);
      expectChakram(res.body.series[2].series[1].id).to.equal(REPORT_IDS.totalRatiosSeries);
      expectChakram(res.body.series[2].series[1].aggregates).to.deep.equal({ total: 100 });
      expectChakram(res.body.series[2].series[1].points.length).to.equal(5);
      expectChakram(res.body.series[2].series[1].points).to.deep.equal([
        {
          label: '1,2',
          value: 31.58
        },
        {
          label: 'top2',
          value: 31.58
        },
        {
          label: 'bottom2',
          value: 2.63
        },
        {
          label: 'all',
          value: 34.21
        },
        {
          label: 'Other',
          value: 0
        }
      ]);
    });

    it('should return valid other points when groups have selected disjoint points', async () => {

      const accountsQuery = [
        { accounts: '1', name: '1', product: '10004'  },
        { accounts: '1', name: '1', category: '10008' },
      ];

      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');
      const registrations = [
        { date: '2019-05-01', amount: 750, registrationPointId: 10000 },
        { date: '2019-04-01', amount: 500, registrationPointId: 10004 },
        { date: '2019-01-01', amount: 2000, registrationPointId: 10008 },
        { date: '2019-02-01', amount: 10000, customerId: 2, registrationPointId: 10044 },
      ];

      await createRegistrations(registrations);

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].series[0].points.find(point => point.label === 'Other')).to.deep.equal(
        { label: 'Other', value: 10750 }
      );

      expectChakram(res.body.series[2].series[1].points.find(point => point.label === 'Other')).to.deep.equal(
        { label: 'Other', value: round(100 * (10750 / sum(registrations.map(r => r.amount))), 2) }
      );
    });

    it('should return valid other points when some group has all points but some has selected points', async () => {

      const accountsQuery = [
        { accounts: '1,2', name: '1,2' },
        { accounts: '1', name: '1', category: '10008' },
      ];

      const encoded = Buffer.from(JSON.stringify(accountsQuery)).toString('base64');
      const registrations = [
        { date: '2019-05-01', amount: 750, registrationPointId: 10000 },
        { date: '2019-04-01', amount: 500, registrationPointId: 10004 },
        { date: '2019-01-01', amount: 2000, registrationPointId: 10008 },
        { date: '2019-02-01', amount: 10000, customerId: 2, registrationPointId: 10044 },
      ];

      await createRegistrations(registrations);

      const res = await chakram.request('GET',
        `/reports/accounts?accountsQuery=${encoded}&from=2019-01-01&to=2019-12-31&resource=total`, {
          'headers': {
            'Authorization': 'Bearer ' + longLiveAccessToken
          }
        });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.series[2].series[0].points.find(point => point.label === 'Other')).to.deep.equal(
        { label: 'Other', value: 0 }
      );

      expectChakram(res.body.series[2].series[1].points.find(point => point.label === 'Other')).to.deep.equal(
        { label: 'Other', value: 0 }
      );
    });
  });
});
