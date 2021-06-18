const app = require('../../../../src/app').default;
const longLiveAccessToken = app.get('testLongLivedAccessToken');
const adminToken = app.get('testLongLivedAdminAccessToken');
const validateSchema = require('feathers-hooks-esmiley').validateSchema;
const schemas = require('schemas');
const findSchema = schemas.get('report-data-response');
const round = require('../../../../src/util/math').round;
const avg = require('../../../../src/util/array').avg;
const min = require('../../../../src/util/array').min;
const max = require('../../../../src/util/array').max;

// todo: export plain function instead of a hook
async function validateResponse(schema, response) {
  const { body } = response;
  return await validateSchema(schema, { coerceTypes: true })({ type: 'after', result: body });
}

async function createRegistrations(dateAmounts) {
  for (const dateAmount of dateAmounts) {
    const { date, amount, customerId = 1, userId = 1, registrationPointId = 10070 } = dateAmount;
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
        'scale': true,
      }
    });
  }
}

describe('frequency-per-account', () => {

  it('should return valid response', async () => {

    const res = await chakram.request('GET', '/reports/frequency-per-account', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    expectChakram(res).to.have.status(200);
    expectChakram(res).to.have.header('content-type', 'application/json; charset=utf-8');
    expectChakram(res.body.series[0].id).to.equal('frequencyPerAccount');
    expectChakram(res.body.series[0].unit).to.equal('%');
    expectChakram(res.body.series[0].series[0].id).to.equal('frequencyOnTargetDays');
    expectChakram(res.body.series[0].series[1].id).to.equal('frequencyOnOtherDays');

    await validateResponse(findSchema, res);

  });

  // TODO: stub external network call in settings hook!!!
  it('should return correct onTarget % and onOther % frequency ratios for a customer', async () => {

    await chakram.request('PATCH', '/settings/10000', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: [
        {
          op: 'replace',
          path: '/current/expectedFrequency',
          value: [{ from: '1970-01-01', days: [1] }, { from: '2020-01-11', days: [5] }] // 1: mon, 5: fri
        }
      ]
    });

    const onTargetRegistrations = [
      { date: '2020-01-06', amount: 100 }, // mon
      { date: '2020-01-17', amount: 100 } // fri
    ];

    const onOtherRegistrations = [
      { date: '2020-01-13', amount: 100 }, // mon
      { date: '2020-01-14', amount: 100 }, // tue
      { date: '2020-01-10', amount: 100 } // fri
    ];

    await createRegistrations([
      ...onTargetRegistrations, ...onOtherRegistrations
    ]);

    // monday - sunday (2020-01-06 - 2020-01-19)
    const res = await chakram.request('GET', '/reports/frequency-per-account?from=2020-01-06&to=2020-01-19', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const totalDaysInPeriod = 14;
    const expectedTargetRatio = 100 * onTargetRegistrations.length / totalDaysInPeriod;
    const expectedOtherRatio = 100 * onOtherRegistrations.length / totalDaysInPeriod;

    const expectedDayRatiosByType = {
      frequencyOnTargetDays: {
        valuesByCustomerId: { '1': round(expectedTargetRatio) }
      },
      frequencyOnOtherDays: {
        valuesByCustomerId: { '1': round(expectedOtherRatio) }
      }
    };

    const expectedCustomerTotalRatio = round(expectedTargetRatio + expectedOtherRatio);

    expectChakram(res.body.extra.target).to.equal(round(expectedTargetRatio));
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      avg: expectedCustomerTotalRatio,
      min: expectedCustomerTotalRatio,
      max: expectedCustomerTotalRatio
    });

    expectChakram(res.body.series[0].series.every(series => {
        const expectedValues = expectedDayRatiosByType[series.id].valuesByCustomerId;
        return series.points.length === 1 && series.points.every(point =>
          expectedValues[point.label] && expectedValues[point.label] === point.value)
      }
    )).to.equal(true);
  });

  it('should return correct onTarget % and onOther % frequency ratios for multiple customers with descending order', async () => {

    await chakram.request('PATCH', '/settings/10000', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: [
        {
          op: 'replace',
          path: '/current/expectedFrequency',
          value: [{ from: '1970-01-01', days: [1] }, { from: '2020-01-11', days: [5] }] // 1: mon, 5: fri
        }
      ]
    });

    await chakram.request('PATCH', '/settings/10001', {
      headers: {
        'Authorization': 'Bearer ' + adminToken
      },
      body: [
        {
          op: 'replace',
          path: '/current/expectedFrequency',
          value: [{ from: '1970-01-01', days: [1, 3, 5] }] // 1: mon, 3: wed, 5 fri
        }
      ]
    });

    const onTargetRegistrations = [
      { date: '2020-01-06', amount: 100, customerId: 1 }, // mon
      { date: '2020-01-17', amount: 100, customerId: 1 }, // fri
      { date: '2020-01-08', amount: 100, customerId: 2, registrationPointId: 10003 }, // wed
    ];

    const onOtherRegistrations = [
      { date: '2020-01-13', amount: 100, customerId: 1 }, // mon
      { date: '2020-01-14', amount: 100, customerId: 1 }, // tue
      { date: '2020-01-10', amount: 100, customerId: 1 } // fri
    ];

    await createRegistrations([
      ...onTargetRegistrations, ...onOtherRegistrations
    ]);

    // monday - sunday (2020-01-06 - 2020-01-19)
    const res = await chakram.request('GET', '/reports/frequency-per-account?accounts=1,2&from=2020-01-06&to=2020-01-19&order=desc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const totalDaysInPeriod = 14;

    const customerRatios = [
      {
        customerId: 1,
        targetRatio: 100 * onTargetRegistrations.filter(t => t.customerId === 1).length / totalDaysInPeriod,
        otherRatio: 100 * onOtherRegistrations.filter(t => t.customerId === 1).length / totalDaysInPeriod,
        target: 100 * 2 / totalDaysInPeriod
      }, {
        customerId: 2,
        targetRatio: 100 * onTargetRegistrations.filter(t => t.customerId === 2).length / totalDaysInPeriod,
        otherRatio: 100 * onOtherRegistrations.filter(t => t.customerId === 2).length / totalDaysInPeriod,
        target: 100 * 6 / totalDaysInPeriod
      }
    ];

    const expectedDayRatiosByType = {
      frequencyOnTargetDays: {
        valuesByCustomerId: {
          '1': round(customerRatios.find(ratio => ratio.customerId === 1).targetRatio),
          '2': round(customerRatios.find(ratio => ratio.customerId === 2).targetRatio)
        }
      },
      frequencyOnOtherDays: {
        valuesByCustomerId: {
          '1': round(customerRatios.find(ratio => ratio.customerId === 1).otherRatio),
          '2': round(customerRatios.find(ratio => ratio.customerId === 2).otherRatio)
        }
      }
    };

    const expectedCustomerTotalRatios = customerRatios.map(ratio => ratio.otherRatio + ratio.targetRatio);

    expectChakram(res.body.extra.target).to.equal(round(avg(customerRatios.map(ratio => ratio.target))));
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      avg: round(avg(expectedCustomerTotalRatios)),
      min: round(min(expectedCustomerTotalRatios)),
      max: round(max(expectedCustomerTotalRatios))
    });

    expectChakram(res.body.series[0].series.every(series => {
        const expectedValues = expectedDayRatiosByType[series.id].valuesByCustomerId;
        return series.points.every(point => expectedValues[point.label] === point.value)
      }
    )).to.equal(true);


    expectChakram(res.body.series[0].series.forEach(series =>
      series.points.forEach((currentPoint, index, all) => {
        if (index >= all.length - 1) {
          return;
        }
        const nextPoint = all[index + 1];
        expectChakram(currentPoint.value >= nextPoint.value).to.equal(true);
      })
    ));

  });

  it('should return correct onTarget % and onOther % frequency ratios for multiple customers with ascending order', async () => {

    await chakram.request('PATCH', '/settings/10000', {
      headers: {
        'Authorization': 'Bearer ' + longLiveAccessToken
      },
      body: [
        {
          op: 'replace',
          path: '/current/expectedFrequency',
          value: [{ from: '1970-01-01', days: [1] }, { from: '2020-01-11', days: [5] }] // 1: mon, 5: fri
        }
      ]
    });

    await chakram.request('PATCH', '/settings/10001', {
      headers: {
        'Authorization': 'Bearer ' + adminToken
      },
      body: [
        {
          op: 'replace',
          path: '/current/expectedFrequency',
          value: [{ from: '1970-01-01', days: [1, 3, 5] }] // 1: mon, 3: wed, 5 fri
        }
      ]
    });

    const onTargetRegistrations = [
      { date: '2020-01-06', amount: 100, customerId: 1 }, // mon
      { date: '2020-01-17', amount: 100, customerId: 1 }, // fri
      { date: '2020-01-08', amount: 100, customerId: 2, registrationPointId: 10003 }, // wed
    ];

    const onOtherRegistrations = [
      { date: '2020-01-13', amount: 100, customerId: 1 }, // mon
      { date: '2020-01-14', amount: 100, customerId: 1 }, // tue
      { date: '2020-01-10', amount: 100, customerId: 1 } // fri
    ];

    await createRegistrations([
      ...onTargetRegistrations, ...onOtherRegistrations
    ]);

    // monday - sunday (2020-01-06 - 2020-01-19)
    const res = await chakram.request('GET', '/reports/frequency-per-account?accounts=1,2&from=2020-01-06&to=2020-01-19&order=asc', {
      'headers': {
        'Authorization': 'Bearer ' + longLiveAccessToken
      }
    });

    const totalDaysInPeriod = 14;

    const customerRatios = [
      {
        customerId: 1,
        targetRatio: 100 * onTargetRegistrations.filter(t => t.customerId === 1).length / totalDaysInPeriod,
        otherRatio: 100 * onOtherRegistrations.filter(t => t.customerId === 1).length / totalDaysInPeriod,
        target: 100 * 2 / totalDaysInPeriod
      }, {
        customerId: 2,
        targetRatio: 100 * onTargetRegistrations.filter(t => t.customerId === 2).length / totalDaysInPeriod,
        otherRatio: 100 * onOtherRegistrations.filter(t => t.customerId === 2).length / totalDaysInPeriod,
        target: 100 * 6 / totalDaysInPeriod
      }
    ];

    const expectedDayRatiosByType = {
      frequencyOnTargetDays: {
        valuesByCustomerId: {
          '1': round(customerRatios.find(ratio => ratio.customerId === 1).targetRatio),
          '2': round(customerRatios.find(ratio => ratio.customerId === 2).targetRatio)
        }
      },
      frequencyOnOtherDays: {
        valuesByCustomerId: {
          '1': round(customerRatios.find(ratio => ratio.customerId === 1).otherRatio),
          '2': round(customerRatios.find(ratio => ratio.customerId === 2).otherRatio)
        }
      }
    };

    const expectedCustomerTotalRatios = customerRatios.map(ratio => ratio.otherRatio + ratio.targetRatio);

    expectChakram(res.body.extra.target).to.equal(round(avg(customerRatios.map(ratio => ratio.target))));
    expectChakram(res.body.series[0].aggregates).to.deep.equal({
      avg: round(avg(expectedCustomerTotalRatios)),
      min: round(min(expectedCustomerTotalRatios)),
      max: round(max(expectedCustomerTotalRatios))
    });

    expectChakram(res.body.series[0].series.every(series => {
        const expectedValues = expectedDayRatiosByType[series.id].valuesByCustomerId;
        return series.points.every(point => expectedValues[point.label] === point.value)
      }
    )).to.equal(true);

    expectChakram(res.body.series[0].series.forEach(series =>
      series.points.forEach((currentPoint, index, all) => {
        if (index >= all.length - 1) {
          return;
        }
        const nextPoint = all[index + 1];
        expectChakram(currentPoint.value <= nextPoint.value).to.equal(true);
      })
    ));
  });

});
