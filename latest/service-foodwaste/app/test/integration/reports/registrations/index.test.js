const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');

describe('report registrations', () => {

  it('should return valid response for authenticated customer', async () => {
    const res = await chakram.request('GET', '/reports/registrations?from=2000-01-01&to=2020-01-01&dimension=weight', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.every(registration => registration.customerId === '1')).to.equal(true);
  });

  it('should return valid response for top customers', async () => {
    // note ranking might change when changing dimension (cost - weight)
    const res = await chakram.request('GET', '/reports/registrations?accounts=top3&from=2000-01-01&to=2020-01-01&dimension=cost', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.some(registration => registration.customerId === '2')).to.equal(true);
    expectChakram(res.body.some(registration => registration.customerId === '1')).to.equal(true);
  });

  it('should return valid response for bottom customers when bottom accounts dont have registrations', async () => {
    const res = await chakram.request('GET', '/reports/registrations?accounts=bottom2&from=2000-01-01&to=2020-01-01&dimension=weight', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.equal(0)
  });

  it('should return valid response for bottom customers when some accounts have registrations', async () => {
    const res = await chakram.request('GET', '/reports/registrations?accounts=bottom3&from=2000-01-01&to=2020-01-01&dimension=weight', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.length).to.not.equal(0);
  });

});
