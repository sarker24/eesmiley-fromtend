var env = require('node-env-file');
env(__dirname + '/../../../.env');
describe('Dashboard ', () => {
  let browserIsNotIE =
    browser.desiredCapabilities.browserName !== 'IE11' &&
    browser.desiredCapabilities.browserName !== 'IE' &&
    browser.desiredCapabilities.browserName !== 'ie' &&
    browser.desiredCapabilities.browseName !== 'Internet Explorer' &&
    browser.desiredCapabilities.browseName !== 'internet explorer' &&
    browser.desiredCapabilities.browseName !== 'firefox IE 11.0';
  const browserIsNotFF55 = browser.desiredCapabilities.browserName !== 'ff_55';
  beforeEach(() => {
    browser.url('/');
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
    browser.url('/');

    //special for this test only...
    browserIsNotIE =
      browser.desiredCapabilities.browserName !== 'IE11' &&
      browser.desiredCapabilities.browserName !== 'IE' &&
      browser.desiredCapabilities.browserName !== 'ie' &&
      browser.desiredCapabilities.browseName !== 'Internet Explorer' &&
      browser.desiredCapabilities.browseName !== 'internet explorer' &&
      browser.desiredCapabilities.browseName !== 'firefox IE 11.0';
  });

  it('should be able to load the page', () => {
    expect(browser.isExisting('.dashboard')).toBe(true);
  });

  it('should be able to open Create Project modal by clicking the "New Project" button and cancel the modal', () => {
    browser.waitForVisible('.projectStatus .btn', 2500);
    expect(browser.isExisting('.projectModalContent')).toBe(false);
    browser.click('.projectStatus .btn');
    if (browser.isVisible('.projectModalContent')) {
      browser.waitForVisible('.projectModalContent', 3000);
      expect(browser.isExisting('.projectModalContent')).toBe(true);
      browser.setValue('.projectModalContent input#panel1_nameInput', 'Test project');
      browser.click('.projectModalContent .btn');
      expect(browser.isExisting('.projectModal')).toBe(false);
      expect(browser.isExisting('.dashboard .graphContainer .switcherContent')).toBe(true);
    }
  }, 3);

  //TODO: find a solution that make these run smoothly in IE (opens the wrong modal - does not work)
  if (browserIsNotIE) {
    it('should be able to open the "Sales Information" modal and save information', () => {
      expect(browser.isExisting('body .modal.salesModal')).toBe(false);
      browser.waitForVisible('.dashboard .container button#addSalesData');
      browser.click('.dashboard .container button#addSalesData');
      browser.waitForVisible('body .modal.salesModal', 8000);
      if (!browser.isVisible('.salesModal')) {
        browser.click('.dashboard .container button#addSalesData');
        browser.waitForVisible('body .modal.salesModal', 8000);
      }
      if (browser.isVisible('body .modal.salesModal')) {
        expect(browser.isExisting('body .modal.salesModal')).toBe(true);
        if (browser.isVisible('.salesModal input')) {
          browser.setValue('.salesModal input#income', 200);
          browser.setValue('.salesModal input#sales', 511110);
          browser.setValue('.salesModal input#productionCost', 511110);
          browser.setValue('.salesModal input#guests', 511110);
          browser.setValue('.salesModal input#productionWeight', 511110);
          browser.setValue('.salesModal input#portions', 511110);
        }
      }
    }, 6);
  }
  //TODO: find a solution that make these run smoothly in IE (opens the wrong modal - does not work)

  if (browserIsNotIE) {
    it('should be able to open the "Sales Information" modal and close it by clicking Close', () => {
      expect(browser.isExisting('body .modal.salesModal')).toBe(false);
      browser.waitForVisible('.dashboard .container button#addSalesData');
      browser.click('.dashboard .container button#addSalesData');
      browser.waitForVisible('body .modal.salesModal', 5000);
      if (browser.isVisible('body .modal.salesModal')) {
        expect(browser.isExisting('body .modal.salesModal')).toBe(true);
        //Firefox cannot close the sales dialog in some weird edge cases...
        if (browserIsNotFF55) {
          browser.waitForVisible('body .modal.salesModal .salesDialogCancelBtn', 5000);
          if (browser.isVisible('body .modal.salesModal .salesDialogCancelBtn')) {
            browser.click('body .modal.salesModal .salesDialogCancelBtn');
            if (browser.isVisible('body .modal.salesModal')) {
              if (browser.isVisible('body .modal.salesModal .salesDialogCancelBtn')) {
                browser.click('body .modal.salesModal .salesDialogCancelBtn');
              }
              browser.click('body .modal');
              browser.click('body');
              browser.keys('Escape');
              $('body').keys('Escape');
              browser.elementIdValue('body', ['Escape']);
              if (
                !browser.isVisible('body .modal.salesModal') &&
                browser.isExisting('body .modal.salesModal') === false
              ) {
                expect(browser.isExisting('body .modal.salesModal')).toBe(false);
              }
            }
            if (
              !browser.isVisible('body .modal.salesModal') &&
              browser.isExisting('body .modal.salesModal') === false
            ) {
              return expect(browser.isExisting('body .modal.salesModal')).toBe(false);
            }
          }
          if (
            !browser.isVisible('body .modal.salesModal') &&
            browser.isExisting('body .modal.salesModal') === false
          ) {
            return expect(browser.isExisting('body .modal.salesModal')).toBe(false);
          }
        }
      }
    }, 6);
  }
});
