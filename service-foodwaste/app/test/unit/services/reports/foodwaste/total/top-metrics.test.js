'use strict';

const round = require('../../../../../../src/util/math').round;

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../../../src/app').default;
const sinon = require('sinon');
const FoodwasteMetricsService = require('../../../../../../src/services/reports/foodwaste/top-metrics').default;
const fwQueries = require('../../../../../../src/services/reports/foodwaste/util/total-queries');
const perGuestQueries = require('../../../../../../src/services/reports/foodwaste/util/per-guest-queries');
chai.use(chaiHttp);
chai.use(chaiSubset);

const FixedCurrentPeriod = { date: '2020-05-01', amount: 190 };
const FixedUnits = { cost: 'EUR', weight: 'kg' };

describe('Foodwaste Top Metrics Service', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  let service;
  let totalRegistrationQuery;
  let medianQueryStub;
  let currentPeriodQuery;
  let rawQueryStub;

  beforeEach(() => {
    totalRegistrationQuery = sandbox.stub(sequelize, 'query');
    medianQueryStub = sandbox.stub(sequelize.models.registration_point, 'findAll').resolves([]);
    sandbox.stub(fwQueries, 'topMetricQuery').returns('');
    sandbox.stub(perGuestQueries, 'topMetricQuery').returns('');
    service = new FoodwasteMetricsService();
    service.setup(app, '/dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0 when no data exist', async () => {
    totalRegistrationQuery.resolves([{ date: '2019-01-01', amount: 0}, {date: '2018-01-01', amount: 0}]);
    const result = await service.find({
      accessTokenPayload: { customerId: 1 },
      query: {
        registrationPointIds: [],
        customerId: 1,
        period: 'month',
        date: {
          $gte: '2019-01-01',
          $lte: '2019-01-31'
        },
        dimension: 'weight',
        unit: FixedUnits.weight,
        resource: 'total'
      }
    });
    expect(result.metrics.length).to.equal(4);
    expect(result.metrics.every(metric => metric.point === 0 && metric.trend === 0)).to.equal(true);

  });

  it('should return total amount metrics for single customer', async () => {
    totalRegistrationQuery.resolves([
      FixedCurrentPeriod,
      { date: '2019-04-01', amount: 100 },
      { date: '2019-03-01', amount: 10 },
      { date: '2019-02-01', amount: 20 },
      { date: '2019-01-01', amount: 200 }
    ]);

    const result = await service.find({
      accessTokenPayload: { customerId: 1 },
      query: {
        registrationPointIds: [],
        customerId: 1,
        period: 'month',
        date: {
          $gte: '2019-05-01',
          $lte: '2019-05-31'
        },
        dimension: 'weight',
        unit: FixedUnits.weight,
        resource: 'total'
      }
    });

    const expectedAmounts = {
      foodwasteCurrentPeriod: FixedCurrentPeriod.amount,
      foodwasteBestPeriod: 10,
      foodwasteWorstPeriod: 200,
      foodwasteAveragePeriod: 104
    };

    const expectedTrends = {
      foodwasteCurrentPeriod: round( 100 * ((FixedCurrentPeriod.amount - 100) / 100), 2),
      foodwasteBestPeriod: round(100 * ((FixedCurrentPeriod.amount - 10) / 10), 2),
      foodwasteWorstPeriod: round(100 * ((FixedCurrentPeriod.amount - 200) / 200), 2),
      foodwasteAveragePeriod: round(100 * ((FixedCurrentPeriod.amount - 104) / 104), 2)
    };

    expect(result.metrics.length).to.equal(4);
    expect(result.metrics.every(metric => metric.trend === expectedTrends[metric.id])).to.equal(true);
    expect(result.metrics.every(metric => metric.unit === FixedUnits.weight && metric.point === expectedAmounts[metric.id])).to.equal(true);

  });

  it('should return total amount metrics when selected period has no registered waste', async () => {
    totalRegistrationQuery.resolves([
      { date: '2019-05-01', amount: 0 },
      { date: '2019-04-01', amount: 100 },
      { date: '2019-03-01', amount: 10 },
      { date: '2019-02-01', amount: 20 },
      { date: '2019-01-01', amount: 200 }
    ]);

    const result = await service.find({
      accessTokenPayload: { customerId: 1 },
      query: {
        registrationPointIds: [],
        customerId: 1,
        period: 'month',
        date: {
          $gte: '2019-05-01',
          $lte: '2019-05-31'
        },
        dimension: 'weight',
        unit: FixedUnits.weight,
        resource: 'total'
      }
    });

    const expectedPoints = {
      foodwasteCurrentPeriod: 0,
      foodwasteBestPeriod: 10,
      foodwasteWorstPeriod: 200,
      foodwasteAveragePeriod: 82.5
    };

    expect(result.metrics.length).to.equal(4);
    expect(result.metrics.every(metric => metric.trend === 0 && metric.point === expectedPoints[metric.id])).to.equal(true);

  });

  it('should return total amount metrics in cost dimension', async () => {
    totalRegistrationQuery.resolves([
      FixedCurrentPeriod,
      { date: '2019-04-01', amount: 100 },
      { date: '2019-03-01', amount: 10 },
      { date: '2019-02-01', amount: 20 },
      { date: '2019-01-01', amount: 200 }
    ]);

    const result = await service.find({
      accessTokenPayload: { customerId: 1 },
      query: {
        registrationPointIds: [],
        customerId: 1,
        period: 'month',
        date: {
          $gte: '2019-05-01',
          $lte: '2019-05-31'
        },
        dimension: 'cost',
        unit: FixedUnits.cost,
        resource: 'total'
      }
    });

    const expectedCosts = {
      foodwasteCurrentPeriod: FixedCurrentPeriod.amount,
      foodwasteBestPeriod: 10,
      foodwasteWorstPeriod: 200,
      foodwasteAveragePeriod: 104
    };

    expect(result.metrics.length).to.equal(4);
    expect(result.metrics.every(metric => metric.unit === FixedUnits.cost && metric.point === expectedCosts[metric.id])).to.equal(true);
  });

  it('should return per guest amount metrics in cost dimension', async () => {
    totalRegistrationQuery.resolves([
      FixedCurrentPeriod,
      { date: '2019-04-01', amount: 100 },
      { date: '2019-03-01', amount: 10 },
      { date: '2019-02-01', amount: 20 },
      { date: '2019-01-01', amount: 200 }
    ]);

    const result = await service.find({
      accessTokenPayload: { customerId: 1 },
      query: {
        registrationPointIds: [],
        customerId: 1,
        period: 'month',
        date: {
          $gte: '2019-05-01',
          $lte: '2019-05-31'
        },
        dimension: 'cost',
        unit: FixedUnits.cost,
        resource: 'total'
      }
    });

    const expectedCosts = {
      foodwasteCurrentPeriod: FixedCurrentPeriod.amount,
      foodwasteBestPeriod: 10,
      foodwasteWorstPeriod: 200,
      foodwasteAveragePeriod: 104
    };

    expect(result.metrics.length).to.equal(4);
    expect(result.metrics.every(metric => metric.unit === FixedUnits.cost && metric.point === expectedCosts[metric.id])).to.equal(true);
  });
});
