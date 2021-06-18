'use strict';

const app = require('../../../../src/app').default;
const MetabaseProjects = require('../../../../src/services/metabase/projects').default;
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('metabase service - metabase/projects', () => {
  const sandbox = sinon.createSandbox();
  const service = new MetabaseProjects(app);

  afterEach(() => {
    sandbox.restore();
  });

  it('should build a url when the accounts param is provided', async () => {
    const params = {
      query: {
        account: 1,
        id: 2
      }
    };

    service.find(params).then((result) => {
      expect(result).to.have.property('url');
    });
  });

  it('should build a url when the accounts param is NOT provided', async () => {
    const params = {
      query: {
        id: 2,
        customerId: 1
      }
    };

    service.find(params).then((result) => {
      expect(result).to.have.property('url');
    });
  });
});
