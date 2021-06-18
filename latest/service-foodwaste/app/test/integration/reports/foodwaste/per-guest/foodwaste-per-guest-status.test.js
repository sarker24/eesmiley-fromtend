const round = require('../../../../../src/util/math').round;
const sum = require('../../../../../src/util/array').sum;
const avg = require('../../../../../src/util/array').avg;
const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const testLongLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');
const adminToken = app.get('testLongLivedAdminAccessToken');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');

async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
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

describe('foodwaste-per-guest-status', () => {

  it('should return valid response with defaults', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-status', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.metrics.length).to.equal(1);
    expectChakram(res.body.extra.hasOwnProperty('target')).to.equal(true);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestStatusByAreas');
    expectChakram(res.body.series[0].series[0].id).to.equal('foodwastePerGuestStatusByArea');
    expectChakram(res.body.metrics[0].id).to.equal('foodwastePerGuestStatusPerformance');

    await validateResponse(findSchema, res);
  });

  it('should return valid response with 0 amounts when no registrations exist for multiple customers', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-status?from=2019-12-01&to=2019-12-31&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.metrics.length).to.equal(1);
    expectChakram(res.body.extra.hasOwnProperty('target')).to.equal(true);
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestStatusByAreas');
    expectChakram(res.body.series[0].series[0].id).to.equal('foodwastePerGuestStatusByArea');
    expectChakram(res.body.metrics[0].id).to.equal('foodwastePerGuestStatusPerformance');

    expectChakram(res.body.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, max: 0, min: 0 });
    res.body.series[0].series.forEach(series => {
      expectChakram(series.aggregates).to.deep.equal({ total: 0, avg: 0, max: 0, min: 0 });
      expectChakram(series.points.every(point => point.value === 0)).to.equal(true);
    });
  });

  it('should return data for single customer in default weight dimension & month period', async () => {

    const guests = [
      { date: '2019-12-12', amount: 10 },
      { date: '2019-12-20', amount: 10 },
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-12', amount: 30 },
      { date: '2020-02-02', amount: 30 } // discarded, no matching fw regs in the given period (month)
    ];

    const registrations = [
      { date: '2019-11-10', amount: 90000 }, // discarded, no matching guests in the given period (month)
      { date: '2019-12-10', amount: 2400 },
      { date: '2020-01-01', amount: 2500 },
      { date: '2020-01-10', amount: 300 }
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-status?from=2020-02-01&to=2020-02-28&period=month', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].series.length).to.equal(6);
    expectChakram(perGuest.series[0].series.every(s => s.points.length === 4)).to.equal(true);

    expectChakram(perGuest.series[0].aggregates.total).to.equal(round(sum([2800/55, 2400/20]), 2));
    expectChakram(perGuest.metrics[0].unit).to.equal('kg');
    expectChakram(perGuest.metrics[0].point).to.equal(85.45);
    expectChakram(perGuest.metrics[0].trend).to.equal(327.27);
    expectChakram(perGuest.extra.target).to.equal(20);
  });

  it('should return data for single customer in cost dimension', async () => {

    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-10', amount: 30 }
    ];

    const registrations = [
      { date: '2020-01-01', amount: 2500 },
      { date: '2020-01-10', amount: 300 }
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-status?dimension=cost&from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('DKK');
    expectChakram(perGuest.series[0].series.length).to.equal(6);
    expectChakram(perGuest.series[0].aggregates.total).to.equal(25.45);
    expectChakram(perGuest.metrics[0].unit).to.equal('DKK');
    expectChakram(perGuest.metrics[0].point).to.equal(25.45);
    expectChakram(perGuest.metrics[0].trend).to.equal(27.27);
    expectChakram(perGuest.extra.target).to.equal(20);
  });

  it('should return data for multiple customers in default weight dimension in descending order', async () => {

    // cu 1, cu 2 only ones with settings, but they share the same,
    // so to test out avg changes, changing fw target for cu 2
    await chakram.request('PATCH', '/settings/10001', {
      'headers': {
        'Authorization': 'Bearer ' + testLongLivedAccessTokenCustomerId2
      },
      'body': [
        { op: 'replace', path: '/current/expectedWeeklyWaste', value: { "0": 3200 } }
      ]
    });

    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-10', amount: 30 },
      { date: '2020-01-02', amount: 10, customerId: 2 },
      { date: '2020-01-12', amount: 10, customerId: 2 }

    ];

    const registrations = [
      { date: '2020-01-01', amount: 2500 },
      { date: '2020-01-10', amount: 300 },
      { date: '2020-01-02', amount: 2000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-12', amount: 100, customerId: 2, registrationPointId: 10044 }
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-status?accounts=1,2,3,4,5&from=2020-01-01&to=2020-01-31&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].series.length).to.equal(6);
    expectChakram(perGuest.series[0].aggregates.total).to.equal(65.33);
    expectChakram(perGuest.metrics[0].unit).to.equal('kg');
    expectChakram(perGuest.metrics[0].point).to.equal(65.33);
    expectChakram(perGuest.metrics[0].trend).to.equal(226.67);
    expectChakram(perGuest.extra.target).to.equal(20);
    perGuest.series[0].series.forEach((currentSeries, index, all) => {
      if(index >= all.length - 1) { return ; }
      const nextSeries = all[index + 1];
      expectChakram(currentSeries.aggregates.total >= nextSeries.aggregates.total).to.equal(true);
    });
  });

  it('should return data for multiple customers in cost dimension', async () => {

    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-10', amount: 30 },
      { date: '2020-01-02', amount: 10, customerId: 2 },
      { date: '2020-01-12', amount: 10, customerId: 2 }

    ];

    const registrations = [
      { date: '2020-01-01', amount: 2500 },
      { date: '2020-01-10', amount: 300 },
      { date: '2020-01-02', amount: 2000, customerId: 2, registrationPointId: 10044 },
      { date: '2020-01-12', amount: 100, customerId: 2, registrationPointId: 10044 }
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-status?accounts=1,2,3,4,5&dimension=cost&from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('DKK');
    expectChakram(perGuest.series[0].series.length).to.equal(6);
    expectChakram(perGuest.series[0].aggregates.total).to.equal(46.67);
    expectChakram(perGuest.metrics[0].unit).to.equal('DKK');
    expectChakram(perGuest.metrics[0].point).to.equal(46.67);
    expectChakram(perGuest.metrics[0].trend).to.equal(133.33);
    expectChakram(perGuest.extra.target).to.equal(20);
  });

  it('should return data for multiple customers in quarter period', async () => {

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

    await createGuestRegistrations(guests);
    await createRegistrations([...KitchenRegistrations, ...SecondKitchenRegistrations]);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-status?accounts=1,2&period=quarter&from=2020-01-01&to=2020-03-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedAreaAmounts = {
      Kitchen: {
        total: round(sum(KitchenRegistrations.map(r => r.amount)) / sum(guests.map(g => g.amount)), 2)
      },
      'Second Kitchen': {
        total: round(sum(SecondKitchenRegistrations.map(r => r.amount)) / sum(guests.map(g => g.amount)), 2)
      }
    };

    const expectedTotal = round(sum(Object.keys(expectedAreaAmounts).map(area => expectedAreaAmounts[area].total)), 2);

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].series.length).to.equal(6);
    expectChakram(perGuest.series[0].aggregates.total).to.equal(expectedTotal);
    perGuest.series[0].series.forEach(areaSeries => {
      const expected = expectedAreaAmounts[areaSeries.name];
      const expectedAmount = expected ? expected.total : 0;
      expectChakram(areaSeries.aggregates.total).to.equal(expectedAmount);
    });
    expectChakram(perGuest.metrics[0].unit).to.equal('kg');
    expectChakram(perGuest.metrics[0].point).to.equal(expectedTotal);
    expectChakram(perGuest.metrics[0].trend).to.equal(518);
    expectChakram(perGuest.extra.target).to.equal(20);
  });

});
