const app = require('../../src/app').default;
const testLongLivedAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');

describe('actions endpoint', function () {

  it('should get all actions', () => {
    return chakram.request('GET', '/actions', {
      'headers': {
        'Authorization': 'Bearer ' + testLongLivedAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(5);
    });
  });

  it('should find actions by name', () => {
    return chakram.request('GET', '/actions?name=Test', {
      'headers': {
        'Authorization': 'Bearer ' + testLongLivedAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(2);
    })
  });

  it('should find actions by name if a JWT with customerID as integer is used', () => {
    return chakram.request('GET', '/actions?name=Test', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(2);
    })
  });
});
