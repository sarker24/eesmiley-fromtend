const round = require('../../../../../src/util/math').round;
const sum = require('../../../../../src/util/array').sum;
const avg = require('../../../../../src/util/array').avg;
const max = require('../../../../../src/util/array').max;
const min = require('../../../../../src/util/array').min;

const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const adminToken = app.get('testLongLivedAdminAccessToken');

async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createGuestRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount } = dateAmount;
    await chakram.request('POST', '/guest-registrations', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: {
        customerId: 1,
        userId: 1,
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

async function createRegistrationPoints(points) {
  const promises = points.map(point => {
    const { cost = 1000, name, label = 'product', path = null, parentId = null, image = null, active = true, customerId = 1, userId = 1 } = point;
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
          label,
          path,
          parentId
        }
      });
  });

  const responses = await Promise.all(promises);
  return responses.map(response => response.body);
}

describe('foodwaste-per-guest-overview', () => {

  it('should return valid response with 0 amounts when no data exist', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?accounts=5&from=2019-12-01&to=2019-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].id).to.equal('foodwastePerGuestOverviewByAreas');
    expectChakram(res.body.series[0].series.length).to.equal(0);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0});

    expectChakram(res.body.series[1].id).to.equal('foodwastePerGuestOverviewAreaAverages');
    expectChakram(res.body.series[1].points.length).to.equal(0);
    expectChakram(res.body.series[1].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0});
    await validateResponse(findSchema, res);
  });

  it('should get overview areas and averages for customer with default dimension weight in descending order', async () => {

    const pointData = [
      { name: 'area1', label: 'area' },
      { name: 'area2', label: 'area' },
      { name: 'area3', label: 'area' },
      { name: 'area4', label: 'area' },
    ];

    const points = await createRegistrationPoints(pointData);
    const catPoint = await createRegistrationPoints([{ name: 'cat1', label: 'category', parentId: points[0].id }]);
    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-02-01', amount: 30 }
    ];

    const areaRegistrations = points.map((point, index) => ({
      date : '2020-02-20', amount: 400 * (index + 1), registrationPointId: index === 0 ? catPoint[0].id : point.id
    }));

    const registrations = [
      // area > category > product registration
      { date: '2020-01-01', amount: 4000, registrationPointId: 10070 },
      // area > category & area > category > product registrations in same tree
      { date: '2020-02-01', amount: 2000, registrationPointId: 10012 },
      { date: '2020-02-03', amount: 6000, registrationPointId: 10081 },
      { date: '2020-02-03', amount: 3000, registrationPointId: 10061 },

      // - > product.product registration
      { date: '2020-02-01', amount: 3000, registrationPointId: 10095 },
      // - > category registration
      { date: '2020-02-01', amount: 4000, registrationPointId: 10103 },
      ...areaRegistrations
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);


    const res = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?from=2020-01-01&to=2020-02-28', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const guestsTotalInPeriod = sum(guests.map(g => g.amount));
    const expectedOtherAmounts = areaRegistrations.slice(0, 2).reverse().map(r => ({
      label: r.registrationPointId === catPoint[0].id ? catPoint[0].name : '-',
      value: round((r.amount / guestsTotalInPeriod), 2)
    }));

    const expectedSeriesAmounts = [
      {
        name: 'Office', total: 200,
        points: [{ label: 'Cake', value: 109.09 }, { label: 'Fish', value: 90.91}]
      },
      {
        name: '-', total: 127.27,
        points: [{ label: 'Category root not in project', value: 72.73 }, { label: '-', value: 54.55 }]
      },
      {
        name: 'Test', total: 72.73,
        points: [{ label: 'Test', value: 72.73 }]
      },
      {
        name: 'area4', total: 29.09,
        points: [{ label: '-', value: 29.09 }]
      },
      {
        name: 'area3', total: 21.82,
        points: [{ label: '-', value: 21.82 }]
      },
      {
        name: 'Other', total: sum(expectedOtherAmounts.map(r => r.value)),
        points: expectedOtherAmounts
      },
      ];

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates.avg).to.equal(round(avg(expectedSeriesAmounts.map(s => s.total)), 2));
    expectChakram(res.body.series[0].series.length).to.equal(6);
    res.body.series[0].series.forEach((areaSeries, index) => {
      const expected = expectedSeriesAmounts[index];
      expectChakram(areaSeries.name).to.equal(expected.name);
      expectChakram(areaSeries.aggregates.total).to.equal(expected.total);
      expectChakram(areaSeries.points).to.deep.equal(expected.points);
    });

    expectChakram(res.body.series[1].aggregates.avg).to.equal(round(avg(expectedSeriesAmounts.map(s => s.total)), 2));
    expectChakram(res.body.series[1].points.length).to.equal(6);
    res.body.series[1].points.forEach((point, index) => {
      const expected = expectedSeriesAmounts[index];
      expectChakram(point.label).to.equal(expected.name);
      expectChakram(point.value).to.equal(expected.total);
    });
  });

  it('should get all registration when given time range in cost dimension in descending order', async () => {

    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-02-01', amount: 30 }
    ];

    const registrations = [
      // area.category.product registration
      { date: '2020-01-01', amount: 1000, registrationPointId: 10070 },
      // area.category registration
      { date: '2020-02-01', amount: 2000, registrationPointId: 10012 },
      // product.product registration
      { date: '2020-02-01', amount: 3000, registrationPointId: 10095 },
      // category registration
      { date: '2020-02-01', amount: 4000, registrationPointId: 10103 },
    ];

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?from=2020-01-01&to=2020-02-01&dimension=cost', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('DKK');
    expectChakram(perGuest.series[0].aggregates.avg).to.equal(9.09);
    expectChakram(perGuest.series[0].series.length).to.equal(1);
    perGuest.series[0].series.forEach((currentSeries, index, all) => {
      if(index >= all.length - 1) { return true; }
      const nextSeries = all[index + 1];
      expectChakram(currentSeries.aggregates.avg >= nextSeries.aggregates.avg).to.equal(true);
    });
  });

  it('should get all registration when given area filter', async () => {

    const guestAmounts = [
      { date: '2019-01-01', amount: 25 },
      { date: '2018-02-01', amount: 30 },
      { date: '2012-02-01', amount: 10 },
      { date: '2010-02-01', amount: 10 }
    ];

    await createGuestRegistrations(guestAmounts);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?area=10001,10002&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].aggregates).to.deep.equal({
      total: 8142.67,
      avg: 4071.33,
      min: 125.33,
      max: 8017.33
    });
    expectChakram(perGuest.series[0].series.length).to.equal(2);
    expectChakram(perGuest.series[0].series[0].name).to.equal('Office');
    expectChakram(perGuest.series[0].series[0].aggregates.total).to.equal(8017.33);
    expectChakram(perGuest.series[0].series[1].name).to.equal('Kitchen');
    expectChakram(perGuest.series[0].series[1].aggregates.total).to.equal(125.33);

  });

  it('should get all registration when given category filter', async () => {

    const guestAmounts = [
      { date: '2017-04-04', amount: 25 },
      { date: '2017-04-14', amount: 30 },
      { date: '2017-04-24', amount: 10 },
      { date: '2017-04-24', amount: 10 }
    ];

    await createGuestRegistrations(guestAmounts);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?category=10008,10011,10017,10023&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].aggregates).to.deep.equal({ total: 96.92, avg: 96.92, min: 96.92, max: 96.92 });
    expectChakram(perGuest.series[0].series.length).to.equal(1);
    expectChakram(perGuest.series[0].series[0].name).to.equal('Kitchen');
    expectChakram(perGuest.series[0].series[0].points[0].label).to.equal('Cake');
    expectChakram(perGuest.series[1].points[0].value).to.equal(96.92);
  });

  it('should get all registration when given product filter', async () => {

    const guestAmounts = [
      { date: '2017-06-01', amount: 25 },
      { date: '2017-06-02', amount: 30 },
      { date: '2018-08-25', amount: 10 },
      { date: '2017-02-09', amount: 10 }
    ];

    await createGuestRegistrations(guestAmounts);

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?product=10057,10079,10041&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].aggregates).to.deep.equal({ total: 11474.67, avg: 3824.89, max: 7717.33, min: 24 });
    expectChakram(perGuest.series[0].series.length).to.equal(3);
    expectChakram(perGuest.series[0].series[0].name).to.equal('Office');
    expectChakram(perGuest.series[0].series[0].aggregates.total).to.equal(7717.33);
    expectChakram(perGuest.series[0].series[1].name).to.equal('Second Kitchen');
    expectChakram(perGuest.series[0].series[1].aggregates.total).to.equal(3733.33);
    expectChakram(perGuest.series[0].series[2].name).to.equal('Third Kitchen');
    expectChakram(perGuest.series[0].series[2].aggregates.total).to.equal(24);
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

    const { body: perGuest } = await chakram.request('GET', '/reports/foodwaste-per-guest-overview?accounts=1,2&period=quarter&from=2020-01-01&to=2020-03-31', {
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

    const expectedTotalAverage = round(avg(Object.keys(expectedAreaAmounts).map(area => expectedAreaAmounts[area].total)), 2);
    const expectedTotal = round(sum(Object.keys(expectedAreaAmounts).map(area => expectedAreaAmounts[area].total)), 2);
    const expectedMax = round(max(Object.keys(expectedAreaAmounts).map(area => expectedAreaAmounts[area].total)), 2);
    const expectedMin = round(min(Object.keys(expectedAreaAmounts).map(area => expectedAreaAmounts[area].total)), 2);

    expectChakram(perGuest.series[0].unit).to.equal('kg');
    expectChakram(perGuest.series[0].aggregates).to.deep.equal({ total: expectedTotal, avg: expectedTotalAverage, max: expectedMax, min: expectedMin });
    expectChakram(perGuest.series[0].series.length).to.equal(2);
    perGuest.series[0].series.forEach(areaSeries => {
      const expected = expectedAreaAmounts[areaSeries.name];
      expectChakram(areaSeries.aggregates.total).to.equal(expected.total);
    });
    expectChakram(perGuest.series[1].aggregates.avg).to.equal(expectedTotalAverage);
    perGuest.series[1].points.forEach(areaPoint => {
      const expected = expectedAreaAmounts[areaPoint.label];
      expectChakram(areaPoint.value).to.equal(expected.total);
    });
  });
});
