let env = require('node-env-file');
env(__dirname + '/../../../.env');

describe('Registration ', () => {
  var postMessageSupport = false;
  var buttonRegistration = '.registration button.step3';
  beforeEach(() => {
    browser.url('/registration');
    browser.execute(function (token) {
      if (document.hasOwnProperty('localStorage')) {
        document.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      if (window && window.hasOwnProperty('localStorage')) {
        window.localStorage.setItem('token', '"' + token + '"');
        return;
      }
      localStorage.setItem('token', '"' + token + '"');
    }, process.env.TEST_JWT_TOKEN);
    browser.url('/registration');

    browser.waitForVisible('.registration', 1500);
    browser.waitForVisible(buttonRegistration, 1500);

    browser.execute(function () {
      if (window.hasOwnProperty('postMessage') && window.postMessage) {
        postMessageSupport = true;
      }
    });
    browser.click(buttonRegistration);
    // browser.click('#react-app > div > div > main > div.mainAppViewContentWrapper.nav-visible > div.mainAppViewContent.is-logged-in.nav-visible > div > div > div.MuiGrid-typeItem-28.MuiGrid-grid-xs-12-57.form-bar > div > div > div:nth-child(7) > button.step__3');
  });

  /*
   * Benchmarks:
   * The scale app sends 11.61 requests per second (1 request every 86ms).
   * Native to webview (app-scale to frontend-client) delay: 27ms
   */
  it('should handle X amount of requests in less than Y amount of time per request', () => {
    var requests = 25;
    var time = 600;

    browser.waitForVisible('#weight', 8000);
    if (!browser.isVisible('#weight')) {
      //Something flakey happened in the beforeEach thing and we have to execute it again...
      browser.click(buttonRegistration);
    }
    if (!browser.isVisible('#weight')) {
      //Something flakey happened in the beforeEach thing and we have to execute it again...
      browser.click('.registration button.step:last-of-type');
    }
    const startedAt = new Date().getTime();

    if (postMessageSupport && browser.isVisible('#weight')) {
      for (var i = 1; i <= requests; i++) {
        browser.execute(function (weight) {
          window.postMessage(
            { weight, isMessage: false, message: null, isStable: true, isLowVoltage: false },
            '*'
          );
        }, i);
      }
    }

    if (postMessageSupport) {
      const duration = new Date().getTime() - startedAt;
      const perRequest = duration / requests;
      console.log('Time between updates:', perRequest);
      return expect(perRequest).toBeLessThan(time);
    }

    return expect(postMessageSupport).toBe(false);
  }, 4);

  /*
   * Benchmarks:
   * Time between updates: 50ms - 65ms  [integration test => test website (no pause) (11-09-2017)]
   * Only runs on compatible browsers...
   */
  //TODO: as Edge time's out on the BrowserStack network this should not be run... there might be a bug...
  if (browser.desiredCapabilities.browserName !== 'MicrosoftEdge') {
    it('should update in less than X amount of time (is not too slow)', () => {
      var reqs = 25;
      var t = 50;
      browser.waitForVisible('#weight', 8000);
      if (!browser.isVisible('#weight')) {
        //Something flakey happened in the beforeEach thing and we have to execute it again...
        browser.click(buttonRegistration);
      }
      if (!browser.isVisible('#weight')) {
        //Something flakey happened in the beforeEach thing and we have to execute it again...
        browser.click('.registration button.step:last-of-type');
      }
      if (postMessageSupport && browser.isVisible('#weight')) {
        for (var i = 1; i <= reqs; i++) {
          browser.execute(function (weight) {
            if (window.hasOwnProperty('postMessage')) {
              window.postMessage(
                {
                  weight: weight,
                  isMessage: false,
                  message: null,
                  isStable: true,
                  isLowVoltage: false
                },
                '*'
              );
            }
          }, i);
          browser.pause(t);
          expect(browser.getValue('#weight')).toBe(i.toFixed(3) + ' kg');
        }
        return expect(postMessageSupport).toBe(true);
      }

      return expect(postMessageSupport).toBe(false);
    }, 4);
  }
});
