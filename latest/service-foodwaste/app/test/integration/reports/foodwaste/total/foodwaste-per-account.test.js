const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');

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

describe('foodwaste-total-per-account', () => {

  it('should return valid response with 0 amounts when no data exist for multiple customers', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-account?from=2019-01-01&to=2020-01-01&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(3);
    expectChakram(res.body.series[0].points[0].label).to.equal('Customer 1');
    expectChakram(res.body.series[0].points[1].label).to.equal('Customer 2');
    expectChakram(res.body.series[0].points[2].label).to.equal('Customer 5');
    expectChakram(res.body.series[0].points.every(point => point.value === 0)).to.equal(true);
    expectChakram(res.body.extra.target).to.equal(10457142.86);

    await validateResponse(findSchema, res);
  });

  it('should return valid response with correct amounts for multiple customers', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 2147483000 },
      { date: '2019-04-02', amount: 2147480000, customerId: 2, registrationPointId: 10044 },

    ]);
    const res = await chakram.request('GET', '/reports/foodwaste-per-account?from=2019-01-01&to=2020-01-01&accounts=1,2', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 1', value: 2147483000 },
      { label: 'Customer 2', value: 2147480000 },

    ]);
    expectChakram(res.body.extra.target).to.equal(10457142.86);
  });

  it('should return valid response with correct costs for multiple customers in descending order', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 9000 },
      { date: '2019-04-02', amount: 1000, customerId: 2, registrationPointId: 10044 },

    ]);
    const res = await chakram.request('GET', '/reports/foodwaste-per-account?dimension=cost&from=2019-01-01&to=2020-01-01&accounts=1,2&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 1', value: 4500 },
      { label: 'Customer 2', value: 1000 },

    ]);
    expectChakram(res.body.extra.target).to.equal(10457142.86);
  });

  it('should return valid response with correct costs for multiple customers in ascending order from custom period', async () => {

    await createRegistrations([
      { date: '2019-02-02', amount: 9000 },
      { date: '2019-04-02', amount: 1000, customerId: 2, registrationPointId: 10044 },

    ]);
    const res = await chakram.request('GET', '/reports/foodwaste-per-account?dimension=cost&from=2019-01-01&to=2019-05-18&accounts=1,2&order=asc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerAccount');
    expectChakram(res.body.series[0].points.length).to.equal(2);
    expectChakram(res.body.series[0].points).to.deep.equal([
      { label: 'Customer 2', value: 1000 },
      { label: 'Customer 1', value: 4500 },

    ]);
    expectChakram(res.body.extra.target).to.equal(3942857.14);
  });

});
