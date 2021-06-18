const app = require('../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const round = require('../../../src/util/math').round;
const avg = require('../../../src/util/array').avg;

const testLongLivedAccessTokenCustomerId2 = app.get('testLongLivedAccessTokenCustomerId2');
const fixtures = require('../../fixtures/models');

describe('targets/foodwaste endpoint', () => {

  describe('find', () => {
    it('should fetch total weight target for single customer', async () => {

      const res = await chakram.request('GET', '/targets/foodwaste?resource=total&dimension=weight&from=2019-12-01&to=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body).to.deep.equal([
        {
          customerId: '1',
          targetsTotal: 885714.29,
          targets: [
            {
              from: '2019-12-01',
              targetAmount: 885714.29,
              to: '2019-12-31'
            }
          ]
        }
      ]);
    });

    it('should fetch total cost target for multiple customers', async () => {

      const res = await chakram.request('GET', '/targets/foodwaste?resource=total&accounts=1,2&dimension=cost&from=2019-12-01&to=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body).to.deep.equal([
        {
          customerId: '1',
          targetsTotal: 885714.29,
          targets: [
            {
              from: '2019-12-01',
              targetAmount: 885714.29,
              to: '2019-12-31'
            }
          ]
        },
        {
          customerId: '2',
          targetsTotal: 885714.29,
          targets: [
            {
              from: '2019-12-01',
              targetAmount: 885714.29,
              to: '2019-12-31'
            }
          ]
        }
      ]);
    });

    it('should fetch per-guest weight target for multiple customers', async () => {

      await chakram.request('PATCH', '/settings/10001', {
        'headers': {
          'Authorization': 'Bearer ' + testLongLivedAccessTokenCustomerId2
        },
        'body': [
          {
            op: 'replace', path: '/current/expectedFoodwastePerGuest', value: [
              { from: '1970-01-01', amount: 60, unit: 'g', period: 'fixed' },
              { from: '2019-12-11', amount: 720, unit: 'g', period: 'fixed' },
            ]
          }
        ]
      });

      const res = await chakram.request('GET', '/targets/foodwaste?resource=perGuest&accounts=1,2&dimension=weight&from=2019-12-01&to=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      const { expectedFoodwastePerGuest: [{ amount: defaultAmount }] } = fixtures.createDefaultPerGuestTargets();
      const cu2CustomAmountNormalized = 720;

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.sort((a,b) => parseInt(a.customerId) - parseInt(b.customerId))).to.deep.equal([
        {
          customerId: '1',
          targetsTotal: round(defaultAmount, 2),
          targets: [
            {
              from: '2019-12-01',
              targetAmount: round(defaultAmount, 2),
              to: '2019-12-31'
            }
          ]
        },
        {
          customerId: '2',
          targetsTotal: round(avg([60, cu2CustomAmountNormalized]), 2),
          targets: [
            {
              from: '2019-12-01',
              targetAmount: round(60, 2),
              to: '2019-12-10'
            },
            {
              from: '2019-12-11',
              targetAmount: round(cu2CustomAmountNormalized, 2),
              to: '2019-12-31'
            }
          ]
        }
      ]);
    });

  });
});
