const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');
const round = require('../../../../../src/util/math').round;
const sum = require('../../../../../src/util/array').sum;
const avg = require('../../../../../src/util/array').avg;
const FOODWASTE_METRIC_IDS = require('../../../../../src/services/reports/foodwaste/top-metrics').FOODWASTE_METRIC_IDS['perGuest'];
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-metric-response');

const EXPECTED_METRIC_IDS = Object.keys(FOODWASTE_METRIC_IDS).reduce((obj, key) => ({ ...obj, [FOODWASTE_METRIC_IDS[key]]: FOODWASTE_METRIC_IDS[key] }), {});


async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createGuestRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, userId = 1, customerId = 1 } = dateAmount;
    const res = await chakram.request('POST', '/guest-registrations', {
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

    if (![200, 201].includes(res.response.statusCode)) {
      console.error(res.body);
    }
  }
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

describe('foodwaste-per-guest-top-metrics', () => {

  it('should return valid response with 0 amounts when no data exist for multiple customers', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?from=2020-03-01&to=2020-03-31&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.metrics.length).to.equal(4);
    expectChakram(res.body.metrics.every(metric => !!EXPECTED_METRIC_IDS[metric.id] && metric.trend === 0 && metric.point === 0)).to.equal(true);

    await validateResponse(findSchema, res);
  });

  it('should return data in default weight dimension when only one period has registrations', async () => {

    const guestRegistrations = [
      { date: '2019-12-04', amount: 1000 }
    ];

    const registrations = [
      { date: '2019-12-04', amount: 1000 }
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 0,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 1,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 1,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 1,
        trend: 0
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    expectChakram(res.body.metrics.every(metric => !!EXPECTED_METRIC_IDS[metric.id] && metric.trend === expected[metric.id].trend && metric.point === expected[metric.id].point)).to.equal(true);
  });

  it('should return data in default weight dimension when some periods dont have guest registrations', async () => {

    const guestRegistrations = [
      { date: '2019-12-04', amount: 1000 }
    ];

    const registrations = [
      { date: '2019-12-04', amount: 1000 },
      { date: '2020-01-01', amount: 2000 }
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?period=month&from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 0,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 1,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 1,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 1,
        trend: 0
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });  });

  it('should return data for single customer when registration data for all metrics exist', async () => {

    const guestRegistrations = [
      { date: '2019-12-13', amount: 10 },
      { date: '2020-01-13', amount: 10 },
      { date: '2020-02-20', amount: 40, registrationPointId: 10000 },
      { date: '2020-02-25', amount: 60, registrationPointId: 10001 },
    ];

    const registrations = [
      { date: '2019-12-15', amount: 4200 },
      { date: '2020-01-13', amount: 100 },
      { date: '2020-02-20', amount: 200 },
      { date: '2020-02-20', amount: 200 },
      { date: '2020-02-21', amount: 800 },
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?period=month&dimension=weight&from=2020-02-01&to=2020-02-28', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 12,
        trend: 20
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 420,
        trend: -97.14
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 10,
        trend: 20
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 147.33,
        trend: -91.86
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('kg');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data for multiple customers in weight dimension', async () => {

    const guestRegistrations = [
      { date: '2019-12-11', amount: 40, customerId: 2 },
      { date: '2019-12-12', amount: 60 },
      { date: '2020-02-02', amount: 90, customerId: 2 },
      { date: '2020-03-21', amount: 300 },
      { date: '2020-03-12', amount: 20, customerId: 2 },

    ];

    const registrations = [
      { date: '2019-12-14', amount: 200, customerId: 2, registrationPointId: 10044 },
      { date: '2019-12-15', amount: 200 },
      { date: '2020-02-20', amount: 2000 },
      { date: '2020-02-02', amount: 95000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-03-20', amount: 1500 },
      { date: '2020-03-12', amount: 4000, customerId: 2, registrationPointId: 10044 },
    ];

    // 1500 + 4000  / 100 + 20
    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?dimension=weight&accounts=1,2&from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: round((1500 + 4000)/(300 + 20), 2),
        trend: -98.41
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: round((95000 + 2000) / 90, 2),
        trend: -98.41
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: round(((200 + 200) / (40 + 60) ), 2),
        trend: 329.69
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 366.32,
        trend: -95.31
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

    const guestRegistrations = [
      { date: '2019-12-11', amount: 10, customerId: 2 },
      { date: '2020-01-12', amount: 50 },
      { date: '2020-02-20', amount: 10 },
      { date: '2020-02-02', amount: 90, customerId: 2 },
      { date: '2020-03-20', amount: 10 },
    ];

    const registrations = [
      { date: '2019-12-11', amount: 200, customerId: 2, registrationPointId: 10044 },
      { date: '2019-01-12', amount: 200 },
      { date: '2020-02-20', amount: 2000 },
      { date: '2020-02-02', amount: 95000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-03-20', amount: 1500 }
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?dimension=cost&accounts=1,2,3,4,5&from=2020-03-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 75,
        trend: -92.19
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 960,
        trend: -92.19
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 20,
        trend: 275
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 351.67,
        trend: -78.67
      }
    };

    expectChakram(res.body.metrics.length).to.equal(4);
    res.body.metrics.forEach(metric => {
      expectChakram(metric.unit).to.equal('DKK');
      expectChakram(metric.point).to.equal(expected[metric.id].point);
      expectChakram(metric.trend).to.equal(expected[metric.id].trend);
    });
  });

  it('should return data in week period', async () => {

    const guestRegistrations = [
      { date: '1999-12-20', amount: 100 },
      { date: '2000-01-01', amount: 10 },
      { date: '2000-01-02', amount: 10 },
      { date: '2000-01-06', amount: 10 },
    ];

    const registrations = [
      { date: '1999-12-20', amount: 200 },
      { date: '2000-01-01', amount: 8000 },
      { date: '2000-01-02', amount: 4000 },
      { date: '2000-01-06', amount: 500 },

    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?period=week&from=2000-01-03&to=2000-01-09', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 50,
        trend: -91.67
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 600,
        trend: -91.67
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 2,
        trend: 2400
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 217.33,
        trend: -76.99
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

    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-10', amount: 30 },
      { date: '2020-01-02', amount: 10, customerId: 2 },
      { date: '2020-02-04', amount: 10, customerId: 2 }
    ];

    const KitchenRegistrations = [
      { date: '2020-01-01', amount: 2500, registrationPointId: 10001 }, // Kitchen area
      { date: '2020-01-01', amount: 2200, registrationPointId: 10083 }, // Kitchen area > Cake cat > salmon product
      { date: '2020-01-02', amount: 2000, customerId: 2, registrationPointId: 10044 }, // Kitchen area > salmon prod
      { date: '2020-02-01', amount: 400, customerId: 2, registrationPointId: 10044 } // Kitchen area > salmon prod
    ];

    const SecondKitchenRegistrations = [
      { date: '2020-01-24', amount: 400, registrationPointId: 10042 }, // second kitchen > pineapple prod
      { date: '2020-01-25', amount: 250, registrationPointId: 10076 }, // second kitchen > test cat > beef prod
      { date: '2020-02-15', amount: 500, registrationPointId: 10030 }, // second kitchen > test cat
      { date: '2020-02-20', amount: 600, registrationPointId: 10029 }, // second kitchen > fish cat
      { date: '2020-02-21', amount: 420, registrationPointId: 10004 }, // second kitchen
    ];

    const allRegistrations = [...KitchenRegistrations, ...SecondKitchenRegistrations];
    await createGuestRegistrations(guests);
    await createRegistrations(allRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?accounts=1,2&period=quarter&from=2020-01-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedTotalInCurrentPeriod = round(sum(allRegistrations.map(r => r.amount)) / sum(guests.map(g => g.amount)), 2);

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: expectedTotalInCurrentPeriod,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: expectedTotalInCurrentPeriod,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: expectedTotalInCurrentPeriod,
        trend: 0
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: expectedTotalInCurrentPeriod,
        trend: 0
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

    const guestRegistrations = [
      { date: '2000-01-01', amount: 100 },
      { date: '2001-04-01', amount: 10 },
      { date: '2001-11-01', amount: 10 },
      { date: '2002-10-01', amount: 100 },

    ];

    const registrations = [
      { date: '2000-01-01', amount: 1000 },
      { date: '2001-04-01', amount: 6000 },
      { date: '2001-11-01', amount: 5000 },
      { date: '2002-10-01', amount: 1200 },
    ];

    await createRegistrations(registrations);
    await createGuestRegistrations(guestRegistrations);

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-top-metrics?period=year&from=2002-01-01&to=2002-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expected = {
      [EXPECTED_METRIC_IDS.foodwastePerGuestCurrentPeriod]: {
        point: 12,
        trend: -97.82
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestWorstPeriod]: {
        point: 550,
        trend: -97.82
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestBestPeriod]: {
        point: 10,
        trend: 20
      },
      [EXPECTED_METRIC_IDS.foodwastePerGuestAveragePeriod]: {
        point: 190.67,
        trend: -93.71
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
