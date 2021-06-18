'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../../../src/app').default;
const sinon = require('sinon');
const FoodwasteOverviewService = require('../../../../../../src/services/reports/foodwaste/overview').default;
const totalQueries = require('../../../../../../src/services/reports/foodwaste/util/total-queries');
const perGuestQueries = require('../../../../../../src/services/reports/foodwaste/util/per-guest-queries');
const SortOrder = require('../../../../../../src/util/constants').SortOrder;

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Foodwaste Overview Service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;

  beforeEach(() => {
    sandbox.stub(totalQueries, 'overviewQuery').returns('');
    sandbox.stub(perGuestQueries, 'overviewQuery').returns('');
    registrationQueryStub = sandbox.stub(sequelize, 'query').resolves([{
      name: 'area',
      total: 100,
      avg: 100,
      min: 100,
      max: 100,
      categories: [{ name: null, amount: 100 }]
    }]);
    service = new FoodwasteOverviewService();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0 values when no data exist', async () => {
    registrationQueryStub.resolves([]);

    const result = await service.find({
      query: {
        order: SortOrder.desc,
        registrationPointIds: [],
        customerId: 1,
        unit: 'kg',
        date: { $gte: '2000-01-01', $lte: '2010-01-01' },
        resource: 'total'
      }
    });
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series.length).to.equal(2);
    expect(result.series[0].id).to.equal('foodwasteOverviewByAreas');
    expect(result.series[0].unit).to.equal('kg');
    expect(result.series[0].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0 });
    expect(result.series[0].series.length).to.equal(0);

    expect(result.series[1].id).to.equal('foodwasteOverviewAreaRatios');
    expect(result.series[1].unit).to.equal('%');
    expect(result.series[1].aggregates).to.deep.equal({ total: 0, avg: 0, min: 0, max: 0 });
    expect(result.series[1].points.length).to.equal(0);
  });

  it('should return total amounts for multiple records', async () => {
    registrationQueryStub.resolves([
      {
        name: 'area1',
        total: 220,
        avg: 73.3333,
        min: 45,
        max: 125,
        categories: [
          {
            name: 'category 1',
            amount: 125
          }, {
            name: 'category 2',
            amount: 50
          },
          {
            name: 'category 3',
            amount: 45
          }
        ]
      }, {
        name: 'area2',
        total: 250,
        avg: 125.00,
        min: 100,
        max: 150,
        categories: [
          {
            name: 'category 1',
            amount: 150
          }, {
            name: null,
            amount: 100
          }
        ]
      },
    ]);

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: 1,
        unit: 'kg',
        date: { $gte: '2000-01-01', $lte: '2010-01-01' },
        resource: 'total'
      }
    });

    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series.length).to.equal(2);
    expect(result.series[0].id).to.equal('foodwasteOverviewByAreas');
    expect(result.series[0].aggregates).to.deep.equal({
      avg: 235,
      max: 250,
      min: 220,
      total: 470
    });
    expect(result.series[0].series.length).to.equal(2);
  });

  it('should return per guest amounts for multiple records', async () => {
    registrationQueryStub.resolves([
      {
        name: 'area1',
        total: 220,
        avg: 73.3333,
        min: 45,
        max: 125,
        categories: [
          {
            name: 'category 1',
            amount: 125
          }, {
            name: 'category 2',
            amount: 50
          },
          {
            name: 'category 3',
            amount: 45
          }
        ]
      }, {
        name: 'area2',
        total: 250,
        avg: 125.00,
        min: 100,
        max: 150,
        categories: [
          {
            name: 'category 1',
            amount: 150
          }, {
            name: null,
            amount: 100
          }
        ]
      },
    ]);

    const result = await service.find({
      query: {
        registrationPointIds: [],
        customerId: 1,
        unit: 'kg',
        date: { $gte: '2000-01-01', $lte: '2010-01-01' },
        resource: 'perGuest'
      }
    });

    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series.length).to.equal(2);
    expect(result.series[0].id).to.equal('foodwastePerGuestOverviewByAreas');
    expect(result.series[0].aggregates).to.deep.equal({
      avg: 235,
      max: 250,
      min: 220,
      total: 470
    });
    expect(result.series[0].series.length).to.equal(2);
  });

});
