'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const parseJsonResult = require('../../../src/hooks/parse-json-result').default;

describe('Hooks - add-old-model-type', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      result: {
        "createdAt": "2019-02-20 13:02:48",
        "updatedAt": "2019-02-20 13:02:48",
        "deletedAt": null,
        "id": "20952",
        "parentProductId": "717",
        "path": "717",
        "name": "Product1",
        "cost": 5000,
        "image": null,
        "userId": "333",
        "amount": 1000,
        "costPerkg": 5000,
        "customerId": "1",
        "active": true,
        "bootstrapKey": null,
        "oldModelId": null,
        "oldModelType": "product",
        "categoryId": null
      }
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should return parsed JSON, stripped of unneeded data', async () => {

    const hook = await parseJsonResult()(mockHook);
    expect(hook).to.deep.equal(mockHook);
  });

  it('Should return stringified JSON when the parsing fails', async () => {
    sandbox.stub(JSON, 'parse').throws(new Error());

    const hook = await parseJsonResult()(mockHook);
    expect(hook).to.deep.equal({
      result: "{\"createdAt\":\"2019-02-20 13:02:48\",\"updatedAt\":\"2019-02-20 13:02:48\",\"deletedAt\":null,\"id\":\"20952\",\"parentProductId\":\"717\",\"path\":\"717\",\"name\":\"Product1\",\"cost\":5000,\"image\":null,\"userId\":\"333\",\"amount\":1000,\"costPerkg\":5000,\"customerId\":\"1\",\"active\":true,\"bootstrapKey\":null,\"oldModelId\":null,\"oldModelType\":\"product\",\"categoryId\":null}"
    });
  });


});
