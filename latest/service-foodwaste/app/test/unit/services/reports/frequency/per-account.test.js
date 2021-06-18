'use strict';

const round = require('../../../../../src/util/math').round;
const avg = require('../../../../../src/util/array').avg;

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../../src/app').default;
const sinon = require('sinon');
const RegistrationReportService = require('../../../../../src/services/reports/frequency/per-account').default;
const SortOrder = require('../../../../../src/util/constants').SortOrder;

chai.use(chaiHttp);
chai.use(chaiSubset);

const NoTargetSettings = [];

const createSettingsResult = (customerTargets) =>
  customerTargets.map(customerTarget => ({
    customerId: customerTarget.customerId,
    targets: customerTarget.targets
  }));

describe('Report Frequency Per Account Service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let registrationQueryStub;
  let settingsQueryStub;

  beforeEach(() => {
    registrationQueryStub = sandbox.stub(sequelize.models.registration, 'findAll');
    settingsQueryStub = sandbox.stub(sequelize.models.settings, 'findAll');
    service = new RegistrationReportService();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return 0% onTarget, 0% onOther when no settings nor registration records', async () => {
    settingsQueryStub.resolves(createSettingsResult([{ customerId: 1, targets: NoTargetSettings }]));
    registrationQueryStub.resolves([]);

    const result = await service.find({ query: { customerId: 1, date: { $gte: '2019-01-01', $lte: '2020-01-01' } } });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(0);
    expect(result.series[0].aggregates.min).to.equal(0);
    expect(result.series[0].aggregates.max).to.equal(0);

    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.extra.target).to.equal(0);
  });

  it('should return 0% onTarget, 0% onOther when settings but no registration records', async () => {
    settingsQueryStub.resolves(createSettingsResult([
      { customerId: 1, targets: [{ from: '1970-01-01', days: [1, 3, 5] }] }
    ]));
    registrationQueryStub.resolves([]);

    const totalTargetDays = 157;
    const totalDaysInRange = 366;

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2019-01-01', $lte: '2020-01-01' },
        order: SortOrder.desc
      }
    });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(0);
    expect(result.series[0].aggregates.min).to.equal(0);
    expect(result.series[0].aggregates.max).to.equal(0);

    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.extra.target).to.equal(round(100 * totalTargetDays / totalDaysInRange));
  });

  it('should return 0% onTarget, nonzero for onOther when registrations but no settings records', async () => {
    const registrationRecords = [
      { customerId: 1, date: '2019-04-01', dow: 1, count: 3 },
      { customerId: 1, date: '2019-12-01', dow: 6, count: 6 }
    ];

    settingsQueryStub.resolves(createSettingsResult([{ customerId: 1, targets: NoTargetSettings }]));
    registrationQueryStub.resolves(registrationRecords);

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2019-01-01', $lte: '2020-01-01' },
        order: SortOrder.desc
      }
    });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(round(100 * registrationRecords.length / 366));
    expect(result.series[0].aggregates.min).to.equal(round(100 * registrationRecords.length / 366));
    expect(result.series[0].aggregates.max).to.equal(round(100 * registrationRecords.length / 366));

    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([{
      label: '1',
      value: round(100 * registrationRecords.length / 366)
    }]);

    expect(result.extra.target).to.equal(0);
  });

  it('should return nonzero onTarget, 0% onOther when all registrations on target days', async () => {
    const registrationRecords = [
      { customerId: 1, date: '2019-04-01', dow: 1, count: 3 },
      { customerId: 1, date: '2019-12-01', dow: 6, count: 6 }
    ];

    settingsQueryStub.resolves(createSettingsResult([
      { customerId: 1, targets: [{ from: '1970-01-01', days: [1] }, { from: '2019-12-01', days: [6] }] }
    ]));

    registrationQueryStub.resolves(registrationRecords);

    const totalTargetDaysInRange = 51;
    const totalDaysInRange = 366;

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2019-01-01', $lte: '2020-01-01' },
        order: SortOrder.desc
      }
    });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(round(100 * registrationRecords.length / 366));
    expect(result.series[0].aggregates.min).to.equal(round(100 * registrationRecords.length / 366));
    expect(result.series[0].aggregates.max).to.equal(round(100 * registrationRecords.length / 366));
    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([{
      label: '1',
      value: round(100 * registrationRecords.length / totalDaysInRange)
    }]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([{ label: '1', value: 0 }]);

    expect(result.extra.target).to.equal(round(100 * totalTargetDaysInRange / 366, 2));
  });

  it('should return nonzero onTarget, nonzero onOther when some registrations are on other days', async () => {
    const registrationRecords = [
      { customerId: 1, date: '2019-04-01', dow: 1, count: 3 },
      { customerId: 1, date: '2019-04-02', dow: 2, count: 1 },
      { customerId: 1, date: '2019-12-07', dow: 6, count: 2 },
      { customerId: 1, date: '2019-12-31', dow: 2, count: 1 },
    ];

    settingsQueryStub.resolves(createSettingsResult([
      { customerId: 1, targets: [{ from: '1970-01-01', days: [1] }, { from: '2019-12-01', days: [6] }] }
    ]));

    registrationQueryStub.resolves(registrationRecords);

    const totalTargetDaysInRange = 51;
    const totalDaysInRange = 366;

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2019-01-01', $lte: '2020-01-01' },
        order: SortOrder.desc
      }
    });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(round(100 * registrationRecords.length / totalDaysInRange));
    expect(result.series[0].aggregates.min).to.equal(round(100 * registrationRecords.length / totalDaysInRange));
    expect(result.series[0].aggregates.max).to.equal(round(100 * registrationRecords.length / totalDaysInRange));
    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([{
      label: '1',
      value: round(100 * 2 / totalDaysInRange)
    }]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([{
      label: '1',
      value: round(100 * 2 / totalDaysInRange)
    }]);

    expect(result.extra.target).to.equal(round(100 * totalTargetDaysInRange / totalDaysInRange, 2));
  });

  it('should return correct aggregate min, max when multiple customers', async () => {
    const registrationRecords = [
      { customerId: 1, date: '2019-04-01', dow: 1, count: 3 },
      { customerId: 1, date: '2019-04-02', dow: 2, count: 1 },
      { customerId: 1, date: '2019-12-07', dow: 6, count: 2 },
      { customerId: 2, date: '2019-12-31', dow: 2, count: 1 },
    ];

    settingsQueryStub.resolves(createSettingsResult([
      { customerId: 1, targets: [{ from: '1970-01-01', days: [1] }, { from: '2019-12-01', days: [6] }] },
      { customerId: 2, targets: [{ from: '1970-01-01', days: [1, 6] }] }
    ]));

    registrationQueryStub.resolves(registrationRecords);

    const totalDaysInRange = 366;
    const customer1TargetDaysInRange = 51;
    const customer2TargetDaysInRange = 104;

    const result = await service.find({
      query: {
        customerId: 1,
        date: { $gte: '2019-01-01', $lte: '2020-01-01' },
        order: SortOrder.desc
      }
    });
    expect(settingsQueryStub.calledOnce).equal(true);
    expect(registrationQueryStub.calledOnce).equal(true);
    expect(result.series[0].aggregates.avg).to.equal(round(avg([(100 * 3 / totalDaysInRange), (100 * 1 / totalDaysInRange)])));
    expect(result.series[0].aggregates.min).to.equal(round(100 * 1 / totalDaysInRange));
    expect(result.series[0].aggregates.max).to.equal(round(100 * 3 / totalDaysInRange));
    expect(result.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expect(result.series[0].series[0].unit).to.equal('%');
    expect(result.series[0].series[0].points).to.deep.equal([
      {
        label: '1',
        value: round(100 * 2 / totalDaysInRange)
      },
      {
        label: '2',
        value: 0
      }
    ]);

    expect(result.series[0].series[1].id).to.equal('frequencyOnOtherDays');
    expect(result.series[0].series[1].unit).to.equal('%');
    expect(result.series[0].series[1].points).to.deep.equal([
      {
        label: '1',
        value: round(100 * 1 / totalDaysInRange)
      },
      {
        label: '2',
        value: round(100 * 1 / totalDaysInRange)
      }
    ]);

    expect(result.extra.target).to.equal(round(100 * (customer1TargetDaysInRange + customer2TargetDaysInRange) / (2 * 366), 2));
  });

});
