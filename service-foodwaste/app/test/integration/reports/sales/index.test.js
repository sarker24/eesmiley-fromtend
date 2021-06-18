const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');

describe('sales', () => {

  it('should return sale records for given query parameters', async () => {
    const res = await chakram.request('GET', '/reports/sales?from=2000-01-01&to=2020-01-01&accounts=1,2,3,4,5', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedResult = [
      {
        "date": "2017-05-05",
        "customerId": "1",
        "income": 8200,
        "portions": 431,
        "incomePerPortion": 19.03,
        "foodwasteCost": 0,
        "foodwasteAmount": 0,
        "foodwasteCostPerPortion": 0,
        "foodwasteAmountPerPortion": 0,
        "guests": 0,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 0
      },
      {
        "date": "2017-05-05",
        "customerId": "2",
        "income": 8200,
        "portions": 431,
        "incomePerPortion": 19.03,
        "foodwasteCost": 0,
        "foodwasteAmount": 0,
        "foodwasteCostPerPortion": 0,
        "foodwasteAmountPerPortion": 0,
        "guests": 315,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 26.03
      },
      {
        "date": "2017-05-12",
        "customerId": "1",
        "income": 10000,
        "portions": 45,
        "incomePerPortion": 222.22,
        "foodwasteCost": 0,
        "foodwasteAmount": 0,
        "foodwasteCostPerPortion": 0,
        "foodwasteAmountPerPortion": 0,
        "guests": 0,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 0
      },
      {
        "date": "2017-05-12",
        "customerId": "2",
        "income": 10000,
        "portions": 45,
        "incomePerPortion": 222.22,
        "foodwasteCost": 0,
        "foodwasteAmount": 0,
        "foodwasteCostPerPortion": 0,
        "foodwasteAmountPerPortion": 0,
        "guests": 45,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 222.22
      },
      {
        "date": "2017-06-01",
        "customerId": "1",
        "income": 23010,
        "portions": 38,
        "incomePerPortion": 605.53,
        "foodwasteCost": 10000,
        "foodwasteAmount": 3600,
        "foodwasteCostPerPortion": 263.16,
        "foodwasteAmountPerPortion": 94,
        "guests": 0,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 0
      },
      {
        "date": "2017-06-01",
        "customerId": "2",
        "income": 23010,
        "portions": 38,
        "incomePerPortion": 605.53,
        "foodwasteCost": 5000,
        "foodwasteAmount": 1800,
        "foodwasteCostPerPortion": 131.58,
        "foodwasteAmountPerPortion": 47,
        "guests": 42,
        "foodwasteCostPerGuest": 119.05,
        "foodwasteAmountPerGuest": 42,
        "incomePerGuest": 547.86
      },
      {
        "date": "2017-06-10",
        "customerId": "1",
        "income": 19420,
        "portions": 45,
        "incomePerPortion": 431.56,
        "foodwasteCost": 5000,
        "foodwasteAmount": 1800,
        "foodwasteCostPerPortion": 111.11,
        "foodwasteAmountPerPortion": 40,
        "guests": 0,
        "foodwasteCostPerGuest": 0,
        "foodwasteAmountPerGuest": 0,
        "incomePerGuest": 0
      },
      {
        "date": "2017-06-10",
        "customerId": "2",
        "income": 19420,
        "portions": 45,
        "incomePerPortion": 431.56,
        "foodwasteCost": 5000,
        "foodwasteAmount": 1800,
        "foodwasteCostPerPortion": 111.11,
        "foodwasteAmountPerPortion": 40,
        "guests": 45,
        "foodwasteCostPerGuest": 111.11,
        "foodwasteAmountPerGuest": 40,
        "incomePerGuest": 431.56
      }
    ];

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body).to.deep.equal(expectedResult);
  });
});
