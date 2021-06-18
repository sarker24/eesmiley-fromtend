'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const app = require('../../../../src/app').default;
const sinon = require('sinon');
const Service = require('../../../../src/services/targets/frequency').default;
chai.use(chaiHttp);
chai.use(chaiSubset);

const DOWS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const SingleCustomerSingleTarget = { customerId: 1, targets: [{ from: '1970-01-01', days: [DOWS.monday] }] };
const SingleCustomerMultipleTargets = {
  customerId: 1,
  targets: [
    { from: '1970-01-01', days: [DOWS.monday, DOWS.tuesday, DOWS.wednesday] },
    { from: '2019-12-12', days: [DOWS.friday] }
  ]
};

const MultipleCustomerMultipleTargets = [
  {
    customerId: 1, targets: [
      { from: '1970-01-01', days: [DOWS.monday] },
      { from: '2019-12-20', days: [DOWS.friday] }
    ]
  },
  { customerId: 2, targets: [{ from: '1970-01-01', days: [DOWS.tuesday], }] }
];

describe('Targets Frequency service', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let service;
  let targetQueryStub;

  beforeEach(() => {

    targetQueryStub = sandbox.stub(sequelize.models.settings, 'findAll');
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
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        }
      }
    });

    expect(result.length).to.equal(0);
  });

  it('should return correct target when customer has a single target defined', async () => {
    targetQueryStub.resolves([SingleCustomerSingleTarget]);

    const result = await service.find({
      query: {
        customerId: 1,
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        }
      }
    });

    const expectedResult = [{
      customerId: 1,
      targetsTotal: 5,
      targets: [{
        from: '2019-12-01',
        to: '2019-12-31',
        targetDOWs: { [DOWS.monday]: 5 }
      }]
    }];

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should return correct target when customer has multiple targets defined', async () => {
    targetQueryStub.resolves([SingleCustomerMultipleTargets]);

    const result = await service.find({
      query: {
        customerId: 1,
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        }
      }
    });

    const expectedResult = [{
      customerId: 1,
      targetsTotal: 9,
      targets: [
        {
          from: '2019-12-01',
          to: '2019-12-11',
          targetDOWs: {
            [DOWS.monday]: 2,
            [DOWS.tuesday]: 2,
            [DOWS.wednesday]: 2
          }
        },
        {
          from: '2019-12-12',
          to: '2019-12-31',
          targetDOWs: {
            [DOWS.friday]: 3
          }
        }
      ]
    }];

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should return correct target when customer has multiple targets defined and range is beyond all of them', async () => {
    targetQueryStub.resolves([SingleCustomerMultipleTargets]);

    const result = await service.find({
      query: {
        customerId: 1,
        date: {
          $gte: '2020-01-01',
          $lte: '2020-01-31'
        }
      }
    });

    const expectedResult = [{
      customerId: 1,
      targetsTotal: 5,
      targets: [{
        from: '2020-01-01',
        to: '2020-01-31',
        targetDOWs: {
          [DOWS.friday]: 5
        }
      }]
    }];

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(result.length).to.equal(1);
    expect(result).to.deep.equal(expectedResult);
  });

  it('should return correct target for multiple customers', async () => {
    targetQueryStub.resolves(MultipleCustomerMultipleTargets);

    const result = await service.find({
      query: {
        customerId: [1, 2],
        date: {
          $gte: '2019-12-01',
          $lte: '2019-12-31'
        }
      }
    });

    const expectedResult = [
      {
        customerId: 1,
        targetsTotal: 5,
        targets: [
          { from: '2019-12-01', to: '2019-12-19', targetDOWs: { [DOWS.monday]: 3 } },
          { from: '2019-12-20', to: '2019-12-31', targetDOWs: { [DOWS.friday]: 2 } },
        ]
      },
      {
        customerId: 2,
        targetsTotal: 5,
        targets: [
          { from: '2019-12-01', to: '2019-12-31', targetDOWs: { [DOWS.tuesday]: 5 } },
        ]
      }
    ];

    expect(targetQueryStub.calledOnce).to.equal(true);
    expect(result.length).to.equal(2);
    expect(result).to.deep.equal(expectedResult);
  });

});
