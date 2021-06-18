'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const moment = require('moment');
const app = require('../../../../../../src/app').default;
const sinon = require('sinon');
const totalQueries = require('../../../../../../src/services/reports/foodwaste/util/total-queries');
const perGuestQueries = require('../../../../../../src/services/reports/foodwaste/util/per-guest-queries');

const Service = require('../../../../../../src/services/reports/foodwaste/per-account').default;
const SortOrder = require('../../../../../../src/util/constants').SortOrder;

chai.use(chaiHttp);
chai.use(chaiSubset);

const CustomerCostMedians = { 1: 25, 2: 10 };
const FixedExpectedWeightPerDay = 100;

describe('Foodwaste Per Account Service', () => {
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

    registrationQueryStub = sandbox.stub(sequelize, 'query').resolves([]);
    sandbox.stub(totalQueries, 'perAccountQuery').resolves('');
    sandbox.stub(perGuestQueries, 'perAccountQuery').resolves('');
    service = new Service();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0 when no data exist', async () => {
    targetServiceStub.resolves([]);
    registrationQueryStub.resolves([{ customerId: 1, name: '1', total: 0}]);
    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        unit: 'kg',
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        },
        order: SortOrder.desc,
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.series.length).to.equal(1);
    expect(result.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0 });
    expect(result.series[0].points).to.deep.equal([{ label: '1', value: 0 }]);
    expect(result.extra.target).to.equal(0);
  });

  it('should return correct total amounts for single customer', async () => {
    registrationQueryStub.resolves([{ customerId: 1, name: 'Customer 1', total: 2500 }]);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        unit: 'kg',
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.series[0].points.length).to.equal(1);
    expect(result.series[0].aggregates.total).to.equal(2500);
    expect(result.series[0].points[0]).to.deep.equal({ label: 'Customer 1', value: 2500 });
    expect(result.extra.target).to.equal(FixedExpectedWeightPerDay * 31);
  });

  it('should return total costs for single customer', async () => {
    registrationQueryStub.resolves([{ customerId: 1, name: 'Customer 1', total: 3200 }]);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'cost',
        unit: 'DKK',
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.series[0].points.length).to.equal(1);
    expect(result.series[0].aggregates.total).to.equal(3200);
    expect(result.series[0].points[0]).to.deep.equal({ label: 'Customer 1', value: 3200 });
    expect(result.extra.target).to.equal(FixedExpectedWeightPerDay * 31 * CustomerCostMedians[1]);

  });

  it('should return total amounts for multiple customers', async () => {
    registrationQueryStub.resolves([
      { customerId: 1, name: 'Customer 1', total: 2000 },
      { customerId: 2, name: 'Customer 2', total: 4000 },
    ]);

    const result = await service.find({
      query: {
        customerId: [1,2],
        dimension: 'weight',
        unit: 'kg',
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.series[0].aggregates.total).to.equal(2000 + 4000);
    expect(result.series[0].points.length).to.equal(2);
    expect(result.series[0].points).to.deep.equal([{ label: 'Customer 1', value: 2000 }, { label: 'Customer 2', value: 4000 }]);
    expect(result.extra.target).to.equal(FixedExpectedWeightPerDay * 31);
  });

  it('should return per-guest amounts for multiple customers', async () => {
    registrationQueryStub.resolves([
      { customerId: 1, name: 'Customer 1', total: 2000 },
      { customerId: 2, name: 'Customer 2', total: 4000 },
    ]);

    const result = await service.find({
      query: {
        customerId: [1,2],
        dimension: 'weight',
        unit: 'kg',
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        },
        resource: 'per-guest'
      }
    });

    expect(registrationQueryStub.calledOnce).to.equal(true);
    expect(targetServiceStub.calledOnce).to.equal(true);
    expect(result.series[0].aggregates.total).to.equal(2000 + 4000);
    expect(result.series[0].points.length).to.equal(2);
    expect(result.series[0].points).to.deep.equal([{ label: 'Customer 1', value: 2000 }, { label: 'Customer 2', value: 4000 }]);
    expect(result.extra.target).to.equal(FixedExpectedWeightPerDay * 31);
  });

});
