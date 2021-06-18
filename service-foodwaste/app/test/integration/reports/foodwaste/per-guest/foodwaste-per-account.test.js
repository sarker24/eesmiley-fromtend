const { avg } = require("../../../../../src/util/array");
const { round } = require("../../../../../src/util/math");

const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const fixture = require('../../../../fixtures/models');
const testLongLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');

const { expectedFoodwastePerGuest: [defaultExpectedFoodwastePerGuest] } = fixture.createDefaultPerGuestTargets();

async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createRegistrations(dateAmounts) {

  for (const dateAmount of dateAmounts) {
    const { date, amount, userId = 1, customerId = 1, registrationPointId = 10070 } = dateAmount;
    await chakram.request('POST', '/registrations', {
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
        'scale': true
      }
    });
  }
}

async function createGuestRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, customerId = 1, userId = 1 } = dateAmount;
    await chakram.request('POST', '/guest-registrations', {
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
  }
}

describe('foodwaste-per-guest-per-account', () => {

  it('should return valid response with 0 amounts when no registrations exist for multiple customers', async () => {

    const cu2PerGuestWeeklyAmount = 3000;
    const cu2AmountNormalized = cu2PerGuestWeeklyAmount / 7;

    // change cu2 per guest target
    await chakram.request('PATCH', '/settings/10001', {
      'headers': {
        'Authorization': 'Bearer ' + testLongLivedAccessTokenCustomerId2
      },
      'body': [
        {
          op: 'replace',
          path: '/current/expectedFoodwastePerGuest',
          value: [{ from: '1970-01-01', amount: cu2PerGuestWeeklyAmount, unit: 'g', period: 'week' }]
        }
      ]
    });

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-per-account?from=2019-01-01&to=2020-01-01&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });


    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestPerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(3);
    expectChakram(res.body.series[0].points[0].label).to.equal('Customer 1');
    expectChakram(res.body.series[0].points[1].label).to.equal('Customer 2');
    expectChakram(res.body.series[0].points[2].label).to.equal('Customer 5');
    expectChakram(res.body.series[0].points.every(point => point.value === 0)).to.equal(true);
    expectChakram(res.body.extra.target).to.equal(round(avg([defaultExpectedFoodwastePerGuest.amountNormalized, cu2AmountNormalized * 366]), 2));

    await validateResponse(findSchema, res);
  });

  it('should return valid response with correct amounts for multiple customers in descending order', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 9000 },
      { date: '2019-04-02', amount: 1000, customerId: 2, registrationPointId: 10044 },
    ]);

    await createGuestRegistrations([
      { date: '2019-02-02', amount: 10 },
      { date: '2019-04-02', amount: 10, customerId: 2 },
    ]);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-per-account?from=2019-01-01&to=2020-01-01&accounts=1,2&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestPerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 1', value: 900 },
      { label: 'Customer 2', value: 100 },
    ]);
    expectChakram(res.body.extra.target).to.equal(defaultExpectedFoodwastePerGuest.amountNormalized);

  });

  it('should return valid response with correct amounts for multiple customers in ascending order', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 9000 },
      { date: '2019-04-02', amount: 1000, customerId: 2, registrationPointId: 10044 },
    ]);

    await createGuestRegistrations([
      { date: '2019-02-02', amount: 10 },
      { date: '2019-04-02', amount: 10, customerId: 2 },
    ]);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-per-account?from=2019-01-01&to=2020-01-01&accounts=1,2&order=asc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestPerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 2', value: 100 },
      { label: 'Customer 1', value: 900 },
    ]);
    expectChakram(res.body.extra.target).to.equal(defaultExpectedFoodwastePerGuest.amountNormalized);

  });

  it('should return valid response with correct costs for multiple customers', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 9000 },
      { date: '2019-04-02', amount: 1000, customerId: 2, registrationPointId: 10044 },

    ]);

    await createGuestRegistrations([
      { date: '2019-02-02', amount: 10 },
      { date: '2019-04-02', amount: 10, customerId: 2 },
    ]);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-per-account?dimension=cost&from=2019-01-01&to=2020-01-01&accounts=1,2', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestPerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 1', value: 450 },
      { label: 'Customer 2', value: 100 },

    ]);
    expectChakram(res.body.extra.target).to.equal(defaultExpectedFoodwastePerGuest.amountNormalized);
  });

});
