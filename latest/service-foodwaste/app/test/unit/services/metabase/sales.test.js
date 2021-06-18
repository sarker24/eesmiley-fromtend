'use strict';

const app = require('../../../../src/app').default;
const MetabaseSales = require('../../../../src/services/metabase/sales').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('metabase service - metabase/sales', () => {
  const sandbox = sinon.createSandbox();
  const service = new MetabaseSales(app);
  const sequelize = app.get('sequelize');

  afterEach(() => {
    sandbox.restore();
  });

  it('should build a url when the accounts param is provided', async () => {
    const params = {
      query: {
        accounts: 1,
        from: '2017-01-01',
        to: '2017-12-31'
      }
    };

    sandbox.stub(sequelize.models.sale, 'findAll').returns(Promise.resolve({}));

    try {
      const result = await service.find(params);
      expect(result).to.have.property('url');
    } catch (err) {
      console.log(err);
      throw err;
    }
  });

  it('should build a url when the accounts param is NOT provided', async () => {
    const params = {
      query: {
        from: '2017-01-01',
        to: '2017-12-31',
        customerId: 1
      }
    };

    sandbox.stub(sequelize.models.sale, 'findAll').returns(Promise.resolve({}));

    try {
      const result = await service.find(params);
      expect(result).to.have.property('url');
    } catch (err) {
      console.log(err);
      throw err;
    }
  });
});
