const env = require('node-env-file');
env(__dirname + '/../../../.env');

describe('Report ', () => {
  beforeEach(() => {
    browser.url('/report');
    browser.execute(function (token) {
      if (document.hasOwnProperty('localStorage')) {
        document.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      if (window.hasOwnProperty('localStorage')) {
        window.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      localStorage.setItem('token', '"' + token + '"');
    }, process.env.TEST_JWT_TOKEN);
    browser.url('/report');
  });

  it('should be able to click the period buttons', () => {
    browser.waitUntil(browser.isVisible('.period-buttons'));

    expect(browser.getText('.period-buttons > .btn:nth-child(1)').trim().toUpperCase()).toBe('DAY');
    browser.click('.period-buttons > .btn:nth-child(1)');

    expect(browser.getText('.period-buttons > .btn:nth-child(2)').trim().toUpperCase()).toBe(
      'WEEK'
    );
    browser.click('.period-buttons > .btn:nth-child(2)');

    expect(browser.getText('.period-buttons > .btn:nth-child(3)').trim().toUpperCase()).toBe(
      'MONTH'
    );
    browser.click('.period-buttons > .btn:nth-child(3)');

    expect(browser.getText('.period-buttons > .btn:nth-child(4)').trim().toUpperCase()).toBe(
      'YEAR'
    );
    browser.click('.period-buttons > .btn:nth-child(4)');
  }, 3);

  it('should be able to switch between tabs', () => {
    browser.waitUntil(browser.isVisible('.tabs'));

    expect(browser.getText('.tab.is-active > div > div').trim().toUpperCase()).toBe('FOOD WASTE');

    browser.click('.tab:nth-child(2)');
    expect(browser.getText('.tab.is-active > div > div').trim().toUpperCase()).toBe('PROJECTS');

    browser.click('.tab:nth-child(3)');
    expect(browser.getText('.tab.is-active > div > div').trim().toUpperCase()).toBe('SALES');

    browser.click('.tab:nth-child(1)');
    expect(browser.getText('.tab.is-active > div > div').trim().toUpperCase()).toBe('FOOD WASTE');
  }, 3);
});
