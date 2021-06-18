'use strict';

const expect = require('chai').expect;
const Jobs = require('../../../../src/services/jobs/jobs').default;
const sinon = require('sinon');
const app = require('../../../../src/app').default;
const Redlock = require('redlock');

describe('Jobs service - create endpoint', () => {
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const jobs = new Jobs(app);
  let accountsData;
  let lockStub;

  beforeEach(() => {
    sandbox.stub(Jobs, 'sleep').returns(Promise.resolve());
    lockStub = sandbox.stub(Redlock.prototype, 'lock').returns({ unlock: () => sandbox.stub() });
    process.env.ALARMS_ENABLED = 'true';
    process.env.ENVIRONMENT = 'production';
    accountsData = [
      {
        "customer_id": "33588",
        "testaccount": null,
        "alarm": {
          "zone": "Europe/Copenhagen",
          "enabled": true,
          "message": "test",
          "recipients": [
            {
              "name": "Meisam",
              "type": "sms",
              "value": "4520149603"
            }
          ],
          "executionTime": "12"
        },
        "regs_frequency": {},
        "lang": "en",
        "regs_count": "0"
      },
      {
        "customer_id": "33871",
        "testaccount": null,
        "alarm": {
          "zone": "Europe/Copenhagen",
          "enabled": true,
          "message": "Husk madspild! Intern konto",
          "recipients": [
            {
              "name": "Signe",
              "type": "sms",
              "value": "4530278402"
            }
          ],
          "executionTime": "15"
        },
        "regs_frequency": {
          "0": [
            1,
            2,
            3,
            4,
            5
          ]
        },
        "lang": null,
        "regs_count": "0"
      },
      {
        "customer_id": "1",
        "testaccount": true,
        "alarm": {
          "zone": "Europe/Copenhagen",
          "enabled": true,
          "message": "Husk alarm",
          "recipients": [
            {
              "name": "meisam",
              "type": "sms",
              "value": "4520149603"
            },
            {
              "name": "meisam",
              "type": "email",
              "value": "meisamg@gmail.com"
            }
          ],
          "executionTime": "16"
        },
        "regs_frequency": {
          "0": [
            0,
            2,
            6
          ]
        },
        "lang": null,
        "regs_count": "0"
      }
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });

  /*
   * =======================================================
   * create() main function
   */
  describe('create() main function', () => {
    it('should throw an error when getting the accounts settings with alarms returns an error', async () => {
      const logStub = sandbox.stub(log, 'info');
      process.env.ENVIRONMENT = 'development';
      sandbox.stub(sequelize, 'query').returns(Promise.reject({ some: 'error' }));
      try {
        await jobs.create();
      } catch (err) {
        expect(logStub.calledOnce).to.equal(true);
        expect(err.message).to.equal('Could not get alarm and registrations of accounts');
        expect(err.data.errorCode).to.equal('E227');
        expect(err.errors).to.deep.equal({ some: 'error' });
      }
    });

    it('should return nothing when there are 0 accounts with alarms', async () => {
      const logStub = sandbox.stub(log, 'info');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([]));
      const res = await jobs.create();
      expect(res).to.equal(undefined);
      expect(logStub.calledTwice).to.equal(true);
    });

    it('should log warning when lock has already been acquired and exit the job', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(accountsData));
      lockStub.returns(Promise.reject({ message: 'Exceeded 5 attempts to lock the resource' }));

      const res = await jobs.create();
      expect(logStub.calledOnce).to.equal(true);
      expect(res).to.equal(undefined);
    });

    it('should throw an error when acquiring the lock returns an error of execution', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(accountsData));
      lockStub.returns(Promise.reject({ message: 'Some other error' }));

      try {
        await jobs.create();
      } catch (err) {
        expect(logStub.notCalled).to.equal(true);
        expect(err.message).to.equal('Could not acquire lock');
        expect(err.data.errorCode).to.equal('E228');
      }
    });

  });

  /*
   * =======================================================
   * helper functions
   */
  describe('helper functions', () => {
    it('should generate a random number between 5 and 95', () => {
      const randomNr = Jobs.randomIntInterval(5, 95);
      let testCheck = false;
      if (randomNr => 5 && randomNr <= 95) {
        testCheck = true;
      }
      expect(testCheck).to.equal(true);
    });

    it('should construct an SMS request params object for a test acc', () => {
      const { uri, token, body } = Jobs.constructRequestParams(accountsData[2], accountsData[2].alarm.recipients[0]);

      expect(uri).to.equal('https://api.cpsms.dk/v2/send');
      expect(token).to.equal('Basic dW5kZWZpbmVkOnVuZGVmaW5lZA==');
      expect(body).to.deep.equal({
        to: '4520149603',
        message: 'Husk alarm ENV: production',
        from: 'eSmiley',
        format: 'UNICODE'
      });
    });

    it('should construct an EMAIL request params object for a test acc', () => {
      const { uri, token, body } = Jobs.constructRequestParams(accountsData[2], accountsData[2].alarm.recipients[1]);

      expect(uri).to.equal('http://mandrillapp.com/api/1.0/messages/send-template.json');
      expect(token).to.equal(undefined);
      expect(body).to.deep.equal({
        key: undefined,
        template_name: 'Register_Foodwaste_Reminder',
        template_content: [{ name: 'I do not know', content: 'what this is about' }],
        message:
          {
            from_email: 'support@e-smiley.dk',
            from_name: 'eSmiley',
            to: [{ email: 'meisamg@gmail.com' }],
            subject: 'Remember to register food waste',
            text: 'Husk alarm ENV: production',
            global_merge_vars: [{ name: 'DEAR', content: 'Dear' },
              { name: 'FIRSTNAME', content: 'Customer' },
              { name: 'CONTENT', content: 'Husk alarm' }],
            track_opens: true,
            track_clicks: true,
            auto_text: true,
            url_strip_qs: true
          }
      });
    });

    it('should construct an SMS request params object NOT for a test acc', () => {
      const { uri, token, body } = Jobs.constructRequestParams(accountsData[0], accountsData[0].alarm.recipients[0]);

      expect(uri).to.equal('https://api.cpsms.dk/v2/send');
      expect(token).to.equal('Basic dW5kZWZpbmVkOnVuZGVmaW5lZA==');
      expect(body).to.deep.equal({
        to: '4520149603',
        message: 'test', // NOTICE, there's no "ENV: xxx" added here
        from: 'eSmiley',
        format: 'UNICODE'
      });
    });
  });


});
