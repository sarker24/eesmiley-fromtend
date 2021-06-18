const app = require('../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

describe('targets/frequency endpoint', () => {

  describe('find', () => {
    it('should fetch target for single customer', async () => {

      const res = await chakram.request('GET', '/targets/frequency?from=2019-12-01&to=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body).to.deep.equal([{
        customerId: '1',
        targetsTotal: 14,
        targets: [
          {
            from: '2019-12-01',
            to: '2019-12-31',
            targetDOWs: { 1: 5, 2: 5, 3: 4 }
          }
        ]
      }]);
    });

    it('should fetch target for multiple customers', async () => {

      await chakram.request('PATCH', '/settings/10001', {
        headers: {
          'Authorization': 'Bearer ' + adminToken
        },
        body: [
          {
            op: 'replace',
            path: '/current/expectedFrequency',
            value: [{ from: '1970-01-01', days: [1, 6] }] // 1: mon, 6: sat
          }
        ]
      });

      const res = await chakram.request('GET', '/targets/frequency?accounts=1,2&from=2019-12-01&to=2019-12-31', {
        'headers': {
          'Authorization': 'Bearer ' + longLiveAccessToken
        }
      });

      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.sort((a, b) => parseInt(a.customerId) - parseInt(b.customerId))).to.deep.equal([
        {
          customerId: '1',
          targetsTotal: 14,
          targets: [
            {
              from: '2019-12-01',
              to: '2019-12-31',
              targetDOWs: { 1: 5, 2: 5, 3: 4 }
            }
          ]
        },
        {
          customerId: '2',
          targetsTotal: 9,
          targets: [
            {
              from: '2019-12-01',
              to: '2019-12-31',
              targetDOWs: { 1: 5, 6: 4 }
            }
          ]
        }
      ]);
    });

  });
});
