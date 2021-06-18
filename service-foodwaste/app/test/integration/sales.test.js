const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const longLivedAccessTokenCustomerAsInteger = app.get('testLongLivedAccessTokenCustomerAsInteger');
const longLivedAccessTokenNoCustomer = app.get('testLongLivedAccessTokenNoCustomer');

describe('sales endpoint', () => {

  it('should get all sales', () => {
    return chakram.request('GET', '/sales', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(5)
    });
  });

  it('should get a sale', () => {
    return chakram.request('GET', '/sales/10001', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    });
  });

  it('should be able to create a sale', () => {
    return chakram.request('POST', '/sales', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "userId": 1,
        "customerId": 1,
        "date": "2017-06-09",
        "income": 190980,
        "portions": 25,
        "portionPrice": 22,
        "guests": 15,
        "productionCost": 200,
        "productionWeight": 74
      }
    }).then((res) => {
      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2017-06-09');
      expectChakram(res.body.income).to.equal('190980');
      expectChakram(res.body.portions).to.equal(25);
      expectChakram(res.body.portionPrice).to.equal('22');
      expectChakram(res.body.guests).to.equal(15);
      expectChakram(res.body.productionCost).to.equal('200');
      expectChakram(res.body.productionWeight).to.equal(74);
    });
  });

  it('should be able to create a sale with only userId, customerId and date', () => {
    return chakram.request('POST', '/sales', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      'body': {
        "userId": 31608,
        "customerId": 1,
        "date": "2017-06-09"
      }
    }).then((res) => {
      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2017-06-09');
      expectChakram(res.body.income).to.equal('0');
      expectChakram(res.body.portions).to.equal(0);
      expectChakram(res.body.portionPrice).to.equal('0');
      expectChakram(res.body.guests).to.equal(0);
      expectChakram(res.body.productionCost).to.equal('0');
      expectChakram(res.body.productionWeight).to.equal(0);
    });
  });

  it('should get all sales if a JWT with customerID as integer is used', () => {
    return chakram.request('GET', '/sales', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      }
    }).then((res) => {
      expectChakram(res).to.have.status(200);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.length).to.equal(5)
    });
  });

  it('should be able to create a sale if a JWT with customerID as integer is used', () => {
    return chakram.request('POST', '/sales', {
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenCustomerAsInteger
      },
      'body': {
        "date": "2017-06-09",
        "income": 190980,
        "portions": 25,
        "portionPrice": 22,
        "guests": 15,
        "productionCost": 200,
        "productionWeight": 74
      }
    }).then((res) => {
      expectChakram(res).to.have.status(201);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.hasOwnProperty('id')).to.equal(true);
      expectChakram(res.body.date).to.equal('2017-06-09');
      expectChakram(res.body.income).to.equal('190980');
      expectChakram(res.body.portions).to.equal(25);
      expectChakram(res.body.portionPrice).to.equal('22');
      expectChakram(res.body.guests).to.equal(15);
      expectChakram(res.body.productionCost).to.equal('200');
      expectChakram(res.body.productionWeight).to.equal(74);
    });
  });

  it('Should fail creating a sale if no customerId is provided in accessToken payload', () => {
    return chakram.request('POST', '/sales', {
      'body': {
        "date": "2017-06-09",
        "income": 190980,
        "portions": 25,
        "portionPrice": 22,
        "guests": 15,
        "productionCost": 200,
        "productionWeight": 74
      },
      'headers': {
        'Authorization': 'Bearer ' + longLivedAccessTokenNoCustomer
      }
    }).then((res) => {
      expectChakram(res).to.have.status(401);
      expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
      expectChakram(res.body.errorCode).to.equal('E029');
    });
  });
});
