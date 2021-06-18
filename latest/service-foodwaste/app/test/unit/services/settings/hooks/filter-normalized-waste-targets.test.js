const app = require('../../../../../src/app').default;
const filterNormalizedTargetsHook = require('../../../../../src/services/settings/hooks/filter-normalized-waste-targets').default;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('filter-normalized-waste-targets', () => {
  let inHook;

  beforeEach(() => {
    inHook = {
      app,
      method: 'create',
      params: {},
      result: {
        customerId: 1,
        settings: {
          expectedFoodwaste: [{
            from: '1970-01-01',
            amount: 420,
            unit: 'g',
            period: 'year',
            amountNormalized: 420 / 360
          }],
          expectedFoodwastePerGuest: [{
            from: '1970-01-01',
            amount: 420,
            unit: 'g',
            period: 'month',
            amountNormalized: 420 / 30
          }],
          perGuestBaseline: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'week', amountNormalized: 420 / 7 }],
          perGuestStandard: [{ from: '1970-01-01', amount: 69, unit: 'g', period: 'day', amountNormalized: 69 }]
        }
      }
    };
  });

  it('should filter out amountNormalized fields from targets', async () => {
    try {
      const outHook = await filterNormalizedTargetsHook()(inHook);
      const { settings } = outHook.data;
      expect(Object.keys(settings).every(goalKey => settings[goalKey].amountNormalized === undefined )).to.equal(true);
    } catch (error) {
      assert(error);
    }
  });

});
