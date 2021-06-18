const app = require('../../src/app').default;
const commons = require('feathers-commons-esmiley');
const sinon = require('sinon');

const longLiveAccessToken = app.get('testLongLivedAccessToken');
const testLongLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');


describe('bootstrap-tasks endpoint', () => {
  const sandbox = sinon.createSandbox();
  let legacyResponse;

  beforeEach(() => {

    legacyResponse = {
      current: { dealId: '1', company: 'Customer 1' },
      children: [
        { dealId: '10558', company: '(1139)  Novo Nordisk JC' },
        { dealId: '10712', company: '(1195) Novo Nordisk DD' },
        { dealId: '10795', company: '(1379) KLP 5G' },
        { dealId: '11163', company: '(1337) Havneholmen Atrium ' },
        { dealId: '11167', company: '(1381) Bonnier Publications' },
        { dealId: '11179', company: '(1155) Novo Nordisk  Fritidscenter' },
        { dealId: '10240', company: "(1339) KLP Ørestad 5H " },
        { dealId: '10244', company: "(1122) Dong Asnæsværket" },
        { dealId: '10479', company: "(1190) Novo Nordisk EG" },
        { dealId: '10507', company: "(1191) Novo Nordisk DF" },
        { dealId: '10525', company: "(1194) Novo Nordisk HC" },
        { dealId: '10544', company: "(1189) Novo Nordisk AE" }
      ]
    };

    global.makeHttpRequestMock.resolves(legacyResponse);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should copy registration point data from given template', async () => {
    const beforePoints = await chakram.request('GET', '/registration-points', {
      headers: {
        authorization: 'Bearer ' + testLongLivedAccessTokenCustomerId2
      }
    });

    const taskResponse = await chakram.request('POST', '/bootstrap-tasks', {
      headers: {
        authorization: 'Bearer ' + testLongLivedAccessTokenCustomerId2
      },
      body: {
        templateId: 10000
      }
    });

    const afterPoints = await chakram.request('GET', '/registration-points', {
      headers: {
        authorization: 'Bearer ' + testLongLivedAccessTokenCustomerId2
      }
    });

    const settings = await chakram.request('GET', '/settings', {
      headers: {
        authorization: 'Bearer ' + testLongLivedAccessTokenCustomerId2
      }
    });

    expectChakram(taskResponse.response.statusCode).to.equal(204);
    expectChakram(beforePoints.body.length).to.equal(14);
    expectChakram(afterPoints.body.length).to.equal(87);
    expectChakram(settings.body.bootstrapTemplateId).to.equal(10000);
  });

  it('Should return 404 when given template is not found', async () => {
    const res = await chakram.request('POST', '/bootstrap-tasks', {
      headers: {
        authorization: 'Bearer ' + longLiveAccessToken
      },
      body: {
        templateId: 213209
      }
    });


    const settings = await chakram.request('GET', '/settings', {
      headers: {
        authorization: 'Bearer ' + testLongLivedAccessTokenCustomerId2
      }
    });

    expectChakram(res.response.statusCode).to.equal(404);
    expectChakram(settings.body.hasOwnProperty('bootstrapTemplateId')).to.equal(false);

  });
});
