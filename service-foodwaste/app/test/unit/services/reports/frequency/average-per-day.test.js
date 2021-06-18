'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const sinon = require('sinon');
const RegistrationReportService = require('../../../../../src/services/reports/frequency/average-per-day').default;

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('Report Frequency Average Service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;

  beforeEach(() => {
    registrationQueryStub = sandbox.stub(sequelize.models.registration, 'findAll').resolves([]);
    service = new RegistrationReportService();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return array with 0s when no records', async () => {
    const result = await service.find({ query: { customerId: 1, date: { $gte: '2009-12-01', $lte: '2009-12-31' } } });
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series.length).equal(1);

    const points = result.series[0].points;
    const aggregates = result.series[0].aggregates;

    expect(points.length).equal(31);
    expect(points.every(point => point.value === 0)).equal(true);
    expect(aggregates).to.deep.equal({
      avg: 0, min: 0, max: 0, total: 0
    });
  });

  it('should return series when found records', async () => {
    registrationQueryStub.resolves([
      {
        date: '2009-12-01',
        customerId: '1',
        count: '120'
      },
      {
        date: '2009-12-05',
        customerId: '2',
        count: '100'
      },
      {
        date: '2009-12-31',
        customerId: '1',
        count: '90'
      }
    ]);
    const result = await service.find({ query: { customerId: [1,2], date: { $gte: '2009-12-01', $lte: '2009-12-31' } } });
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series.length).equal(1);
    expect(result.series[0].points.length).equal(31);
    expect(result.series[0].aggregates).to.deep.equal({
      min: 90, max: 120, avg: 103.33, total: 310
    });

  });

});
