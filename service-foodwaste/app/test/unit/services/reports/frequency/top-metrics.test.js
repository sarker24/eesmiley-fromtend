'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const sinon = require('sinon');
const topMetricModule = require('../../../../../src/services/reports/frequency/top-metrics');
const TopMetricService = topMetricModule.default;
const METRIC_IDS = topMetricModule.METRIC_IDS;

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Report Frequency Top Metrics Service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let rawQueryStub;
  let currentPeriodQuery;
  let previousPeriodQuery;
  const noRegistrationsResult = {
    avgRegistrationDaysPerWeek: 0,
    avgRegistrationsPerDay: 0
  };

  beforeEach(() => {
    rawQueryStub = sandbox.stub(sequelize, 'query');
    currentPeriodQuery = rawQueryStub.onFirstCall();
    previousPeriodQuery = rawQueryStub.onSecondCall();
    service = new TopMetricService();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return metrics with 0 values when no registration records', async () => {
    currentPeriodQuery.resolves(noRegistrationsResult);
    previousPeriodQuery.resolves(noRegistrationsResult);

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2009-12-01', $lte: '2009-12-31' } ,
        period: 'month'
      } });

    const expectedResult = {
      metrics: [
        {
        id: METRIC_IDS.avgRegistrationDaysPerWeek,
        point: 0,
        trend: 0,
        unit: null
      },
        {
          id: METRIC_IDS.avgRegistrationsPerDay,
          point: 0,
          trend: 0,
          unit: null
        }
      ]
    }

    expect(rawQueryStub.calledTwice).to.equal(true);
    expect(result).to.deep.equal(expectedResult);

  });

  it('should return metrics correct trend previous period is bigger', async () => {
    currentPeriodQuery.resolves({
      avgRegistrationDaysPerWeek: 3.5,
      avgRegistrationsPerDay: 1
    });

    previousPeriodQuery.resolves({
      avgRegistrationDaysPerWeek: 7,
      avgRegistrationsPerDay: 2
    });

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2009-12-01', $lte: '2009-12-31' } ,
        period: 'month'
      } });

    const expectedResult = {
      metrics: [
        {
          id: METRIC_IDS.avgRegistrationDaysPerWeek,
          point: 3.5,
          trend: -50,
          unit: null
        },
        {
          id: METRIC_IDS.avgRegistrationsPerDay,
          point: 1,
          trend: -50,
          unit: null
        }
      ]
    }

    expect(rawQueryStub.calledTwice).to.equal(true);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should return metrics correct trend previous period is smaller', async () => {
    currentPeriodQuery.resolves({
      avgRegistrationDaysPerWeek: 7,
      avgRegistrationsPerDay: 2
    });

    previousPeriodQuery.resolves({
      avgRegistrationDaysPerWeek: 3.5,
      avgRegistrationsPerDay: 1
    });

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2009-12-01', $lte: '2009-12-31' } ,
        period: 'month'
      } });

    const expectedResult = {
      metrics: [
        {
          id: METRIC_IDS.avgRegistrationDaysPerWeek,
          point: 7,
          trend: 100,
          unit: null
        },
        {
          id: METRIC_IDS.avgRegistrationsPerDay,
          point: 2,
          trend: 100,
          unit: null
        }
      ]
    }

    expect(rawQueryStub.calledTwice).to.equal(true);
    expect(result).to.deep.equal(expectedResult);
  });

});
