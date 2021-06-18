const app = require('../../../../../src/app').default;
const processWasteTargersHook = require('../../../../../src/services/settings/hooks/process-waste-targets').default;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('process-waste-targets', () => {
  let inHook;

  beforeEach(() => {
    inHook = {
      app,
      method: 'create',
      params: {},
      data: {
        customerId: 1,
        settings: {
          expectedFoodwaste: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day' }],
          expectedFoodwastePerGuest: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day' }],
          perGuestBaseline: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day' }],
          perGuestStandard: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day' }]
        }
      }
    };

  });

  it('should set amountNormalized field to all targets', async () => {
    try {

      inHook.data.settings.expectedFoodwaste[0].period = 'year';
      inHook.data.settings.expectedFoodwastePerGuest[0].period = 'month';
      inHook.data.settings.perGuestStandard[0].period = 'week';
      inHook.data.settings.perGuestBaseline[0].period = 'day';

      const outHook = await processWasteTargersHook()(inHook);
      expect(outHook.data.settings).to.deep.equal({
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
        perGuestStandard: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day', amountNormalized: 420 }]
      })
    } catch (error) {
      assert(error);
    }
  });

  it('should set amountNormalized field when food waste total target is missing', async () => {
    delete inHook.data.settings.expectedFoodwaste;
    try {
      await processWasteTargersHook()(inHook);
      const outHook = await processWasteTargersHook()(inHook);
      expect(outHook.data.settings).to.deep.equal({
        expectedFoodwastePerGuest: [{
          from: '1970-01-01',
          amount: 420,
          unit: 'g',
          period: 'day',
          amountNormalized: 420
        }],
        perGuestBaseline: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day', amountNormalized: 420 }],
        perGuestStandard: [{ from: '1970-01-01', amount: 420, unit: 'g', period: 'day', amountNormalized: 420 }]
      })
    } catch (error) {
      assert(error);
    }
  });
});
