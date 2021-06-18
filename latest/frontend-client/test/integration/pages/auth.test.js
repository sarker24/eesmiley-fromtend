const env = require('node-env-file');
env(__dirname + '/../../../.env');

describe('Auth ', () => {
  it('should have deal number focused', () => {
    browser.url('/auth');
    expect(browser.hasFocus('#dealNumber')).toBe(true);
  });

  it('should redirect to dashboard if you are logged-in', () => {
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
    browser.url('/auth');
    expect(browser.isExisting('.dashboard')).toBe(true);
  });
  // TODO (Daniel)
  // it('should replace existing token if the parameter was provided', () => {
});
