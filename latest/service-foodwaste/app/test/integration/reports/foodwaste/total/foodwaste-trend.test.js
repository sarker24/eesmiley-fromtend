const REGISTRATION_DATE_FORMAT = require('../../../../../src/util/datetime').REGISTRATION_DATE_FORMAT;
const FOODWASTE_REPORT_IDS = require('../../../../../src/services/reports/foodwaste/trend').FOODWASTE_REPORT_IDS['total'];

const app = require('../../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const moment = require('moment');
const sinon = require('sinon');

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

describe('foodwaste-total-trend', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  it('should return valid response with 0 amounts from past year when no registrations exist', async () => {
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    const res = await chakram.request('GET', '/reports/foodwaste-trend', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      [FOODWASTE_REPORT_IDS.trendBestMonth, FOODWASTE_REPORT_IDS.trendWorstMonth].includes(metric.id) &&
      metric.trend === 0 &&
      metric.point === 0
    )).to.equal(true);
    expectChakram(res.body.extra.target).to.equal(806593.41);

    await validateResponse(findSchema, res);
  });

  it('should return valid response with amounts from past year', async () => {
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    const registrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 2147483000 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 2147483000 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 12355 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 900000 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 10000 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-trend', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedWorstMonth = moment()
      .subtract(1, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedBestMonth = moment()
      .subtract(4, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedMetricsById = {
      [FOODWASTE_REPORT_IDS.trendBestMonth]: {
        id: FOODWASTE_REPORT_IDS.trendBestMonth,
        unit: 'kg',
        trend: -98.76,
        point: {
          label: expectedBestMonth,
          value: 10000
        }
      },
      [FOODWASTE_REPORT_IDS.trendWorstMonth]: {
        id: FOODWASTE_REPORT_IDS.trendWorstMonth,
        unit: 'kg',
        trend: 532382.16,
        point: {
          label: expectedWorstMonth,
          value: 4294966000
        }
      }
    };

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      metric.id === expectedMetricsById[metric.id].id &&
      metric.point.label === expectedMetricsById[metric.id].point.label &&
      metric.point.value === expectedMetricsById[metric.id].point.value &&
      metric.unit === expectedMetricsById[metric.id].unit &&
      metric.trend === expectedMetricsById[metric.id].trend
    )).to.equal(true);

    expectChakram(res.body.extra.target).to.equal(806593.41);
  });

  it('should return valid response with cost amounts from past year', async () => {
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));

    const registrations = [
      { date: moment().format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(1, 'month').format(REGISTRATION_DATE_FORMAT), amount: 20000 },
      { date: moment().subtract(2, 'month').format(REGISTRATION_DATE_FORMAT), amount: 30000 },
      { date: moment().subtract(3, 'month').format(REGISTRATION_DATE_FORMAT), amount: 900000 },
      { date: moment().subtract(4, 'month').format(REGISTRATION_DATE_FORMAT), amount: 10000 }
    ];

    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/reports/foodwaste-trend?dimension=cost', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedWorstMonth = moment()
      .subtract(3, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedBestMonth = moment()
      .subtract(4, 'month')
      .startOf('month')
      .format(REGISTRATION_DATE_FORMAT);

    const expectedMetricsById = {
      [FOODWASTE_REPORT_IDS.trendBestMonth]: {
        id: FOODWASTE_REPORT_IDS.trendBestMonth,
        unit: 'DKK',
        trend: -99.38,
        point: {
          label: expectedBestMonth,
          value: 5000
        }
      },
      [FOODWASTE_REPORT_IDS.trendWorstMonth]: {
        id: FOODWASTE_REPORT_IDS.trendWorstMonth,
        unit: 'DKK',
        trend: -44.21,
        point: {
          label: expectedWorstMonth,
          value: 450000
        }
      }
    };

    expectChakram(res).to.have.status(200);
    expectChakram(res.body.series.length).to.equal(1);
    expectChakram(res.body.series[0].id).to.equal(FOODWASTE_REPORT_IDS.trend);
    expectChakram(res.body.series[0].points.length).to.equal(13);
    expectChakram(res.body.metrics.length).to.equal(2);
    expectChakram(res.body.metrics.every(metric =>
      metric.id === expectedMetricsById[metric.id].id &&
      metric.point.label === expectedMetricsById[metric.id].point.label &&
      metric.point.value === expectedMetricsById[metric.id].point.value &&
      metric.unit === expectedMetricsById[metric.id].unit &&
      metric.trend === expectedMetricsById[metric.id].trend
    )).to.equal(true);

    expectChakram(res.body.extra.target).to.equal(806593.41);
  });

});
