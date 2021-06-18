const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const sinon = require('sinon');
const moment = require('moment');

// todo: export plain function instead of a hook
async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

describe('frequency-average-per-day', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  it('should return valid response', async () => {

    const res = await chakram.request('GET', '/reports/frequency-average-per-day', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].id).to.equal('frequencyAveragePerDay');
    expectChakram(res.body.series[0].unit).to.equal('scalar');

    await validateResponse(findSchema, res);

  });

  it('should get frequency averages for customer with default one year range', async () => {
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    await chakram.request('POST', '/registrations', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: {
        'customerId': 1,
        'userId': 1,
        'date': '2020-01-01',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'scale': true,
        'unit': 'kg',
        'manual': true,
        'registrationPointId': 10070
      }
    });

    await chakram.request('POST', '/registrations', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: {
        'customerId': 1,
        'userId': 1,
        'date': '2020-02-01',
        'currency': 'DKK',
        'kgPerLiter': 150,
        'amount': 3500,
        'scale': true,
        'unit': 'kg',
        'manual': true,
        'registrationPointId': 10070
      }
    });

    const res = await chakram.request('GET', '/reports/frequency-average-per-day', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].points.length).to.equal(367);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({ min: 1, max: 1, avg: 1, total: 2 });
  });

  it('should get frequency averages for customer with given time range', async () => {

    const res = await chakram.request('GET', '/reports/frequency-average-per-day?from=2018-01-01&to=2018-06-30', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].points.length).to.equal(181);
    expectChakram(res.body.series[0].points[0].label).to.equal('2018-01-01');
    expectChakram(res.body.series[0].points[180].label).to.equal('2018-06-30');

    expectChakram(res.body.series[0].aggregates).to.deep.equal({ min: 1, max: 2, avg: 1.5, total: 3 });
  });

  it('should get frequency averages for given accounts and time range', async () => {

    const res = await chakram.request('GET', '/reports/frequency-average-per-day?accounts=1,2,3,4,5&from=2018-01-01&to=2018-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].points.length).to.equal(365);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({ min: 1, max: 11, avg: 3.71, total: 52 });
  });
});
