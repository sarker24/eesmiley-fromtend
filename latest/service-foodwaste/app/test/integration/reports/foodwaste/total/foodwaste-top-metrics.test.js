const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

const FOODWASTE_METRIC_IDS = require('../../../../../src/services/reports/foodwaste/top-metrics').FOODWASTE_METRIC_IDS['total'];
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-metric-response');

const EXPECTED_METRIC_IDS = Object.keys(FOODWASTE_METRIC_IDS).reduce((obj, key) => ({ ...obj, [FOODWASTE_METRIC_IDS[key]]: FOODWASTE_METRIC_IDS[key] }), {});

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

describe('foodwaste-total-top-metrics', () => {

  it('should return valid response with defaults', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.metrics.length).to.equal(4);
    expectChakram(res.body.metrics.every(metric => !!EXPECTED_METRIC_IDS[metric.id])).to.equal(true);

    await validateResponse(findSchema, res);
  });

  it('should return valid response with 0 amounts when no data exist for multiple customers', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?from=2000-01-01&to=2000-12-31&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.metrics.length).to.equal(4);
    expectChakram(res.body.metrics.every(metric => !!('foodwaste' + EXPECTED_METRIC_IDS[metric.id]) && metric.trend === 0 && metric.point === 0)).to.equal(true);
  });

  it('should return data with defaults when only one period in range has registrations', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 2147483000 },
      { date: '2019-12-15', amount: 2400000 },
      { date: '2020-10-10', amount: 2000 },
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 0,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 2149883000,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 2149883000,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 2149883000,
        trend: 0
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data for single customer when registration data for all metrics exist', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 1000 },
      { date: '2019-12-04', amount: 2000 },
      { date: '2020-01-15', amount: 1000 },
      { date: '2020-03-20', amount: 1500 },
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 3000,
        trend: -50
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 1000,
        trend: 50
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 1833.33,
        trend: -18.18
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });

  });

  it('should return data for multiple customers in default weight dimension', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 1000 },
      { date: '2019-12-11', amount: 1200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-15', amount: 900 },
      { date: '2020-02-10', amount: 2000 },
      { date: '2020-02-20', amount: 1000 },
      { date: '2020-02-02', amount: 3200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-03-12', amount: 1500, customerId: 2, registrationPointId: 10044 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?accounts=1,2,3,4,5&from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: -75.81
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 6200,
        trend: -75.81
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 900,
        trend: 66.67
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 2700,
        trend: -44.44
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data for multiple customers in cost dimension', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 1000 },
      { date: '2019-12-11', amount: 1200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-15', amount: 2000 },
      { date: '2020-02-10', amount: 2000 },
      { date: '2020-02-20', amount: 1000 },
      { date: '2020-02-02', amount: 3200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-03-12', amount: 1500 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?dimension=cost&accounts=1,2,3,4,5&from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 750,
        trend: -84.04
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 4700,
        trend: -84.04
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 750,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 2037.5,
        trend: -63.19
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('DKK');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data in custom period', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 1000 },
      { date: '2019-12-11', amount: 1200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-15', amount: 2000 },
      { date: '2020-02-10', amount: 2000 },
      { date: '2020-02-20', amount: 1000 },
      { date: '2020-02-02', amount: 3000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-02-01', amount: 200 },
      { date: '2020-02-24', amount: 1500 },
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?period=custom&accounts=1,2,3,4,5&from=2020-02-22&to=2020-02-26', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: 50
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 3000,
        trend: -50
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 200,
        trend: 650
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 1487.5,
        trend: 0.84
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data in week period', async () => {

    const registrations = [
      { date: '2019-12-01', amount: 1000 },
      { date: '2019-12-11', amount: 1200, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-15', amount: 2000 },
      { date: '2020-02-10', amount: 2000 },
      { date: '2020-02-20', amount: 1000 },
      { date: '2020-02-02', amount: 3000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-02-01', amount: 200 },
      { date: '2020-02-24', amount: 1500 },
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?period=week&accounts=1,2,3,4,5&from=2020-02-24&to=2020-03-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: 50
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 3200,
        trend: -53.13
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 1000,
        trend: 50
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 1700,
        trend: -11.76
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data in quarter period', async () => {

    const registrations = [
      { date: '2019-11-01', amount: 150 },
      { date: '2019-12-11', amount: 150, customerId: 2, registrationPointId: 10051 },
      { date: '2020-01-15', amount: 2000 },
      { date: '2020-02-10', amount: 2000 },
      { date: '2020-02-02', amount: 3000, customerId: 2, registrationPointId: 10051 },
      { date: '2020-02-01', amount: 200 },
      { date: '2020-04-14', amount: 1500 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?period=quarter&accounts=1,2,3,4,5&from=2020-04-01&to=2020-06-30', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: -79.17
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 7200,
        trend: -79.17
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 300,
        trend: 400
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 3000,
        trend: -50
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data in year period', async () => {

    const registrations = [
      { date: '2000-02-01', amount: 8000 },
      { date: '2000-12-01', amount: 1000 },
      { date: '2001-12-11', amount: 1200, customerId: 2, registrationPointId: 10044 },
      { date: '2001-01-15', amount: 2000 },
      { date: '2002-02-20', amount: 840 },
      { date: '2003-02-02', amount: 3000, customerId: 2, registrationPointId: 10044 },
      { date: '2003-02-01', amount: 200 },
      { date: '2004-02-01', amount: 1500 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-top-metrics?period=year&accounts=1,2,3,4,5&from=2004-01-01&to=2004-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwasteCurrentPeriod]: {
        point: 1500,
        trend: -53.13
      },
      [EXPECTED_METRIC_IDS.foodwasteWorstPeriod]: {
        point: 9000,
        trend: -83.33
      },
      [EXPECTED_METRIC_IDS.foodwasteBestPeriod]: {
        point: 840,
        trend: 78.57
      },
      [EXPECTED_METRIC_IDS.foodwasteAveragePeriod]: {
        point: 3548,
        trend: -57.72
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

});
