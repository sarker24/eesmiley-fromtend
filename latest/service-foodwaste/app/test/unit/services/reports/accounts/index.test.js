const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const sinon = require('sinon');
const app = require('../../../../../src/app').default;

const AccountService = require('../../../../../src/services/reports/accounts/index').default;
const REPORT_IDS = require('../../../../../src/services/reports/accounts/index').REPORT_IDS;

chai.use(chaiSubset);

describe('Accounts Report Service', () => {
  const sequelize = app.get('sequelize');
  const settingsService = app.service('/settings');
  const totalOverviewService = app.service('/reports/foodwaste-overview');
  const totalAccountService = app.service('/reports/foodwaste-per-account');

  const FixedRegisteredAccounts = { accounts: [{id: 1}, {id: 2}, {id: 3}] };
  const FixedTotalAmount = { amount: 2000 };
  const FixedSelectedAmount = { amount: 1200 };
  const FixedGuestAmount = { amount: 200 };

  const FixedOverviewResponse = {
    series: [{
      id: 'areas',
      unit: 'kg',
      aggregates: { total: 100 },
      series: [{
        id: 'area',
        name: 'area name',
        aggregates: { total: 100 },
        unit: 'kg',
        points: [{
          label: 'category name',
          value: 100
        }]
      }]
    }]
  };

  const FixedPerAccountsResponse = {
    series: [
      {
        id: 'accounts',
        unit: 'kg',
        aggregates: { total: FixedSelectedAmount.amount, avg: 600, min: 200, max: 1000  },
        points: [
          { label: 'account 1', value: 1000 },
          { label: 'account 2', value: 200 }
        ]
      }
      ],
    extra: { target: 1000 }
  };

  const sandbox = sinon.createSandbox();

  let service;
  let totalOverviewStub;
  let perGuestOverviewStub;
  let totalAccountStub;
  let perGuestAccountStub;
  let settingsStub;
  let totalAmountStub;
  let selectedAmountStub;
  let guestsStub;

  let params;

  beforeEach(() => {
    params = {
      query: {
        accountsQueryList: [
          { customerId: ['1'], name: 'mygroup1', registrationPointIds: [] }
        ],
        date: {
          $gte: '2000-01-01',
          $lte: '2001-01-01'
        },
        dimension: 'weight',
        resource: 'total'
      }
    };

    totalOverviewStub = sandbox.stub(totalOverviewService, 'find').resolves(FixedOverviewResponse);
    totalAccountStub = sandbox.stub(totalAccountService, 'find').resolves(FixedPerAccountsResponse);
    settingsStub = sandbox.stub(settingsService, 'find').resolves(FixedRegisteredAccounts);
    totalAmountStub = sandbox.stub(sequelize.models.registration, 'findAll').resolves(FixedTotalAmount);
    selectedAmountStub = sandbox.stub(sequelize, 'query').resolves(FixedSelectedAmount);
    guestsStub = sandbox.stub(sequelize.models.guest_registration, 'findAll').resolves(FixedGuestAmount);
    service = new AccountService();
    service.setup(app, '/dummy-accounts');

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return valid fw total series', async () => {
    const result = await service.find(params);
    expect(totalOverviewStub.calledOnce).to.equal(true);
    expect(totalAccountStub.calledOnce).to.equal(true);
    expect(result.series.length).to.equal(3);
    expect(result.series[0].id).to.equal(REPORT_IDS.areasGroups);
    expect(result.series[0].series.length).to.equal(1);
    expect(result.series[0].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[1].id).to.equal(REPORT_IDS.accountsGroups);
    expect(result.series[1].aggregates.avg).to.equal(600);
    expect(result.series[1].extra.target).to.equal(1000);
    expect(result.series[1].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
    expect(result.series[2].series.length).to.equal(2);
    expect(result.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
    expect(result.series[2].series[0].aggregates.total).to.equal(2000);
    expect(result.series[2].series[0].points).to.deep.equal([
      { label: 'mygroup1', value: 1200 },
      { label: 'Other', value: 800 }
    ]);
    expect(result.series[2].series[1].id).to.equal(REPORT_IDS.totalRatiosSeries);
    expect(result.series[2].series[1].aggregates.total).to.equal(100);
    expect(result.series[2].series[1].points).to.deep.equal([
      { label: 'mygroup1', value: 60 },
      { label: 'Other', value: 40 }
    ]);
  });

  it('should return valid fw per guest series', async () => {
    params.query.resource = 'perGuest';
    const result = await service.find(params);
    expect(totalOverviewStub.calledOnce).to.equal(true);
    expect(totalAccountStub.calledOnce).to.equal(true);
    expect(result.series.length).to.equal(3);
    expect(result.series[0].id).to.equal(REPORT_IDS.areasGroups);
    expect(result.series[0].series.length).to.equal(1);
    expect(result.series[0].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[1].aggregates.avg).to.equal(600);
    expect(result.series[1].extra.target).to.equal(1000);
    expect(result.series[1].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
    expect(result.series[2].series.length).to.equal(1);
    expect(result.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
    expect(result.series[2].series[0].points).to.deep.equal([
      { label: 'mygroup1', value: 600 }
    ]);
  });

  it('should return valid for multiple accounts', async () => {
    params.query.accountsQueryList = [
      { customerId: ['1','2'], registrationPointIds: ['1','2','3'], name: 'group1' },
      { customerId: ['top10'], registrationPointIds: [], name: 'top10' }
    ];

    selectedAmountStub.resolves({ amount: 600 });

    const result = await service.find(params);
    expect(result.series.length).to.equal(3);
    expect(result.series[0].id).to.equal(REPORT_IDS.areasGroups);
    expect(result.series[0].series.length).to.equal(2);
    expect(result.series[0].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[0].series[1].name).to.equal(params.query.accountsQueryList[1].name);
    expect(result.series[1].series.length).to.equal(2);
    expect(result.series[1].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[1].series[1].name).to.equal(params.query.accountsQueryList[1].name);
    expect(result.series[1].aggregates.avg).to.equal(600);
    expect(result.series[1].extra.target).to.equal(1000);
    expect(result.series[1].series[0].name).to.equal(params.query.accountsQueryList[0].name);
    expect(result.series[2].id).to.equal(REPORT_IDS.groupTotalsSeries);
    expect(result.series[2].series.length).to.equal(2);
    expect(result.series[2].series[0].id).to.equal(REPORT_IDS.totalAmountsSeries);
    expect(result.series[2].series[0].aggregates.total).to.equal(3200);
    expect(result.series[2].series[0].points).to.deep.equal([
      { label: 'group1', value: 1200 },
      { label: 'top10', value: 1200 },
      { label: 'Other', value: 800 }
    ]);
    expect(result.series[2].series[1].id).to.equal(REPORT_IDS.totalRatiosSeries);
    expect(result.series[2].series[1].aggregates.total).to.equal(100);
    expect(result.series[2].series[1].points).to.deep.equal([
      { label: 'group1', value: 37.5 },
      { label: 'top10', value: 37.5 },
      { label: 'Other', value: 25 }
    ]);
  });

});
