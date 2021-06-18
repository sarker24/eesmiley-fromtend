const round = require('../../src/util/math').round;
const sum = require('../../src/util/array').sum;

const app = require('../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');

async function createGuestRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount } = dateAmount;
    await chakram.request('POST', '/guest-registrations', {
      headers: {
        Authorization: 'Bearer ' + longLiveAccessToken
      },
      body: {
        customerId: 1,
        userId: 1,
        date,
        amount
      }
    });
  }
}

async function createRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, userId = 1, customerId = 1, registrationPointId = 10070 } = dateAmount;
    await chakram.request('POST', '/registrations', {
      headers: {
        Authorization: 'Bearer ' + adminToken
      },
      body: {
        customerId,
        userId,
        date,
        amount,
        registrationPointId,
        'currency': 'DKK',
        'kgPerLiter': 150,
        'unit': 'kg',
        'manual': true,
        'scale': true
      }
    });
  }
}

async function createRegistrationPoints(points) {
  const promises = points.map(point => {
    const {
      cost = 1000,
      name,
      label = 'product',
      path = null,
      parentId = null,
      image = null,
      active = true,
      co2Perkg = 0,
      customerId = 1,
      userId = 1
    } = point;
    return chakram.request('POST', '/registration-points',
      {
        headers: {
          'Authorization': 'Bearer ' + adminToken
        },
        body: {
          customerId,
          userId,
          name,
          cost,
          active,
          image,
          label,
          path,
          parentId,
          co2Perkg
        }
      });
  });

  const responses = await Promise.all(promises);
  return responses.map(response => response.body);
}

describe('dashboard', () => {

  it('should return valid response with 0 amounts when no data exist', async () => {

    const res = await chakram.request('GET', '/dashboard?accounts=5&from=2019-12-01&to=2019-12-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.metrics.every(metric => metric.point.value === 0))
  });

  it('should return correct metrics', async () => {
    const reso = await chakram.request('POST', '/settings', {
      'body': {
        "settings": {
          "expectedFrequency": [{ "from": "1970-01-01", days: [1, 2, 3, 4] }],
          "expectedFoodwaste": [{ "from": "1970-01-01", "amount": 1200, period: "day" }],
          "expectedFoodwastePerGuest": [{ "from": "1970-01-01", "amount": 20, period: "fixed" }],
          "perGuestBaseline": [{ "from": "1970-01-01", "amount": 60, period: "fixed" }],
          "perGuestStandard": [{ "from": "1970-01-01", "amount": 10, period: "fixed" }],
          "currency": "DKK"
        }
      },
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const pointData = [
      { name: 'area1', label: 'area', co2Perkg: 400 },
      { name: 'area2', label: 'area', co2Perkg: 800 },
      { name: 'area3', label: 'area', co2Perkg: 1200 },
      { name: 'area4', label: 'area', co2Perkg: 500 },
    ];

    const points = await createRegistrationPoints(pointData);
    const guests = [
      { date: '2020-01-01', amount: 25 },
      { date: '2020-01-02', amount: 20 },
      { date: '2020-01-03', amount: 20 },
      { date: '2020-01-03', amount: 20 }
    ];

    const registrations = points.map((point, index) => ({
      date: `2020-01-0${index + 1}`, amount: 8000 * (index + 1), registrationPointId: point.id
    }));

    await createGuestRegistrations(guests);
    await createRegistrations(registrations);

    const res = await chakram.request('GET', '/dashboard?accounts=1&from=2020-01-01&to=2020-01-31', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const expectedCo2 = sum(points.map((p, i) => (registrations[i].amount / 1000) * p.co2Perkg));

    const expectedById = {
      'registration_frequency': {
        point: { value: 2 },
        target: { value: 18 },
        trend: round(2 / 18)
      },
      'total_waste': {
        point: { unit: 'g', value: 80000 },
        target: { unit: 'g', value: 1200 * 31 },
        trend: round(100 * ((80000 - 1200 * 31) / (1200 * 31)))
      },
      'per_guest_waste': {
        point: { unit: 'g', value: 1230.77 },
        target: { unit: 'g', value: 20 },
        trend: round(100 * ((1230.77 - 20) / (20)))
      },
      'per_guest_saved': {
        point: { unit: 'g', value: round((60) - 1230.77) },
        target: { unit: 'g', value: 60 },
        trend: round(100 * ((1230.77 - 60) / (60)))
      },
      'per_guest_avoidable': {
        point: { unit: 'g', value: round((10) - 1230.77) },
        target: { unit: 'g', value: 10 },
        trend: round(100 * ((1230.77 - 10) / (10)))
      },
      'co2_waste': {
        point: { unit: 'g', value: expectedCo2 },
        trend: 0
      }
    }

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    const { body: { metrics } } = res;

    metrics.forEach(m => {
        expectChakram(expectedById[m.id].point).to.deep.equal(m.point);
        expectChakram(expectedById[m.id].target).to.deep.equal(m.target);
      }
    );
  });

});
