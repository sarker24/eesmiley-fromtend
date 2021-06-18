'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../src/app').default;
const avg = require('../../../../src/util/array').avg;
const sinon = require('sinon');
const Service = require('../../../../src/services/targets/foodwaste').default;
chai.use(chaiHttp);
chai.use(chaiSubset);

const SingleCustomerSingleWeeklyTarget = {
  customerId: 1,
  targets: [{ from: '1970-01-01', amount: 700, unit: 'g', period: 'week', amountNormalized: 700 / 7 }]
};
const SingleCustomerMultipleWeeklyTargets = {
  customerId: 1,
  targets: [
    { from: '1970-01-01', amount: 700, unit: 'g', period: 'week', amountNormalized: 700 / 7 },
    { from: '2019-12-01', amount: 1400, unit: 'g', period: 'week', amountNormalized: 1400 / 7 },
    { from: '2019-12-12', amount: 2800, unit: 'g', period: 'week', amountNormalized: 2800 / 7 }]
};
const MultipleCustomerMultipleWeeklyTargets = [
  {
    customerId: 1, targets: [
      { from: '1970-01-01', amount: 700, unit: 'g', period: 'week', amountNormalized: 700 / 7 },
      { from: '2019-12-12', amount: 2800, unit: 'g', period: 'week', amountNormalized: 2800 / 7 }
    ]
  },
  {
    customerId: 2, targets: [
      { from: '1970-01-01', amount: 70, unit: 'g', period: 'week', amountNormalized: 70 / 7 },
      { from: '2019-12-21', amount: 147, unit: 'g', period: 'week', amountNormalized: 147 / 7 }
    ]
  }
];
// in cost/gram
const CustomerCostMedian = { customerId: 1, medianCost: 25 };

describe('Targets Foodwaste service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let targetQueryStub;
  let medianQueryStub;
  let guestQueryStub;

  beforeEach(() => {

    medianQueryStub = sandbox.stub(sequelize.models.registration_point, 'findAll').resolves([]);
    targetQueryStub = sandbox.stub(sequelize.models.settings, 'findAll').resolves([]);
    service = new Service();
    service.setup(app, 'dummy-route');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return empty array when targets are not defined in settings', async () => {
    targetQueryStub.resolves([]);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        date: {
          $gte: '2019-01-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    expect(result.length).to.equal(0);
  });

  it('should return total amounts in weight dimension when a customer has a single target defined for given time range', async () => {
    const targetSettingsQueryResult = [{
      ...SingleCustomerSingleWeeklyTarget,
      targets: JSON.stringify(SingleCustomerSingleWeeklyTarget.targets)
    }]
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        date: {
          $gte: '2019-01-01',
          $lte: '2019-01-31'
        },
        resource: 'total'
      }
    });

    const expectedWeightTarget = (SingleCustomerSingleWeeklyTarget.targets[0].amountNormalized) * 31;

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(false);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal([{
      customerId: SingleCustomerSingleWeeklyTarget.customerId,
      targetsTotal: expectedWeightTarget,
      targets: [{
        from: '2019-01-01',
        to: '2019-01-31',
        targetAmount: 3100
      }]
    }]);
  });

  it('should return total amounts in weigh dimension when a customer has multiple targets defined for given time range', async () => {
    const targetSettingsQueryResult = [{
      ...SingleCustomerMultipleWeeklyTargets,
      targets: JSON.stringify(SingleCustomerMultipleWeeklyTargets.targets)
    }]
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        date: {
          $gte: '2019-11-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    const expectedWeightTarget0 = (SingleCustomerMultipleWeeklyTargets.targets[0].amountNormalized) * 30;
    const expectedWeightTarget1 = (SingleCustomerMultipleWeeklyTargets.targets[1].amountNormalized) * 11;
    const expectedWeightTarget2 = (SingleCustomerMultipleWeeklyTargets.targets[2].amountNormalized) * 20;

    const expectedWeightTarget = expectedWeightTarget0 + expectedWeightTarget1 + expectedWeightTarget2;

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(false);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal([{
      customerId: SingleCustomerSingleWeeklyTarget.customerId,
      targetsTotal: expectedWeightTarget,
      targets: [
        {
          from: '2019-11-01',
          to: '2019-11-30',
          targetAmount: 3000
        },
        {
          from: '2019-12-01',
          to: '2019-12-11',
          targetAmount: 2200
        },
        {
          from: '2019-12-12',
          to: '2019-12-31',
          targetAmount: 8000
        }
      ]
    }]);
  });

  it('should return total amounts in weight dimension when a customer has multiple targets defined and given time range is beyond all of them', async () => {
    const targetSettingsQueryResult = [{
      ...SingleCustomerMultipleWeeklyTargets,
      targets: JSON.stringify(SingleCustomerMultipleWeeklyTargets.targets)
    }]
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'weight',
        date: {
          $gte: '2020-01-01',
          $lte: '2020-01-31'
        },
        resource: 'total'
      }
    });

    const expectedWeightTarget = (SingleCustomerMultipleWeeklyTargets.targets[2].amountNormalized) * 31;

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(false);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal([{
      customerId: SingleCustomerSingleWeeklyTarget.customerId,
      targetsTotal: expectedWeightTarget,
      targets: [
        {
          from: '2020-01-01',
          to: '2020-01-31',
          targetAmount: 12400
        }
      ]
    }]);
  });

  it('should return total amounts in weight dimension for multiple customers', async () => {
    const targetSettingsQueryResult = MultipleCustomerMultipleWeeklyTargets.map(target => ({
      ...target,
      targets: JSON.stringify(target.targets)
    }));
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: [1, 2],
        dimension: 'weight',
        date: {
          $gte: '2019-11-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    const expectedCustomer1Target = (MultipleCustomerMultipleWeeklyTargets[0].targets[0].amountNormalized) * 41 + (MultipleCustomerMultipleWeeklyTargets[0].targets[1].amountNormalized) * 20;
    const expectedCustomer2Target = (MultipleCustomerMultipleWeeklyTargets[1].targets[0].amountNormalized) * 50 + (MultipleCustomerMultipleWeeklyTargets[1].targets[1].amountNormalized) * 11;

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(false);
    expect(result.length).to.equal(2);
    expect(result).to.deep.equal([
      {
        customerId: MultipleCustomerMultipleWeeklyTargets[0].customerId,
        targetsTotal: expectedCustomer1Target,
        targets: [
          {
            from: '2019-11-01',
            to: '2019-12-11',
            targetAmount: 4100
          },
          {
            from: '2019-12-12',
            to: '2019-12-31',
            targetAmount: 8000
          }
        ]
      },
      {
        customerId: MultipleCustomerMultipleWeeklyTargets[1].customerId,
        targetsTotal: expectedCustomer2Target,
        targets: [
          {
            from: '2019-11-01',
            to: '2019-12-20',
            targetAmount: 500
          },
          {
            from: '2019-12-21',
            to: '2019-12-31',
            targetAmount: 231
          }
        ]
      }
    ]);
  });

  it('should return empty array in cost dimension when a customer has not defined cost_per_kg for any registration point', async () => {
    const targetSettingsQueryResult = [{
      ...SingleCustomerSingleWeeklyTarget,
      targets: JSON.stringify(SingleCustomerSingleWeeklyTarget.targets)
    }]
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'cost',
        date: {
          $gte: '2019-01-01',
          $lte: '2019-01-31'
        },
        resource: 'total'
      }
    });

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.calledOnce).to.equal(true);
    expect(result.length).to.equal(0);
  });

  it('should return total amounts in cost dimension when a customer has multiple targets defined', async () => {
    const targetSettingsQueryResult = [{
      ...SingleCustomerMultipleWeeklyTargets,
      targets: JSON.stringify(SingleCustomerMultipleWeeklyTargets.targets)
    }]
    targetQueryStub.resolves(targetSettingsQueryResult);
    medianQueryStub.resolves([CustomerCostMedian]);

    const result = await service.find({
      query: {
        customerId: 1,
        dimension: 'cost',
        date: {
          $gte: '2019-11-01',
          $lte: '2019-12-31'
        },
        resource: 'total'
      }
    });

    const expectedWeightTarget0 = (SingleCustomerMultipleWeeklyTargets.targets[0].amountNormalized) * 30;
    const expectedWeightTarget1 = (SingleCustomerMultipleWeeklyTargets.targets[1].amountNormalized) * 11;
    const expectedWeightTarget2 = (SingleCustomerMultipleWeeklyTargets.targets[2].amountNormalized) * 20;

    const expectedWeightTarget = expectedWeightTarget0 + expectedWeightTarget1 + expectedWeightTarget2;
    const expectedCostTarget = expectedWeightTarget * CustomerCostMedian.medianCost;

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(true);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal([{
      customerId: SingleCustomerSingleWeeklyTarget.customerId,
      targetsTotal: expectedCostTarget,
      targets: [
        {
          from: '2019-11-01',
          to: '2019-11-30',
          targetAmount: 75000
        },
        {
          from: '2019-12-01',
          to: '2019-12-11',
          targetAmount: 55000
        },
        {
          from: '2019-12-12',
          to: '2019-12-31',
          targetAmount: 200000
        }
      ]
    }]);
  });

  it('should return per guest amounts in weight dimension for multiple customers', async () => {
    const targetSettingsQueryResult = MultipleCustomerMultipleWeeklyTargets.map(target => ({
      ...target,
      targets: JSON.stringify(target.targets.map(target => ({ ...target, period: 'fixed' })))
    }));
    targetQueryStub.resolves(targetSettingsQueryResult);

    const result = await service.find({
      query: {
        customerId: [1, 2],
        dimension: 'weight',
        date: {
          $gte: '2019-11-01',
          $lte: '2019-12-31'
        },
        resource: 'perGuest'
      }
    });

    const expectedCustomer1Target = avg([MultipleCustomerMultipleWeeklyTargets[0].targets[0].amountNormalized, MultipleCustomerMultipleWeeklyTargets[0].targets[1].amountNormalized]);
    const expectedCustomer2Target = avg([MultipleCustomerMultipleWeeklyTargets[1].targets[0].amountNormalized, MultipleCustomerMultipleWeeklyTargets[1].targets[1].amountNormalized]);

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(medianQueryStub.called).to.equal(false);
    expect(result.length).to.equal(2);
    expect(result).to.deep.equal([
      {
        customerId: MultipleCustomerMultipleWeeklyTargets[0].customerId,
        targetsTotal: expectedCustomer1Target,
        targets: [
          {
            from: '2019-11-01',
            to: '2019-12-11',
            targetAmount: 100
          },
          {
            from: '2019-12-12',
            to: '2019-12-31',
            targetAmount: 400
          }
        ]
      },
      {
        customerId: MultipleCustomerMultipleWeeklyTargets[1].customerId,
        targetsTotal: expectedCustomer2Target,
        targets: [
          {
            from: '2019-11-01',
            to: '2019-12-20',
            targetAmount: 10
          },
          {
            from: '2019-12-21',
            to: '2019-12-31',
            targetAmount: 21
          }
        ]
      }
    ]);
  });

});
