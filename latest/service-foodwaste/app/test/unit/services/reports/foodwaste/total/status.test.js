const round = require('../../../../../../src/util/math').round;
const array = require('../../../../../../src/util/array');

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const moment = require('moment');
const app = require('../../../../../../src/app').default;
const sinon = require('sinon');
const FoodwasteStatusService = require('../../../../../../src/services/reports/foodwaste/status').default;
const fwQueries = require('../../../../../../src/services/reports/foodwaste/util/total-queries');
const perGuestQueries = require('../../../../../../src/services/reports/foodwaste/util/per-guest-queries');

const SortOrder = require('../../../../../../src/util/constants').SortOrder;

chai.use(chaiHttp);
chai.use(chaiSubset);

// status endpoint returns fixed number of 4 periods (selected + 3 previous)
const NumOfPeriods = 4;

const AreaRegistrations = (unit) =>
  [{
    name: 'area1',
    unit,
    total: 600,
    avg: 200.00,
    max: 300,
    min: 100,
    registrations: [
      { date: '2012-12-12', amount: 300 },
      { date: '2010-01-01', amount: 200 },
      { date: '2009-09-09', amount: 100 },
    ]
  },
    {
      name: 'area2',
      unit,
      total: 1900,
      avg: 950.00,
      max: 1200,
      min: 700,
      registrations: [
        { date: '2012-10-12', amount: 700 },
        { date: '2009-08-09', amount: 1200 },
      ]
    }];

// in gram / kg
const CustomerCostMedians = {
  1: 125,
  2: 322
};

const FixedExpectedWeightPerDay = 400;

describe('Foodwaste Status Service', () => {
  const sequelize = app.get('sequelize');
  const targetService = app.service('/targets/foodwaste');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;
  let targetServiceStub;

  beforeEach(() => {
    targetServiceStub = sandbox.stub(targetService, 'find').callsFake(params => {
      const { dimension, customerId, date: { $lte: to, $gte: from }} = params.query;
      const customerIds = Array.isArray(customerId) ? customerId: [customerId];
      const days = moment(to).diff(moment(from), 'days') + 1;
      return customerIds.map(id => ({
        customerId: id,
        targetsTotal: FixedExpectedWeightPerDay * days * (dimension === 'cost' ? CustomerCostMedians[id] : 1),
        targets: [{ to, from, targetAmount: FixedExpectedWeightPerDay * days * (dimension === 'cost' ? CustomerCostMedians[id] : 1) }]
      }))
    });

    sandbox.stub(fwQueries, 'statusQuery').returns('');
    sandbox.stub(perGuestQueries, 'statusQuery').returns('');
    registrationQueryStub = sandbox.stub(sequelize, 'query').resolves([]);

    service = new FoodwasteStatusService();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0 when no data exist', async () => {
    registrationQueryStub.resolves([]);
    targetServiceStub.resolves([]);

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: 1,
        unit: 'kg',
        date: { $gte: '2000-01-01', $lte: '2010-01-01' },
        dimension: 'weight',
        order: SortOrder.desc,
        resource: 'total'
      }
    });
    expect(registrationQueryStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].series.length).to.equal(0);
    expect(result.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0 });
    expect(result.metrics.length).to.equal(1);
    expect(result.metrics[0].point).to.equal(0);
    expect(result.metrics[0].trend).to.equal(0);
    expect(result.hasOwnProperty('extra')).to.equal(true);
  });

  it('should return total amounts for a month for one customer', async () => {
    const from = moment('2010-12-01');
    const to = moment('2010-12-31');
    const last3PeriodStart = moment(from).subtract(3, 'month');
    const days = to.diff(last3PeriodStart, 'days') + 1;
    const weightRegistrations = AreaRegistrations('kg');

    registrationQueryStub.resolves(weightRegistrations);

    const expectedTarget = (days * FixedExpectedWeightPerDay) / NumOfPeriods;
    const expectedAveragePerPeriod = (700 + 300) / 2;
    const expectedTotal = array.sum(weightRegistrations.map(i => i.total));

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: 1,
        date: { $gte: from.format('YYYY-MM-DD'), $lte: to.format('YYYY-MM-DD') },
        dimension: 'weight',
        unit: 'kg',
        period: 'month',
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].id).to.equal('foodwasteStatusByAreas');
    expect(result.series[0].unit).to.equal('kg');
    expect(result.series[0].aggregates.total).to.equal(expectedTotal);

    expect(result.series[0].series.length).to.equal(2);
    expect(result.series[0].series[0].id).to.equal('foodwasteStatusByArea');
    expect(result.series[0].series[0].name).to.equal('area1');
    expect(result.series[0].series[0].points.length).to.equal(3);
    expect(result.series[0].series[1].name).to.equal('area2');
    expect(result.series[0].series[1].points.length).to.equal(2);

    expect(result.metrics[0].id).to.equal('foodwasteStatusPerformance');
    expect(result.metrics[0].unit).to.equal('kg');
    expect(result.metrics[0].point).to.equal(expectedAveragePerPeriod);
    expect(result.extra.target).to.equal(round(expectedTarget));
    expect(result.metrics[0].trend).to.equal(round(100 * (expectedAveragePerPeriod - expectedTarget)/expectedTarget));
  });

  it('should return total amounts for a single customer in cost dimension', async () => {
    const customerId = 1;
    const from = moment('2009-12-01');
    const to = moment('2009-12-31');
    const last3PeriodStart = moment(from).subtract(3, 'month');
    const days = to.diff(last3PeriodStart, 'days') + 1;
    const weightRegistrations = AreaRegistrations('DKK');

    registrationQueryStub.resolves(weightRegistrations);

    const expectedTarget = (days * FixedExpectedWeightPerDay * CustomerCostMedians[customerId]) / NumOfPeriods;
    const expectedAverage = (700 + 300) / 2;
    const expectedTotal = array.sum(weightRegistrations.map(i => i.total));

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: 1,
        date: {
          $gte: from.format('YYYY-MM-DD'),
          $lte: to.format('YYYY-MM-DD')
        },
        dimension: 'cost',
        unit: 'DKK',
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].id).to.equal('foodwasteStatusByAreas');
    expect(result.series[0].unit).to.equal('DKK');
    expect(result.series[0].aggregates.total).to.equal(expectedTotal);

    expect(result.series[0].series.length).to.equal(2);
    expect(result.series[0].series[0].id).to.equal('foodwasteStatusByArea');
    expect(result.series[0].series[0].unit).to.equal('DKK');
    expect(result.series[0].series[0].name).to.equal('area1');
    expect(result.series[0].series[0].points.length).to.equal(3);
    expect(result.series[0].series[1].name).to.equal('area2');
    expect(result.series[0].series[1].points.length).to.equal(2);

    expect(result.metrics[0].id).to.equal('foodwasteStatusPerformance');
    expect(result.metrics[0].unit).to.equal('DKK');
    expect(result.metrics[0].point).to.equal(round(expectedAverage));
    expect(result.extra.target).to.equal(round(expectedTarget));
    expect(result.metrics[0].trend).to.equal(round(100 * (expectedAverage - expectedTarget)/expectedTarget));

  });

  it('should return total amounts for multiple customers in weight dimension', async () => {
    const from = moment('2009-12-01');
    const to = moment('2009-12-31');
    const last3PeriodStart = moment(from).subtract(3, 'month');
    const days = to.diff(last3PeriodStart, 'days') + 1;
    const weightRegistrations = AreaRegistrations('kg');

    registrationQueryStub.resolves(weightRegistrations);

    const expectedTarget = (days * FixedExpectedWeightPerDay) / NumOfPeriods;
    const expectedAverage = (700 + 300) / 2;

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: [1, 2],
        date: { $gte: from.format('YYYY-MM-DD'), $lte: to.format('YYYY-MM-DD') },
        dimension: 'weight',
        unit: 'kg',
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.metrics[0].unit).to.equal('kg');
    expect(result.metrics[0].point).to.equal(expectedAverage);
    expect(result.extra.target).to.equal(round(expectedTarget));
    expect(result.metrics[0].trend).to.equal(round(100 * (expectedAverage - expectedTarget)/expectedTarget));
  });

  it('should return per guest amounts for multiple customers in weight dimension', async () => {
    const from = moment('2009-12-01');
    const to = moment('2009-12-31');
    const last3PeriodStart = moment(from).subtract(3, 'month');
    const days = to.diff(last3PeriodStart, 'days') + 1;
    const weightRegistrations = AreaRegistrations('kg');

    registrationQueryStub.resolves(weightRegistrations);

    const expectedTarget = (days * FixedExpectedWeightPerDay) / NumOfPeriods;
    const expectedAverage = (700 + 300) / 2;

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: [1, 2],
        date: { $gte: from.format('YYYY-MM-DD'), $lte: to.format('YYYY-MM-DD') },
        dimension: 'weight',
        unit: 'kg',
        resource: 'perGuest'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.metrics[0].unit).to.equal('kg');
    expect(result.metrics[0].point).to.equal(expectedAverage);
    expect(result.extra.target).to.equal(round(expectedTarget));
    expect(result.metrics[0].trend).to.equal(round(100 * (expectedAverage - expectedTarget)/expectedTarget));
  });

});
