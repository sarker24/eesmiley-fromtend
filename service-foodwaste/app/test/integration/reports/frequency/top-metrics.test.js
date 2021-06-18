const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-metric-response');

// todo: export plain function instead of a hook
async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, customerId = 1, userId = 1, registrationPointId = 10070 } = dateAmount;
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
        'scale': true,
      }
    });
  }
}

describe('frequency-top-metrics', () => {

  it('should return valid response when no data', async () => {
    const res = await chakram.request('GET', '/reports/frequency-top-metrics', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.metrics[0].id).to.equal('frequencyAvgRegistrationDaysPerWeek');
    expectChakram(res.body.metrics[0].point).to.equal(0);
    expectChakram(res.body.metrics[0].trend).to.equal(0);
    expectChakram(res.body.metrics[1].id).to.equal('frequencyAvgRegistrationsPerDay');
    expectChakram(res.body.metrics[1].point).to.equal(0);
    expectChakram(res.body.metrics[1].trend).to.equal(0);
    await validateResponse(findSchema, res);
  });

  it('should return correct metrics in week period', async () => {
    const periodRegistrations = [
      {date: '2020-03-09', amount: 1000},
      {date: '2020-03-10', amount: 1000},
      {date: '2020-03-11', amount: 1000},
      {date: '2020-03-03', amount: 1000},
      {date: '2020-03-03', amount: 1000},
    ];

    await createRegistrations(periodRegistrations);

    const res = await chakram.request('GET', '/reports/frequency-top-metrics?period=week&from=2020-03-09&to=2020-03-15', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.metrics[0].id).to.equal('frequencyAvgRegistrationDaysPerWeek');
    expectChakram(res.body.metrics[0].point).to.equal(3);
    expectChakram(res.body.metrics[0].trend).to.equal(200);
    expectChakram(res.body.metrics[1].id).to.equal('frequencyAvgRegistrationsPerDay');
    expectChakram(res.body.metrics[1].point).to.equal(1);
    expectChakram(res.body.metrics[1].trend).to.equal(-50);
  });

  it('should return correct metrics in month period', async () => {
    const periodRegistrations = [
      {date: '2020-03-02', amount: 1000},
      {date: '2020-03-02', amount: 1000},
      {date: '2020-03-03', amount: 1000},
      {date: '2020-03-20', amount: 1000},
      {date: '2020-02-10', amount: 1000}
    ];

    await createRegistrations(periodRegistrations);

    const res = await chakram.request('GET', '/reports/frequency-top-metrics?period=month&from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.metrics[0].id).to.equal('frequencyAvgRegistrationDaysPerWeek');
    expectChakram(res.body.metrics[0].point).to.equal(1.5);
    expectChakram(res.body.metrics[0].trend).to.equal(50);
    expectChakram(res.body.metrics[1].id).to.equal('frequencyAvgRegistrationsPerDay');
    expectChakram(res.body.metrics[1].point).to.equal(1.33);
    expectChakram(res.body.metrics[1].trend).to.equal(33.33);
  });

});
