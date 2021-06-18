const REGISTRATION_DATE_FORMAT = require('../../../../../../src/util/datetime').REGISTRATION_DATE_FORMAT;

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const moment = require('moment');
const app = require('../../../../../../src/app').default;
const sinon = require('sinon');
const fwQueries = require('../../../../../../src/services/reports/foodwaste/util/total-queries');
const perGuestQueries = require('../../../../../../src/services/reports/foodwaste/util/per-guest-queries');

const Service = require('../../../../../../src/services/reports/foodwaste/trend').default;
chai.use(chaiHttp);
chai.use(chaiSubset);

// in gram / kg
const CustomerCostMedians = { 1: 125 };

const genFixedMonthlyRegistrations = () =>
  [
    {
      date: moment().subtract(12, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT),
      amount: 1000,
    },
    {
      date: moment().subtract(11, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT),
      amount: 2000,
    },
    {
      date: moment().subtract(10, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT),
      amount: 3000,
    },
    {
      date: moment().subtract(9, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT),
      amount: 4000,
    },
  ];

const FixedExpectedWeightPerDay = 400;

describe('Foodwaste Trend Service', () => {
  const sequelize = app.get('sequelize');
  const targetService = app.service('/targets/foodwaste');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;
  let targetServiceStub;
  let fixedMonthlyRegistrations = [];

  beforeEach(() => {
    // fix moment() to dec 1st 2020
    sandbox.stub(moment, 'now').callsFake(() => +new Date(2020, 11, 1));
    fixedMonthlyRegistrations = genFixedMonthlyRegistrations();
    targetServiceStub = sandbox.stub(targetService, 'find').callsFake(params => {
      const { dimension, customerId, date: { $lte: to, $gte: from } } = params.query;
      const customerIds = Array.isArray(customerId) ? customerId : [customerId];
      const days = moment(to).diff(moment(from), 'days') + 1;
      return customerIds.map(id => ({
        customerId: id,
        targetsTotal: FixedExpectedWeightPerDay * days * (dimension === 'cost' ? CustomerCostMedians[id] : 1),
        targets: [{
          to,
          from,
          targetAmount: FixedExpectedWeightPerDay * days * (dimension === 'cost' ? CustomerCostMedians[id] : 1)
        }]
      }))
    });

    registrationQueryStub = sandbox.stub(sequelize, 'query').resolves([]);
    sandbox.stub(fwQueries, 'topMetricQuery').resolves('');
    sandbox.stub(perGuestQueries, 'topMetricQuery').resolves('');

    service = new Service();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0 when no data exists', async () => {
    registrationQueryStub.resolves([]);
    targetServiceStub.resolves([]);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        registrationPointIds: [],
        resource: 'total'
      }
    });
    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].points.length).to.equal(13);
    expect(result.metrics.length).to.equal(2);
    expect(result.extra.target).to.equal(0);

    expect(result.series[0].points.every(point => point.value === 0)).to.equal(true);
    expect(result.metrics.every(metric => metric.point === 0 && metric.trend === 0)).to.equal(true);

  });

  it('should return total amounts from past year in cost dimension', async () => {
    registrationQueryStub.resolves(fixedMonthlyRegistrations);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'cost',
        registrationPointIds: [],
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.metrics.length).to.equal(2);
    expect(result.extra.target).to.equal(1411538.46);

    const [bestMonthMetric, worstMonthMetric] = result.metrics;
    expect(bestMonthMetric.point.label).to.equal(moment().subtract(12, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(bestMonthMetric.point.value).to.equal(1000);
    expect(bestMonthMetric.trend).to.equal(-99.93);

    expect(worstMonthMetric.point.label).to.equal(moment().subtract(9, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(worstMonthMetric.point.value).to.equal(4000);
    expect(worstMonthMetric.trend).to.equal(-99.72);
  });

  it('should return total amounts from past year in weight dimension', async () => {
    registrationQueryStub.resolves(fixedMonthlyRegistrations);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        registrationPointIds: [],
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].points.length).to.equal(13);
    expect(result.metrics.length).to.equal(2);
    expect(result.extra.target).to.equal(11292.31);

    const [bestMonthMetric, worstMonthMetric] = result.metrics;
    expect(bestMonthMetric.point.label).to.equal(moment().subtract(12, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(bestMonthMetric.point.value).to.equal(1000);
    expect(bestMonthMetric.trend).to.equal(-91.14);

    expect(worstMonthMetric.point.label).to.equal(moment().subtract(9, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(worstMonthMetric.point.value).to.equal(4000);
    expect(worstMonthMetric.trend).to.equal(-64.58);

    expect(fixedMonthlyRegistrations
      .every(reg =>
        result.series[0].points
          .find(point => point.label === reg.date && point.value === reg.amount))).to.equal(true);
  });

  it('should return per guest amounts from past year in weight dimension', async () => {
    registrationQueryStub.resolves(fixedMonthlyRegistrations);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        registrationPointIds: [],
        resource: 'perGuest'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);

    expect(result.series.length).to.equal(1);
    expect(result.series[0].points.length).to.equal(13);
    expect(result.metrics.length).to.equal(2);
    expect(result.extra.target).to.equal(146800);

    const [bestMonthMetric, worstMonthMetric] = result.metrics;
    expect(bestMonthMetric.point.label).to.equal(moment().subtract(12, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(bestMonthMetric.point.value).to.equal(1000);
    expect(bestMonthMetric.trend).to.equal(-99.32);

    expect(worstMonthMetric.point.label).to.equal(moment().subtract(9, 'months').startOf('month').format(REGISTRATION_DATE_FORMAT))
    expect(worstMonthMetric.point.value).to.equal(4000);
    expect(worstMonthMetric.trend).to.equal(-97.28);

    expect(fixedMonthlyRegistrations
      .every(reg =>
        result.series[0].points
          .find(point => point.label === reg.date && point.value === reg.amount))).to.equal(true);
  });

});
