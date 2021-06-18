'use strict';

const app = require('../../../../../src/app').default;
const chai = require('chai');
const includeRegistrationPointsTest = require('../../../../../src/services/projects/hooks/include-registration-points').default;

const expect = chai.expect;

describe('Projects Service - include-registration-points hook', () => {

  it('Should skip when method is CREATE', () => {
    const mockHook = {
      type: 'before',
      method: 'create',
      app: app,
      params: {},
      data: {}
    };

    const resultHook = includeRegistrationPointsTest()(mockHook);
    expect('sequelize' in resultHook.params).to.equal(false);

  });

  it('Should skip when method is PATCH', () => {
    const mockHook = {
      type: 'before',
      method: 'patch',
      app: app,
      params: {},
      data: {}
    };

    const resultHook = includeRegistrationPointsTest()(mockHook);
    expect('sequelize' in resultHook.params).to.equal(false);

  });

  it('Should add include parameters when given GET or FIND method', () => {

    const mockHook = {
      type: 'before',
      method: 'get',
      app: { get: () => ({ models: { registration_point: 'registration_point_model'} }) },
      params: {},
      data: {}
    };


    const expectedParams = {
      sequelize: {
        raw: false,
        include: [{
          attributes: ['id', 'path', 'name'],
          model:'registration_point_model',
          through: { attributes: [] },
          as: 'registrationPoints'
        }]
      }
    };

    const resultHook = includeRegistrationPointsTest()(mockHook);
    expect(resultHook.params).to.deep.equal(expectedParams);

  });
});
