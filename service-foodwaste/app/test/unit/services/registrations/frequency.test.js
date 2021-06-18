'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Frequency = require('../../../../src/services/registrations/frequency').default;
const app = require('../../../../src/app').default;
const moment = require('moment').utc;

describe('Registrations service - frequency endpoint', () => {
  const service = app.service('/registrations/frequency');
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const frequency = new Frequency(app);

  let settingsPerAccount, accounts, accountsToQuery, regsToHavePerDOW, totalsPerAcc, accountsWithoutSettings,
    registrations, accountNames, registrationDaysPerAcc;

  beforeEach(() => {
    Frequency.periodFormatter = (start) => {
      return `${moment(start).format('WW')}`;
    };

    accounts = ['33871', "28143", "32039", "4959", "36742"];
    accountsToQuery = ["33871", "28143"];
    accountsWithoutSettings = ["36742", "32039", "4959"];
    settingsPerAccount = [
      {                             // index 0
        "customerId": "33871", // the account of the current user
        "current": {
          "name": "Customer 1",
          "accounts": [
            { id: 28143, name: 'Company 5' },
            { id: 36742, name: 'Company 2' },
            { id: 32039, name: 'Company 3' },
            { id: 4959, name: 'Company 4' }
          ],
          "expectedFrequency": [
            { from: "1970-01-01", days: [1, 3, 5] },
            { from: "2018-08-10", days: [1, 2, 3, 4, 5] },
            { from: "2018-08-20", days: [1, 2, 3, 4, 5] },
            { from: "2018-08-25", days: [1, 4, 5] }
          ],
          "expectedFoodwaste":
            [{
              from: '1970-01-01',
              amount: 123,
              period: 'week',
              amountNormalized: 123 / 7,
              unit: 'g'
            },
              {
                from: '2018-08-25',
                amount: 321,
                period: 'week',
                amountNormalized: 321 / 7,
                unit: 'g'
              }]
        }
      },
      {                             // index 1
        "customerId":
          "28143",
        "current":
          {
            "name":
              "Company 5",
            "expectedFrequency": [
              { from: "1970-01-01", days: [1, 3, 5] },
              { from: "2018-08-10", days: [1, 2, 3, 4, 6, 0] }
            ],
            "expectedFoodwaste":
              [{
                from: '1970-01-01',
                amount: 123,
                period: 'week',
                amountNormalized: 123 / 7,
                unit: 'g'
              },
                {
                  from: '2018-08-25',
                  amount: 321,
                  period: 'week',
                  amountNormalized: 321 / 7,
                  unit: 'g'
                }]
          }
      }
      ,
      {                             // index 2
        "customerId":
          "36742",
        "current":
          {}
      }
      ,
      {                             // index 3
        "customerId":
          "32039",
        "current":
          {
            "expectedFrequency": [],
            "expectedFoodwaste":
              [{
                from: '1970-01-01',
                amount: 123,
                period: 'week',
                amountNormalized: 123 / 7,
                unit: 'g'
              },
                {
                  from: '2018-08-25',
                  amount: 321,
                  period: 'week',
                  amountNormalized: 321 / 7,
                  unit: 'g'
                }]
          }
      }
      ,
      {                             // index 4
        "customerId":
          "4959",
        "current":
          {
            "expectedFoodwaste":
              [{
                from: '1970-01-01',
                amount: 123,
                period: 'week',
                amountNormalized: 123 / 7,
                unit: 'g'
              },
                {
                  from: '2018-08-25',
                  amount: 321,
                  period: 'week',
                  amountNormalized: 321 / 7,
                  unit: 'g'
                }]
          }
      }
    ];
    regsToHavePerDOW = {
      "28143": {
        "2018-08-01": { "1": 1, "3": 2, "5": 1 },
        "2018-08-10": { "0": 3, "1": 3, "2": 3, "3": 3, "4": 3, "6": 3 }
      },
      "33871": {
        "2018-08-01": { "1": 1, "3": 2, "5": 1 },
        "2018-08-10": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2 },
        "2018-08-20": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },
        "2018-08-25": { "1": 1, "4": 1, "5": 1 }
      }
    };
    totalsPerAcc = {
      "28143": { "expectedDays": 22, "registeredDays": 0 },
      "33871": { "expectedDays": 18, "registeredDays": 0 }
    };
    accountNames = {
      '28143': 'Company 5',
      '33871': 'Customer 1'
    };
    registrations = [
      { "customer_id": "28143", "dow": 3, "date": "2018-08-01" },
      { "customer_id": "28143", "dow": 4, "date": "2018-08-02" },
      { "customer_id": "28143", "dow": 5, "date": "2018-08-03" },
      { "customer_id": "28143", "dow": 6, "date": "2018-08-04" },
      { "customer_id": "28143", "dow": 0, "date": "2018-08-05" },
      { "customer_id": "28143", "dow": 1, "date": "2018-08-06" },
      { "customer_id": "28143", "dow": 2, "date": "2018-08-07" },
      { "customer_id": "28143", "dow": 3, "date": "2018-08-08" },
      { "customer_id": "28143", "dow": 4, "date": "2018-08-09" },
      { "customer_id": "28143", "dow": 5, "date": "2018-08-10" },
      { "customer_id": "28143", "dow": 6, "date": "2018-08-11" },
      { "customer_id": "28143", "dow": 1, "date": "2018-08-13" },
      { "customer_id": "28143", "dow": 2, "date": "2018-08-14" },
      { "customer_id": "28143", "dow": 3, "date": "2018-08-15" },
      { "customer_id": "28143", "dow": 4, "date": "2018-08-16" },
      { "customer_id": "28143", "dow": 6, "date": "2018-08-18" },
      { "customer_id": "28143", "dow": 0, "date": "2018-08-19" },
      { "customer_id": "28143", "dow": 1, "date": "2018-08-20" },
      { "customer_id": "28143", "dow": 2, "date": "2018-08-21" },
      { "customer_id": "28143", "dow": 3, "date": "2018-08-22" },
      { "customer_id": "28143", "dow": 4, "date": "2018-08-23" },
      { "customer_id": "28143", "dow": 1, "date": "2018-08-27" },
      { "customer_id": "28143", "dow": 2, "date": "2018-08-28" },
      { "customer_id": "28143", "dow": 4, "date": "2018-08-30" },
      { "customer_id": "28143", "dow": 5, "date": "2018-08-31" },
      { "customer_id": "33871", "dow": 3, "date": "2018-08-01" },
      { "customer_id": "33871", "dow": 4, "date": "2018-08-02" },
      { "customer_id": "33871", "dow": 5, "date": "2018-08-03" },
      { "customer_id": "33871", "dow": 1, "date": "2018-08-06" },
      { "customer_id": "33871", "dow": 3, "date": "2018-08-08" },
      { "customer_id": "33871", "dow": 4, "date": "2018-08-09" },
      { "customer_id": "33871", "dow": 5, "date": "2018-08-10" },
      { "customer_id": "33871", "dow": 1, "date": "2018-08-13" },
      { "customer_id": "33871", "dow": 2, "date": "2018-08-14" },
      { "customer_id": "33871", "dow": 3, "date": "2018-08-15" },
      { "customer_id": "33871", "dow": 4, "date": "2018-08-16" },
      { "customer_id": "33871", "dow": 5, "date": "2018-08-17" },
      { "customer_id": "33871", "dow": 1, "date": "2018-08-20" },
      { "customer_id": "33871", "dow": 2, "date": "2018-08-21" },
      { "customer_id": "33871", "dow": 3, "date": "2018-08-22" },
      { "customer_id": "33871", "dow": 4, "date": "2018-08-23" },
      { "customer_id": "33871", "dow": 5, "date": "2018-08-24" },
      { "customer_id": "33871", "dow": 1, "date": "2018-08-27" },
      { "customer_id": "33871", "dow": 4, "date": "2018-08-30" }
    ];
    registrationDaysPerAcc = {
      "4959": [3],
      "28143": [1, 3, 4, 0],
      "32039": [1, 3, 4, 6]
    };
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should check that the Registrations Frequency service has been registered', () => {
    expect(service).to.be.an('Object');
  });

  /*
   * =======================================================
   * checkAccountHasSettings
   */
  describe('checkAccountHasSettings', () => {
    it('should return True if all settings are set correctly', () => {
      const hasSettings = Frequency.checkAccountHasSettings(settingsPerAccount[0]);
      expect(hasSettings).to.equal(true);
    });

    it('should return False if `expectedFrequency` is not set', () => {
      const hasSettings = Frequency.checkAccountHasSettings(settingsPerAccount[2]);
      expect(hasSettings).to.equal(false);
    });

    it('should return False if `expectedFrequency` is set but empty', () => {
      const hasSettings = Frequency.checkAccountHasSettings(settingsPerAccount[3]);
      expect(hasSettings).to.equal(false);
    });
  });

  /*
   * =======================================================
   * calcNumberOfDOW
   */
  describe('calcNumberOfDOW', () => {
    it('should calculate the number of required DOWs for certain period and list of DOWs', () => {
      const result = Frequency.calcNumberOfDOW('2018-08-13', '2018-08-19', {
        from: '1970-01-01',
        days: [1, 2, 3, 4, 6, 0]
      });
      expect(result.numberOfDOWs).to.deep.equal({ "0": 1, "1": 1, "2": 1, "3": 1, "4": 1, "6": 1 });
      expect(result.expectedDays).to.equal(6);
    });

    it('should calculate the number of required DOWs for certain period and list of DOWs', () => {
      const result = Frequency.calcNumberOfDOW('2018-08-01', '2018-08-09', {
        from: '1970-01-01', days: [1, 3, 5
        ]
      });
      expect(result.numberOfDOWs).to.deep.equal({ "1": 1, "3": 2, "5": 1 });
      expect(result.expectedDays).to.equal(4);
    });

    it('should calculate the number of required DOWs for certain period and list of DOWs', () => {
      const result = Frequency.calcNumberOfDOW('2018-08-01', '2018-08-31', {
        from: '1970-01-01', days: [1, 2, 3, 4, 5
        ]
      });
      expect(result.numberOfDOWs).to.deep.equal({ "1": 4, "2": 4, "3": 5, "4": 5, "5": 5 });
      expect(result.expectedDays).to.equal(23);
    });
  });

  /*
   * =======================================================
   * calcNumberOfRegsToHavePerDOW
   */
  describe('calcNumberOfRegsToHavePerDOW', () => {
    it('should construct objects for regsToHavePerDOW and totals when there is only 1 settings record', () => {
      const settings = [{ from: '1970-01-01', days: [1, 3, 5] }];
      const { regsToHavePerDOW, totals } = Frequency.calcNumberOfRegsToHavePerDOW(settings, '2018-08-13', '2018-08-19');

      expect(regsToHavePerDOW).to.deep.equal({ "1970-01-01": { "1": 1, "3": 1, "5": 1 } });
      expect(totals).to.deep.equal({ expectedDays: 3, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the requested period is after the last settings-change', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-28', '2018-09-04');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-25": { "1": 1, "4": 1, "5": 1 }
      });
      expect(totals).to.deep.equal({ expectedDays: 3, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input start date = settings-change date and the end date is ' +
      'bigger than that same settings-change date', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-10', '2018-08-19');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-10": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2 }
      });
      expect(totals).to.deep.equal({ expectedDays: 6, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input dates are both between 2 settings-change dates', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-11', '2018-08-19');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-10": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 }
      });
      expect(totals).to.deep.equal({ expectedDays: 5, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input start and end dates are respectively smaller and bigger' +
      'than a settings-change date', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-05', '2018-08-19');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-05": { "1": 1, "3": 1, "5": 0 },
        "2018-08-10": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2 }
      });
      expect(totals).to.deep.equal({ expectedDays: 8, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input start and end dates have several settings-changes in between them', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-05', '2018-09-03');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-05": { "1": 1, "3": 1, "5": 0 },
        "2018-08-10": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2 },
        "2018-08-20": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },
        "2018-08-25": { "1": 2, "4": 1, "5": 1 }
      });
      expect(totals).to.deep.equal({ expectedDays: 17, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input start date is bigger than the first 2 settings-changes ' +
      'and the input end date is bigger than anything', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-15', '2018-09-03');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-15": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 },
        "2018-08-20": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1 },
        "2018-08-25": { "1": 2, "4": 1, "5": 1 }
      });
      expect(totals).to.deep.equal({ expectedDays: 12, registeredDays: 0 });
    });

    it('should construct objects for regsToHavePerDOW when the input start date is bigger than the first 2 settings-changes ' +
      'and the input end date is not bigger than the last settings-change date', () => {
      const { regsToHavePerDOW, totals } =
        Frequency.calcNumberOfRegsToHavePerDOW(settingsPerAccount[0].current.expectedFrequency, '2018-08-15', '2018-08-23');

      expect(regsToHavePerDOW).to.deep.equal({
        "2018-08-15": { "1": 0, "2": 0, "3": 1, "4": 1, "5": 1 },
        "2018-08-20": { "1": 1, "2": 1, "3": 1, "4": 1, "5": 0 }
      });
      expect(totals).to.deep.equal({ expectedDays: 7, registeredDays: 0 });
    });
  });

  /*
   * =======================================================
   * getSettingsOfAccounts
   */
  describe('getSettingsOfAccounts', () => {
    it('should retrieve and organize accounts with/without settings when 3 of the accounts have settings and 2 do not', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

      const result = await frequency.getSettingsOfAccounts(accounts, '33871');

      expect(result.settingsPerAccount).to.deep.equal({
        '28143': settingsPerAccount[1].current.expectedFrequency,
        '33871': settingsPerAccount[0].current.expectedFrequency
      });
      expect(result.accountsWithoutSettings).to.deep.equal(accountsWithoutSettings);
      expect(result.accountsToQuery).to.deep.equal(accountsToQuery);
      expect(result.accountNames).to.deep.equal(accountNames);
    });

    it('should throw an error when retrieving accounts settings returns an error', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.reject({ err: 'some err' }));

      try {
        await frequency.getSettingsOfAccounts(accounts, '33871');
      } catch (err) {
        expect(err.message).to.equal('Could not get the Settings for the given set of accounts');
        expect(err.data.errorCode).to.equal('E188');
        expect(err.errors).to.deep.equal({ err: 'some err' });
      }

    });

    it('should throw a 404 error when none of the retrieved accounts has set settings', async () => {
      delete settingsPerAccount[0].current.expectedFrequency;
      delete settingsPerAccount[1].current.expectedFrequency;

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

      try {
        await frequency.getSettingsOfAccounts(accounts, '33871');
      } catch (err) {
        expect(err.message).to.equal('None of the selected accounts have set their registrations frequency ' +
          'and weekly foodwaste settings');
        expect(err.data.errorCode).to.equal('E214');
        expect(err.code).to.equal(404);
        expect(err.data.accounts).to.deep.equal(['33871', '28143', '32039', '4959', '36742']);
        expect(err.data.accountsWithoutSettings).to.deep.equal(['33871', '28143', '36742', '32039', '4959']);
      }
    });
  });

  /*
   * =======================================================
   * combineRegsFrequencyAndTotalsPerAccount
   */
  describe('getSettingsOfAccounts', () => {
    it('should call the function to calculate regsPerDOW and totals and organize them per account', () => {
      const { regsToHavePerDOW, totalsPerAcc } = Frequency.combineRegsFrequencyAndTotalsPerAccount(
        '2018-08-01', '2018-08-31', ['33871', '28143'],
        {
          '28143': settingsPerAccount[1].current.expectedFrequency,
          '33871': settingsPerAccount[0].current.expectedFrequency
        }
      );

      expect(regsToHavePerDOW).to.deep.equal({
        '28143':
          {
            '2018-08-01': { '1': 1, '3': 2, '5': 1 },
            '2018-08-10': { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '6': 3 }
          },
        '33871':
          {
            '2018-08-01': { '1': 1, '3': 2, '5': 1 },
            '2018-08-10': { '1': 1, '2': 1, '3': 1, '4': 1, '5': 2 },
            '2018-08-20': { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 },
            '2018-08-25': { '1': 1, '4': 1, '5': 1 }
          }
      });
      expect(totalsPerAcc).to.deep.equal({
        '28143': { expectedDays: 22, registeredDays: 0 },
        '33871': { expectedDays: 18, registeredDays: 0 }
      });
    });
  });


  /*
   * =======================================================
   * getDaysWithRegistrations
   */
  describe('getDaysWithRegistrations', () => {
    it('should retrieve registration days for a set of accounts and organize the regs in customer-to-DOWs manner', async () => {
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const result = await frequency.getDaysWithRegistrations(accountsToQuery, '2018-08-01', '2018-08-31');
      expect(result).to.deep.equal(registrations);
    });

    it('should throw an error when retrieving registration days for accounts returns an error', () => {
      sandbox.stub(sequelize, 'query').returns(Promise.reject({ err: 'some err' }));

      return frequency.getDaysWithRegistrations(accountsToQuery, '2018-08-01', '2018-08-31')
        .catch(err => {
          expect(err.message).to.equal('Could not get registrations for the subscribed customers in a given period');
          expect(err.data.errorCode).to.equal('E189');
          expect(err.errors).to.deep.equal({ err: 'some err' });
        });
    });
  });

  /*
   * =======================================================
   * calcOnTargetAndValue
   */
  describe('calcOnTargetAndValue', () => {
    it('should calculate and return onTarget = true and frequency value = 150 when expected and reg days are equal', () => {
      const result = Frequency.calcOnTargetAndValue(70, 70);
      expect(result.onTarget).to.equal(true);
      expect(result.frequency).to.equal(150);
    });

    it('should calculate and return onTarget = false and frequency value = 51 when expected days = 70 and reg days are 36', () => {
      const result = Frequency.calcOnTargetAndValue(70, 36);
      expect(result.onTarget).to.equal(false);
      expect(result.frequency).to.equal(51);
    });
  });

  /*
   * =======================================================
   * buildResponse
   */
  describe('buildResponse', () => {
    it('should construct a final response object with 150 on-target for one and 41 not on-target for the other account', () => {
      totalsPerAcc['28143'].registeredDays = 9;
      totalsPerAcc['33871'].registeredDays = 18; // the expected days is 18 in the totalsPerAcc for this account

      const response = Frequency.buildResponse(totalsPerAcc, accountNames);

      expect(response.onTarget).to.equal(false);
      expect(response.pointerLocation).to.equal(68);
      expect(response.accounts).to.deep.equal([
        {
          "accountId": "28143",
          "onTarget": false,
          "frequency": 41,
          "name": "Company 5",
          "trend": []
        },
        {
          "accountId": "33871",
          "onTarget": true,
          "frequency": 150,
          "name": "Customer 1",
          "trend": []
        }
      ]);
    });

    it('should construct a final response object with 150 on-target for both accounts and overall result', () => {
      totalsPerAcc['28143'].registeredDays = 22; // the expected days are also 22
      totalsPerAcc['33871'].registeredDays = 18; // the expected days is 18 in the totalsPerAcc for this account

      const response = Frequency.buildResponse(totalsPerAcc, accountNames);

      expect(response.onTarget).to.equal(true);
      expect(response.pointerLocation).to.equal(150);
      expect(response.accounts).to.deep.equal([
        {
          "accountId": "28143",
          "onTarget": true,
          "frequency": 150,
          "name": "Company 5",
          "trend": []
        },
        {
          "accountId": "33871",
          "onTarget": true,
          "frequency": 150,
          "name": "Customer 1",
          "trend": []
        }
      ]);
    });
  });

  /*
   * =======================================================
   * buildTrends
   */
  describe('buildTrends', () => {
    it('should build a trend per account', async () => {
      Frequency.periodFormatter = (start) => {
        return `${moment(start).format('YYYY-MM')}`;
      };

      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const trendPerAcc = await frequency.buildTrends('2018-08-01', '2018-08-30', accountsToQuery,
        {
          '28143': settingsPerAccount[1].current.expectedFrequency,
          '33871': settingsPerAccount[0].current.expectedFrequency
        });

      expect(trendPerAcc).to.deep.equal({
        '28143': { onTarget: false, percentage: 82, periodLabel: '2018-08' },
        '33871': { onTarget: true, percentage: 150, periodLabel: '2018-08' }
      });
    });
  });


  /*
   * =======================================================
   * calcRegsFrequencyPerAccount
   */
  describe('calcRegsFrequencyPerAccount', () => {
    it('should update the totals data of each account by matching registrations and regs to have per DOW', () => {
      Frequency.calcRegsFrequencyPerAccount(registrations, totalsPerAcc, regsToHavePerDOW);

      expect(totalsPerAcc).to.deep.equal({
        "28143": { "expectedDays": 22, "registeredDays": 18 },
        "33871": { "expectedDays": 18, "registeredDays": 17 }
      });
    });
  });

  /*
   * =======================================================
   * the main find() function
   */
  describe('the main find() function', () => {
    it('should return calculated frequency from the main class function with value < 100 when it is NOT on target', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const res = await frequency.find({
        query: { start: '2018-08-01', end: '2018-08-31', accounts: '33871,28143,32039,4959,36742', customerId: '33871' }
      });
      expect(res.onTarget).to.equal(false);
      expect(res.pointerLocation).to.equal(88);
      expect(res.accounts).to.deep.equal([
        {
          "accountId": "28143",
          "onTarget": false,
          "frequency": 82,
          "name": "Company 5",
          "trend": []
        },
        {
          "accountId": "33871",
          "onTarget": false,
          "frequency": 94,
          "name": "Customer 1",
          "trend": []
        }
      ]);
      expect(res.accountsWithoutSettings).to.deep.equal(accountsWithoutSettings);
    });


    it('should return calculated frequency from the main class function with value = 150 when it IS on target', async () => {
      registrations = [
        { "customer_id": "28143", "dow": 1, "date": "2018-08-13" },
        { "customer_id": "28143", "dow": 2, "date": "2018-08-14" },
        { "customer_id": "28143", "dow": 3, "date": "2018-08-15" },
        { "customer_id": "28143", "dow": 4, "date": "2018-08-16" },
        { "customer_id": "28143", "dow": 6, "date": "2018-08-18" },
        { "customer_id": "28143", "dow": 0, "date": "2018-08-19" },
        { "customer_id": "33871", "dow": 1, "date": "2018-08-13" },
        { "customer_id": "33871", "dow": 2, "date": "2018-08-14" },
        { "customer_id": "33871", "dow": 3, "date": "2018-08-15" },
        { "customer_id": "33871", "dow": 4, "date": "2018-08-16" },
        { "customer_id": "33871", "dow": 5, "date": "2018-08-17" }
      ];

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const res = await frequency.find({
        query: {
          start: '2018-08-13', end: '2018-08-19', accounts: '33871,28143,32039,4959,36742', customerId: '33871'
        }
      });

      expect(res.onTarget).to.equal(true);
      expect(res.pointerLocation).to.equal(150);
      expect(res.accounts).to.deep.equal([
        {
          "accountId": "28143",
          "onTarget": true,
          "frequency": 150,
          "name": "Company 5",
          "trend": []
        },
        {
          "accountId": "33871",
          "onTarget": true,
          "frequency": 150,
          "name": "Customer 1",
          "trend": []
        }
      ]);
      expect(res.accountsWithoutSettings).to.deep.equal(accountsWithoutSettings);
    });

    it('should return calculated frequency when there are no accounts provided in the input', async () => {
      const settings = [settingsPerAccount[0]]; // leave only the first account in the settings
      registrations = [
        { "customer_id": "33871", "dow": 1, "date": "2018-08-13" },
        { "customer_id": "33871", "dow": 2, "date": "2018-08-14" },
        { "customer_id": "33871", "dow": 3, "date": "2018-08-15" },
        { "customer_id": "33871", "dow": 4, "date": "2018-08-16" },
        { "customer_id": "33871", "dow": 5, "date": "2018-08-17" }
      ];

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settings));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const res = await frequency.find({ query: { start: '2018-08-13', end: '2018-08-19', customerId: '33871' } });

      expect(res.onTarget).to.equal(true);
      expect(res.pointerLocation).to.equal(150);
      expect(res.accounts).to.deep.equal([{
        accountId: '33871',
        onTarget: true,
        frequency: 150,
        name: 'Customer 1',
        trend: []
      }]);
      expect(res.accountsWithoutSettings).to.deep.equal(undefined);
    });

    it('should 150 "on-target" frequency for an OPEN period when there are regs for each day until today', async () => {
      const settings = [settingsPerAccount[0]]; // leave only the first account in the settings
      settings[0].current.expectedFrequency = [{ from: '1970-01-01', days: [1, 2, 3, 4, 5, 6, 0] }];

      /*
       * Since we test for an open period, we use today's date. For that purpose, we have to make the test dynamic, in
       * regards to dates.
       */
      const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const fourDaysAhead = moment().add(4, 'days').format('YYYY-MM-DD');

      registrations = [
        { "customer_id": "33871", "dow": moment(twoDaysAgo).day(), "date": twoDaysAgo },
        { "customer_id": "33871", "dow": moment(oneDayAgo).day(), "date": oneDayAgo },
        { "customer_id": "33871", "dow": moment(today).day(), "date": today },
      ];

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settings));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve(registrations));

      const res = await frequency.find({ query: { start: twoDaysAgo, end: fourDaysAhead, customerId: '33871' } });

      expect(res.onTarget).to.equal(true);
      expect(res.pointerLocation).to.equal(150);
      expect(res.accounts).to.deep.equal([{
        accountId: '33871',
        onTarget: true,
        frequency: 150,
        name: 'Customer 1',
        trend: []
      }]);
      expect(res.accountsWithoutSettings).to.deep.equal(undefined);
    });

    it('should return an error from the main class function when retrieving the accounts settings throws an error', () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.reject({ err: 'some err' }));

      return frequency.find({
        query: {
          start: '2018-08-13', end: '2018-08-19', accounts: '28143,32039,4959,36742', customerId: '33871'
        }
      })
        .catch(err => {
          expect(err.message).to.equal('Could not get the Settings for the given set of accounts');
          expect(err.data.errorCode).to.equal('E188');
          expect(err.errors).to.deep.equal({ err: 'some err' });
        });
    });

    it('should return an error from the main class function when retrieving the registration days throws an error', () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));
      sandbox.stub(sequelize, 'query').returns(Promise.reject({ err: 'some err' }));

      return frequency.find({
        query: {
          start: '2018-08-13', end: '2018-08-19', accounts: '28143,32039,4959,36742', customerId: '33871'
        }
      })
        .catch(err => {
          expect(err.message).to.equal('Could not get registrations for the subscribed customers in a given period');
          expect(err.data.errorCode).to.equal('E189');
          expect(err.errors).to.deep.equal({ err: 'some err' });
        });
    });

    it('should return a full response object with trend with period of weeks', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));
      const regsQueryStub = sandbox.stub(sequelize, 'query');

      regsQueryStub.onCall(0).returns(Promise.resolve([ // 2018-08-13 --> 2018-08-19
        { "customer_id": "28143", "dow": 1, "date": "2018-08-13" },
        { "customer_id": "28143", "dow": 2, "date": "2018-08-14" },
        { "customer_id": "28143", "dow": 3, "date": "2018-08-15" },
        { "customer_id": "28143", "dow": 4, "date": "2018-08-16" },
        { "customer_id": "28143", "dow": 6, "date": "2018-08-18" },
        { "customer_id": "28143", "dow": 0, "date": "2018-08-19" },
        { "customer_id": "33871", "dow": 1, "date": "2018-08-13" },
        { "customer_id": "33871", "dow": 2, "date": "2018-08-14" },
        { "customer_id": "33871", "dow": 3, "date": "2018-08-15" },
        { "customer_id": "33871", "dow": 4, "date": "2018-08-16" },
        { "customer_id": "33871", "dow": 5, "date": "2018-08-17" }
      ]));
      regsQueryStub.onCall(1).returns(Promise.resolve([ // 2018-08-06 --> 2018-08-12
        { "customer_id": "28143", "dow": 1, "date": "2018-08-06" },
        { "customer_id": "28143", "dow": 2, "date": "2018-08-07" },
        { "customer_id": "28143", "dow": 3, "date": "2018-08-08" },
        { "customer_id": "28143", "dow": 4, "date": "2018-08-09" },
        { "customer_id": "28143", "dow": 5, "date": "2018-08-10" },
        { "customer_id": "28143", "dow": 6, "date": "2018-08-11" },
        { "customer_id": "33871", "dow": 1, "date": "2018-08-06" },
        { "customer_id": "33871", "dow": 3, "date": "2018-08-08" },
        { "customer_id": "33871", "dow": 4, "date": "2018-08-09" },
        { "customer_id": "33871", "dow": 5, "date": "2018-08-10" }
      ]));
      regsQueryStub.onCall(2).returns(Promise.resolve([ // 2018-07-30 --> 2018-08-05
        { "customer_id": "28143", "dow": 1, "date": "2018-07-30" },
        { "customer_id": "28143", "dow": 2, "date": "2018-07-31" },
        { "customer_id": "28143", "dow": 3, "date": "2018-08-01" },
        { "customer_id": "28143", "dow": 4, "date": "2018-08-02" },
        { "customer_id": "28143", "dow": 5, "date": "2018-08-03" },
        { "customer_id": "28143", "dow": 6, "date": "2018-08-04" },
        { "customer_id": "28143", "dow": 0, "date": "2018-08-05" },
        { "customer_id": "33871", "dow": 1, "date": "2018-07-30" },
        { "customer_id": "33871", "dow": 2, "date": "2018-07-31" },
        { "customer_id": "33871", "dow": 3, "date": "2018-08-01" },
        { "customer_id": "33871", "dow": 4, "date": "2018-08-02" },
        { "customer_id": "33871", "dow": 5, "date": "2018-08-03" }
      ]));
      regsQueryStub.onCall(3).returns(Promise.resolve([ // 2018-07-23 --> 2018-07-29
        { "customer_id": "28143", "dow": 1, "date": "2018-07-23" },
        { "customer_id": "28143", "dow": 2, "date": "2018-07-24" },
        { "customer_id": "28143", "dow": 3, "date": "2018-07-25" },
        { "customer_id": "28143", "dow": 4, "date": "2018-07-26" },
        { "customer_id": "28143", "dow": 5, "date": "2018-07-27" },
        { "customer_id": "28143", "dow": 6, "date": "2018-07-28" },
        { "customer_id": "28143", "dow": 0, "date": "2018-07-29" },
        { "customer_id": "33871", "dow": 1, "date": "2018-07-23" },
        { "customer_id": "33871", "dow": 2, "date": "2018-07-24" },
        { "customer_id": "33871", "dow": 3, "date": "2018-07-25" }
      ]));
      regsQueryStub.onCall(4).returns(Promise.resolve([ // 2018-07-16 --> 2018-07-22
        { "customer_id": "28143", "dow": 1, "date": "2018-07-16" },
        { "customer_id": "28143", "dow": 2, "date": "2018-07-17" },
        { "customer_id": "28143", "dow": 4, "date": "2018-07-19" },
        { "customer_id": "28143", "dow": 5, "date": "2018-07-20" },
        { "customer_id": "28143", "dow": 6, "date": "2018-07-21" },
        { "customer_id": "28143", "dow": 0, "date": "2018-07-22" },
        { "customer_id": "33871", "dow": 1, "date": "2018-07-16" },
        { "customer_id": "33871", "dow": 2, "date": "2018-07-17" },
        { "customer_id": "33871", "dow": 3, "date": "2018-07-18" },
        { "customer_id": "33871", "dow": 4, "date": "2018-07-19" },
        { "customer_id": "33871", "dow": 5, "date": "2018-07-20" }

      ]));
      regsQueryStub.onCall(5).returns(Promise.resolve([ // 2018-07-09 --> 2018-07-15
        { "customer_id": "28143", "dow": 1, "date": "2018-07-09" },
        { "customer_id": "28143", "dow": 2, "date": "2018-07-10" },
        { "customer_id": "28143", "dow": 4, "date": "2018-07-12" },
        { "customer_id": "28143", "dow": 5, "date": "2018-07-13" },
        { "customer_id": "28143", "dow": 6, "date": "2018-07-14" },
        { "customer_id": "28143", "dow": 0, "date": "2018-07-15" },
        { "customer_id": "33871", "dow": 1, "date": "2018-07-09" },
        { "customer_id": "33871", "dow": 2, "date": "2018-07-10" },
        { "customer_id": "33871", "dow": 3, "date": "2018-07-11" },
        { "customer_id": "33871", "dow": 4, "date": "2018-07-12" },
        { "customer_id": "33871", "dow": 5, "date": "2018-07-13" }
      ]));

      const res = await frequency.find({
        query: {
          start: '2018-08-13',
          end: '2018-08-19',
          accounts: '33871,28143,32039,4959,36742',
          period: 'week',
          customerId: '33871'
        }
      });

      expect(res.onTarget).to.equal(true);
      expect(res.pointerLocation).to.equal(150);
      expect(res.accounts).to.deep.equal([
        {
          "accountId": "28143",
          "onTarget": true,
          "frequency": 150,
          "name": "Company 5",
          "trend": [
            { onTarget: false, percentage: 75, periodLabel: '32' },
            { onTarget: true, percentage: 150, periodLabel: '31' },
            { onTarget: true, percentage: 150, periodLabel: '30' },
            { onTarget: false, percentage: 67, periodLabel: '29' },
            { onTarget: false, percentage: 67, periodLabel: '28' }
          ]
        },
        {
          "accountId": "33871",
          "onTarget": true,
          "frequency": 150,
          "name": "Customer 1",
          "trend": [
            { onTarget: true, percentage: 150, periodLabel: '32' },
            { onTarget: true, percentage: 150, periodLabel: '31' },
            { onTarget: false, percentage: 67, periodLabel: '30' },
            { onTarget: true, percentage: 150, periodLabel: '29' },
            { onTarget: true, percentage: 150, periodLabel: '28' }
          ]
        }
      ]);
      expect(res.accountsWithoutSettings).to.deep.equal(accountsWithoutSettings);
    });
  });

});
