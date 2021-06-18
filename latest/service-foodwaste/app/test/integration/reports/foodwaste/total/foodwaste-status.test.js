const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const testLongLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');

async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

describe('foodwaste-status', () => {

  it('should return valid response with defaults', async () => {

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

    const res = await chakram.request('GET', '/reports/foodwaste-status?from=2019-10-01&to=2020-02-29', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.metrics.length).to.equal(1);
    expectChakram(res.body.extra.hasOwnProperty('target')).to.equal(true);
    expectChakram(res.body.series[0].id).to.equal('foodwasteStatusByAreas');
    expectChakram(res.body.series[0].series[0].id).to.equal('foodwasteStatusByArea');
    expectChakram(res.body.metrics[0].id).to.equal('foodwasteStatusPerformance');

    await validateResponse(findSchema, res);
  });

  it('should return valid response with 0 amounts when no registrations exist for multiple customers', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?from=2019-12-01&to=2019-12-31&accounts=1,2,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.metrics.length).to.equal(1);
    expectChakram(res.body.extra.hasOwnProperty('target')).to.equal(true);
    expectChakram(res.body.series[0].id).to.equal('foodwasteStatusByAreas');
    expectChakram(res.body.series[0].series[0].id).to.equal('foodwasteStatusByArea');
    expectChakram(res.body.metrics[0].id).to.equal('foodwasteStatusPerformance');

    expectChakram(res.body.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, max: 0, min: 0 });
    res.body.series[0].series.forEach(series => {
      expectChakram(series.aggregates).to.deep.equal({total: 0, avg: 0, min: 0, max: 0});
      expectChakram(series.points.every(point => point.value === 0)).to.equal(true);
    });
  });

  it('should return data for single customer in default weight dimension & period month', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?from=2018-08-01&to=2018-08-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].series.length).to.equal(6);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 1285400,
      avg: 428466.67,
      max: 485400,
      min: 400000
    });
    expectChakram(res.body.metrics[0].unit).to.equal('kg');
    expectChakram(res.body.metrics[0].point).to.equal(321350);
    expectChakram(res.body.metrics[0].trend).to.equal(-41.57);
    expectChakram(res.body.extra.target).to.equal(550000);
  });

  it('should return data for multiple customers in default weight dimension & period month in descending order', async () => {

    // cu 1, cu 2 only ones with settings, but they share the same,
    // so to test out avg changes, changing fw target for cu 2
    await chakram.request('PATCH', '/settings/10001', {
      'headers': {
        'Authorization': 'Bearer ' + testLongLivedAccessTokenCustomerId2
      },
       'body': [
         { op: 'replace', path: '/current/expectedFoodwaste', value: [{ from: '1970-01-01', amount: 3200, unit: 'g', period: 'week', amountNormalized: 3200/7 }]}
       ]
    });

    const res = await chakram.request('GET', '/reports/foodwaste-status?accounts=1,2,3,4,5&from=2018-08-01&to=2018-08-31&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('kg');
    expectChakram(res.body.series[0].series.length).to.equal(6);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 2085400,
      avg: 521350,
      min: 400000,
      max: 800000
    });
    expectChakram(res.body.metrics[0].unit).to.equal('kg');
    expectChakram(res.body.metrics[0].point).to.equal(521350);
    expectChakram(res.body.metrics[0].trend).to.equal(84.86);
    expectChakram(res.body.extra.target).to.equal(282028.57);

    res.body.series[0].series.forEach((currentSeries, index, all) => {
      if(index >= all.length - 1) { return ; }
      const nextSeries = all[index + 1];
      expectChakram(currentSeries.aggregates.total >= nextSeries.aggregates.total).to.equal(true);
    });

  });

  it('should return data for single customer in cost dimension', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?dimension=cost&from=2018-08-01&to=2018-08-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('DKK');
    expectChakram(res.body.series[0].series.length).to.equal(6);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 143446,
      avg: 47815.33,
      max: 63446,
      min: 40000
    });
    expectChakram(res.body.metrics[0].unit).to.equal('DKK');
    expectChakram(res.body.metrics[0].point).to.equal(35861.5);
    expectChakram(res.body.metrics[0].trend).to.equal(-93.48);
    expectChakram(res.body.extra.target).to.equal(550000);
  });

  it('should return data for multiple customers in cost dimension', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?accounts=1,2,3,4,5&dimension=cost&from=2018-08-01&to=2018-08-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('DKK');
    expectChakram(res.body.series[0].series.length).to.equal(6);
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 223446,
      avg: 55861.5,
      max: 80000,
      min: 40000
    });
    expectChakram(res.body.metrics[0].unit).to.equal('DKK');
    expectChakram(res.body.metrics[0].point).to.equal(55861.5);
    expectChakram(res.body.metrics[0].trend).to.equal(-89.84);
    expectChakram(res.body.extra.target).to.equal(550000);
  });

  it('should return data for multiple customers in year period', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?period=year&accounts=1,2,3,4,5&dimension=cost&from=2018-01-01&to=2018-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('DKK');
    expectChakram(res.body.series[0].series.length).to.equal(6);

    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      total: 3392538,
      avg: 565423,
      max: 2805000,
      min: 30002
    });
    expectChakram(res.body.metrics[0].unit).to.equal('DKK');
    expectChakram(res.body.metrics[0].point).to.equal(1130846);
    expectChakram(res.body.metrics[0].trend).to.equal(-80.38);
    expectChakram(res.body.extra.target).to.equal(5764285.71);
  });

  it('should return data for multiple customers in custom period', async () => {

    const res = await chakram.request('GET', '/reports/foodwaste-status?period=custom&accounts=1,2,3,4,5&dimension=cost&from=2018-04-20&to=2018-08-02', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');

    expectChakram(res.body.series[0].unit).to.equal('DKK');
    expectChakram(res.body.series[0].series.length).to.equal(6);

    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      avg: 82115.6,
      max: 304278,
      min: 20000,
      total: 410578
    });
    expectChakram(res.body.metrics[0].unit).to.equal('DKK');
    expectChakram(res.body.metrics[0].point).to.equal(136859.33);
    expectChakram(res.body.metrics[0].trend).to.equal(-90.92);
    expectChakram(res.body.extra.target).to.equal(1507142.86);
  });

});
