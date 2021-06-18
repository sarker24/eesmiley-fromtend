const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const moment = require('moment');

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

describe('foodwaste-overview', () => {

  it('should return valid response', async () => {

    await createRegistrations([{ date: '2020-01-01', amount: 3500 }]);
    await chakram.request('POST', '/guest-registrations', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: {
        'customerId': 1,
        'userId': 1,
        'date': '2020-01-01',
        'amount': 14
      }
    });

    const res = await chakram.request('GET', '/reports/foodwaste-overview', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].id).to.equal('foodwasteOverviewByAreas');
    expectChakram(res.body.series[1].id).to.equal('foodwasteOverviewAreaRatios');
    await validateResponse(findSchema, res);

  });

  it('should return valid response with 0 amounts when no data exist', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-overview?accounts=5&from=2019-12-01&to=2019-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].id).to.equal('foodwasteOverviewByAreas');
    expectChakram(res.body.series[0].series.length).to.equal(0);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 0,
      avg: 0,
      min: 0,
      max: 0
    });

    expectChakram(res.body.series[1].id).to.equal('foodwasteOverviewAreaRatios');
    expectChakram(res.body.series[1].points.length).to.equal(0);
    expectChakram(res.body.series[1].aggregates).to.deep.equal({
      total: 0,
      avg: 0,
      min: 0,
      max: 0
    });
    await validateResponse(findSchema, res);
  });

  it('should get overview registrations for customer with default one year range and dimension weight in descending order', async () => {
    // area.category.product registration
    const date = moment().subtract(2, 'months').format('YYYY-MM-DD');
    await createRegistrations([{ date, amount: 2147483000 }]);
    // area.category registration
    await createRegistrations([{ date, amount: 2147483000, registrationPointId: 10012 }]);
    // product.product registration
    await createRegistrations([{ date, amount: 3000, registrationPointId: 10095 }]);
    // category registration
    await createRegistrations([{ date, amount: 4000, registrationPointId: 10103 }]);

    const res = await chakram.request('GET', '/reports/foodwaste-overview?dimension=weight&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 4294973000,
      avg: 1431657666.67,
      min: 7000,
      max: 2147483000
    });
    expectChakram(res.body.series[0].series.length).to.equal(3);
    expectChakram(res.body.series[0].series[0].name).to.equal('Office');
    expectChakram(res.body.series[0].series[0].aggregates).to.deep.equal({
      total: 2147483000,
      avg: 2147483000,
      min: 2147483000,
      max: 2147483000
    });
    expectChakram(res.body.series[0].series[0].points).to.deep.equal([
      { label: 'Fish', value: 2147483000 }
    ]);
    expectChakram(res.body.series[0].series[1].name).to.equal('Test');
    expectChakram(res.body.series[0].series[1].aggregates).to.deep.equal({
      total: 2147483000,
      avg: 2147483000,
      min: 2147483000,
      max: 2147483000
    });
    expectChakram(res.body.series[0].series[1].points).to.deep.equal([
      { label: 'Test', value: 2147483000 }
    ]);
    expectChakram(res.body.series[0].series[2].name).to.equal('-');
    expectChakram(res.body.series[0].series[2].aggregates).to.deep.equal({
      total: 7000,
      avg: 3500,
      min: 3000,
      max: 4000
    });
    expectChakram(res.body.series[0].series[2].points).to.deep.equal([
      {
        label: 'Category root not in project',
        value: 4000
      },
      {
        label: '-',
        value: 3000
      }
    ]);

    expectChakram(res.body.series[1].unit).to.equal('%');
    expectChakram(res.body.series[1].aggregates).to.deep.equal({ total: 100, avg: 33.33, min: 0, max: 50 });
    expectChakram(res.body.series[1].points).to.deep.equal([
      { label: 'Office', value: 50 },
      { label: 'Test', value: 50 },
      { label: '-', value: 0 } // so insignificant value compared to the other ones
    ]);

    res.body.series[0].series.forEach((currentSeries, index, all) => {
      if (index >= all.length - 1) {
        return true;
      }
      const nextSeries = all[index + 1];
      expectChakram(currentSeries.aggregates.total >= nextSeries.aggregates.total).to.equal(true);
    });

  });

  it('should get all registration when given time range in cost dimension', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?from=2001-01-01&to=2019-01-01&dimension=cost', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('DKK');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 3312538,
      avg: 662507.6,
      min: 30002,
      max: 2805000
    });
    expectChakram(res.body.series[0].series.length).to.equal(5);
  });

  it('should get all registration when given area filter', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?area=10001,10002&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({ total: 610700, avg: 305350, min: 9400, max: 601300 });
    expectChakram(res.body.series[0].series.length).to.equal(2);
    expectChakram(res.body.series[0].series[0].name).to.equal('Office');
    expectChakram(res.body.series[0].series[1].name).to.equal('Kitchen');
  });

  it('should get all registration when given category filter', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?category=10008,10011,10017,10023&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({ total: 6300, avg: 6300, min: 6300, max: 6300 });
    expectChakram(res.body.series[0].series.length).to.equal(1);
    expectChakram(res.body.series[0].series[0].name).to.equal('Kitchen');
    expectChakram(res.body.series[0].series.every(series => series.points.length === 1 && series.points[0].label === 'Cake')).to.equal(true);
  });

  it('should get all registration when given product filter', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?product=10057,10079,10041&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 860600,
      avg: 286866.67,
      min: 1800,
      max: 578800
    });
    expectChakram(res.body.series[0].series.length).to.equal(3);
    expectChakram(res.body.series[0].series[0].name).to.equal('Office');
    expectChakram(res.body.series[0].series[1].name).to.equal('Second Kitchen');
    expectChakram(res.body.series[0].series[2].name).to.equal('Third Kitchen');
  });

  it('should get registrations for multiple accounts', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?accounts=1,2&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 2500600,
      avg: 416766.67,
      min: 9400,
      max: 800000
    });
    expectChakram(res.body.series[0].series.length).to.equal(6);
  });

  it('should get registrations for top 2 accounts', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?accounts=top2&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    // top 2 accounts: 1,2
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 2500600,
      avg: 416766.67,
      min: 9400,
      max: 800000
    });
    expectChakram(res.body.series[0].series.length).to.equal(6);
  });

  it('should get registrations for bottom 2 accounts', async () => {
    const res = await chakram.request('GET', '/reports/foodwaste-overview?accounts=bottom2&from=2001-01-01&to=2019-01-01', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    // bottom 2 accounts: 10240, 10479 (no registrations)
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 0,
      avg: 0,
      min: 0,
      max: 0
    });
    expectChakram(res.body.series[0].series.length).to.equal(0);
  });

  it('should get registrations for all accounts from custom period', async () => {
    await createRegistrations([{
      date: '2010-01-01',
      amount: 900000,
      registrationPointId: 10085,
      customerId: 10240
    }]);

    const res = await chakram.request('GET', '/reports/foodwaste-overview?accounts=*&from=2001-01-01&to=2019-01-01&period=custom', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    // account 10240, rp id 10085
    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].unit).to.equal('kg');
    // bottom 2 accounts: 10240, 10479 (no registrations)
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 3400600,
      avg: 566766.67,
      min: 9400,
      max: 1306300
    });
    expectChakram(res.body.series[0].series.length).to.equal(6);
  });
});
