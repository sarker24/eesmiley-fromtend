const expect = require('chai').expect;
const filterSettingsProperties = require('../../../../../src/services/settings/hooks/filter-settings-properties.js').default;
const app = require('../../../../../src/app').default;

describe('Settings Service - filter-settings-properties', () => {

  let testInput;
  const correctNumberFormat = '4512345678';

  beforeEach(() => {
    testInput = {
      customerId: 1,
      userId: 1,
      settings: {
        alarms: {
          recipients: [
            {
              name: 'Some dude',
              type: 'sms',
              value: correctNumberFormat // this is a correct value
            }
          ]
        }
      }
    };

  });

  it('Should return proper number when there is nothing wrong with it', async () => {
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    const result = await filterSettingsProperties()(mockHook);
    const filteredSettings = result.data.settings;

    expect(filteredSettings.alarms.recipients[0].value).to.equal(correctNumberFormat);
  });

  it('Should return proper number when there are white spaces', async () => {
    testInput.settings.alarms.recipients[0].value = '45 1234 5678';
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    const result = await filterSettingsProperties()(mockHook);
    const filteredSettings = result.data.settings;

    expect(filteredSettings.alarms.recipients[0].value).to.equal(correctNumberFormat);
  });

  it('Should return proper number when there are random non-numeric symbols', async () => {
    testInput.settings.alarms.recipients[0].value = '@4+5 -1234_ /5678';
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    const result = await filterSettingsProperties()(mockHook);
    const filteredSettings = result.data.settings;

    expect(filteredSettings.alarms.recipients[0].value).to.equal(correctNumberFormat);
  });

  it('Should return proper number when there are letters', async () => {
    testInput.settings.alarms.recipients[0].value = '45 a1234 b5678';
    const mockHook = {
      type: 'before',
      app: app,
      service: app.service('settings'),
      data: testInput,
      params: {}
    };

    const result = await filterSettingsProperties()(mockHook);
    const filteredSettings = result.data.settings;

    expect(filteredSettings.alarms.recipients[0].value).to.equal(correctNumberFormat);
  });

});
