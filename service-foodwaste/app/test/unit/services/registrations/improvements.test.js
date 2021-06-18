'use strict';

const expect = require('chai').expect;
const Improvements = require('../../../../src/services/registrations/improvements').default;
const sinon = require('sinon');
const app = require('../../../../src/app').default;
const moment = require('moment').utc;

describe('Registrations service - improvements endpoint', () => {
  const service = app.service('/registrations/improvements');
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');
  const improvements = new Improvements(app);
  Improvements.periodFormatter = (start) => {
    return `${moment(start).format('WW')}`;
  };

  let settings, accounts, accountsToQuery, settingsPerAccount, accountsWithoutSettings,
    registrations, accountNames, paramsObj, averageCostPerAcc;

  beforeEach(() => {
    accounts = ['33871', '28143', '32039', '4959', '36742'];
    accountsToQuery = ['33871', '28143'];
    accountsWithoutSettings = ['36742', '32039', '4959'];
    settings = [
      {                             // index 0
        'customerId': '33871', // the account of the current user
        'current': {
          'name': 'Customer 1',
          'accounts': [
            { id: 28143, name: 'Company 2' },
            { id: 36742, name: 'Company 5' },
            { id: 32039, name: 'Company 3' },
            { id: 4959, name: 'Company 4' }
          ],
          'expectedWeeklyWaste': {
            '0': 123000,
            '2018-08-10': 456000,
            '2018-08-20': 654000,
            '2018-08-25': 321000
          }
        }
      },
      {                             // index 1
        'customerId': '28143',
        'current': {
          'name': 'Company 2',
          'expectedWeeklyWaste': {
            '0': 456000,
            '2018-08-17': 123000,
            '2018-08-29': 321000
          }
        }
      },
      {                             // index 2
        'customerId': '36742',
        'current': {}
      },
      {                             // index 3
        'customerId': '32039',
        'current': {
          'expectedWeeklyWaste': {}
        }
      },
      {                             // index 4
        'customerId': '4959',
        'current': {
          'registrationsFrequency': {
            '0': [1, 3, 5],
            '2018-08-10': [1, 2, 3, 4, 6, 0]
          }
        }
      }
    ];
    registrations = [
      { "customerId": "28143", "cost": "370251", "date": "2018-08-13" },
      { "customerId": "28143", "cost": "273700", "date": "2018-08-14" },
      { "customerId": "28143", "cost": "405450", "date": "2018-08-15" },
      { "customerId": "28143", "cost": "244771", "date": "2018-08-16" },
      { "customerId": "28143", "cost": "536100", "date": "2018-08-18" },
      { "customerId": "28143", "cost": "297176", "date": "2018-08-19" },
      { "customerId": "33871", "cost": "16250", "date": "2018-08-13" },
      { "customerId": "33871", "cost": "19600", "date": "2018-08-14" },
      { "customerId": "33871", "cost": "8050", "date": "2018-08-15" },
      { "customerId": "33871", "cost": "12700", "date": "2018-08-16" },
      { "customerId": "33871", "cost": "13400", "date": "2018-08-17" }
    ];
    settingsPerAccount = {
      "28143": settings[1].current.expectedWeeklyWaste,
      "33871": settings[0].current.expectedWeeklyWaste
    };
    accountNames = {
      '28143': 'Company 2',
      '33871': 'Customer 1'
    };
    paramsObj = {
      start: '2018-08-13',
      end: '2018-08-19',
      accountIds: accountsToQuery
    };
    averageCostPerAcc = { "28143": 7.9, "33871": 3.25 };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should check that the Registrations Improvements service has been registered', () => {
    expect(service).to.be.an('Object');
  });

  /*
   * =======================================================
   * checkAccountHasSettings
   */
  describe('checkAccountHasSettings()', () => {
    it('should return True if all settings are set correctly', () => {
      const hasSettings = Improvements.checkAccountHasSettings(settings[0]);
      expect(hasSettings).to.equal(true);
    });

    it('should return False if `expectedWeeklyWaste` is not set', () => {
      const hasSettings = Improvements.checkAccountHasSettings(settings[2]);
      expect(hasSettings).to.equal(false);
    });

    it('should return False if `expectedWeeklyWaste` is set but empty', () => {
      const hasSettings = Improvements.checkAccountHasSettings(settings[3]);
      expect(hasSettings).to.equal(false);
    });
  });

  /*
   * =======================================================
   * calcNumberOfDays
   */
  describe('calcNumberOfDays()', () => {
    it('should return 7 for calculating the number of days between 27th Aug and 2nd Sept', () => {
      const days = Improvements.calcNumberOfDays('2018-08-27', '2018-09-02');
      expect(days).to.equal(7);
    });
  });

  /*
   * =======================================================
   * calcDaysUntilNow
   */
  describe('calcDaysUntilNow()', () => {
    it('should return 5 for calculating the number of days from 4 days ago to until today', () => {
      const fourDaysAgo = moment().subtract(4, 'days').format('YYYY-MM-DD');
      const twoDaysAhead = moment().add(2, 'days').format('YYYY-MM-DD');
      const days = Improvements.calcDaysUntilNow(fourDaysAgo, twoDaysAhead);
      expect(days).to.equal(5);
    });

    it('should return 7 for calculating the number of days when the end date is < today', () => {
      const fourDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const days = Improvements.calcDaysUntilNow(fourDaysAgo, oneDayAgo);
      expect(days).to.equal(7);
    });
  });

  /*
   * =======================================================
   * formatImprovementValue
   */
  describe('formatImprovementValue()', () => {
    it('should return 0 when the provided improvement value is a negative number', () => {
      const value = Improvements.formatImprovementValue(-123);
      expect(value).to.equal(0);
    });

    it('should return the provided value, but rounded when it is a positive number', () => {
      const value = Improvements.formatImprovementValue(123.5);
      expect(value).to.equal(124);
    });
  });

  /*
   * =======================================================
   * matchAccIdToName
   */
  describe('matchAccIdToName()', () => {
    it('should return an array of objects with ID and name when given ids and names separately', () => {
      const result = Improvements.matchAccIdToName(accountsToQuery, accountNames);

      expect(result).to.deep.equal([
        { id: '33871', name: 'Customer 1' },
        { id: '28143', name: 'Company 2' }
      ]);
    });
  });

  /*
   * =======================================================
   * formatForecastValue
   */
  describe('formatForecastValue()', () => {
    it('should return 0 when the provided improvement value is a negative number', () => {
      const value = Improvements.formatForecastValue(-123);
      expect(value).to.equal(0);
    });

    it('should return the provided value, but rounded when it is a positive number', () => {
      const value = Improvements.formatForecastValue(123.5);
      expect(value).to.equal(124);
    });

    it('should return "undefined" when the provided value is "undefined"', () => {
      const value = Improvements.formatForecastValue(undefined);
      expect(value).to.equal(undefined);
    });
  });

  /*
   * =======================================================
   * calcForecastedCost
   */
  describe('calcForecastedCost()', () => {
    it('should return "undefined" when the end date is < today, which means it is a closed period', () => {
      const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');

      const value = Improvements.calcForecastedCost(sevenDaysAgo, oneDayAgo, 123, 7);
      expect(value).to.equal(undefined);
    });

    it('should return 172 when it is an open period with 5 out of 7 days until now', () => {
      const fourDaysAgo = moment().subtract(4, 'days').format('YYYY-MM-DD');
      const twoDaysAhead = moment().add(2, 'days').format('YYYY-MM-DD');

      const value = Improvements.calcForecastedCost(fourDaysAgo, twoDaysAhead, 123, 7);
      expect(value).to.equal(172);
    });
  });

  /*
   * =======================================================
   * calcExpectedCost
   */
  describe('calcExpectedCost()', () => {
    it('should return 307500 for 123000 weight and 2.5 average cost when it is a closed period', () => {
      // the formula is: (X * C)
      const fourDaysAgo = moment().subtract(4, 'days').format('YYYY-MM-DD');
      const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');

      const value = Improvements.calcExpectedCost(fourDaysAgo, oneDayAgo, 123000, 2.5, 7);
      expect(value).to.equal(307500);
    });

    it('should return 219643 for 123000 weight and 2.5 average cost when it is a open period', () => {
      // the formula is: (( X / D) * d ) * C ) smart formula
      const fourDaysAgo = moment().subtract(4, 'days').format('YYYY-MM-DD');
      const twoDaysAhead = moment().add(2, 'days').format('YYYY-MM-DD');

      const value = Improvements.calcExpectedCost(fourDaysAgo, twoDaysAhead, 123000, 2.5, 7);
      expect(value).to.equal(219643);
    });
  });

  /*
   * =======================================================
   * calcExpectedDailyWasteForPeriod
   */
  describe('calcExpectedDailyWasteForPeriod()', () => {
    it('should return 52714.28571428572 as a daily waste for weekly waste of 123000 and 3 days in the period', () => {
      // the formula is: (X / 7) * d
      const value = Improvements.calcExpectedDailyWasteForPeriod(123000, 3);
      expect(value).to.equal(52714.28571428572);
    });
  });

  /*
   * =======================================================
   * getSettingsOfAccounts
   */
  describe('getSettingsOfAccounts()', () => {
    it('should throw an error when retrieving accounts settings returns an error', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.reject({ err: 'some err' }));

      try {
        await improvements.getSettingsOfAccounts(accounts, '33871');
      } catch (err) {
        expect(err.message).to.equal('Could not get the Settings for the given set of accounts');
        expect(err.data.errorCode).to.equal('E198');
        expect(err.errors).to.deep.equal({ err: 'some err' });
      }
    });

    it('should throw a 404 error when none of the retrieved accounts has set settings', async () => {
      delete settings[0].current.expectedWeeklyWaste;
      delete settings[1].current.expectedWeeklyWaste;

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settings));

      try {
        await improvements.getSettingsOfAccounts(accounts, '33871');
      } catch (err) {
        expect(err.message).to.equal('None of the selected accounts have set their expected weekly waste settings');
        expect(err.data.errorCode).to.equal('E213');
        expect(err.code).to.equal(404);
        expect(err.data.accounts).to.deep.equal(['33871', '28143', '32039', '4959', '36742']);
        expect(err.data.accountsWithoutSettings).to.deep.equal(['33871', '28143', '36742', '32039', '4959']);
      }
    });

    it('should retrieve and organize accounts with/without settings when 3 of the accounts have settings and 2 do not', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settings));

      const result = await improvements.getSettingsOfAccounts(accounts, '33871');

      expect(result.settingsPerAccount).to.deep.equal(settingsPerAccount);
      expect(result.accountsWithoutSettings).to.deep.equal(accountsWithoutSettings);
      expect(result.accountsToQuery).to.deep.equal(accountsToQuery);
      expect(result.accountNames).to.deep.equal(accountNames);
    });
  });

  /*
   * =======================================================
   * getAccountsWithoutEnoughRegs
   */
  describe('getAccountsWithoutEnoughRegs()', () => {
    it('should throw an error getting the number of registration days for accounts returns an error', async () => {
      sandbox.stub(sequelize, 'query').returns(Promise.reject({ err: 'some err' }));

      try {
        await improvements.getAccountsWithoutEnoughRegs(paramsObj);
      } catch (err) {
        expect(err.message).to.equal('Could not retrieve accounts to check whether they have enough registrations');
        expect(err.data.errorCode).to.equal('E211');
        expect(err.errors).to.deep.equal({ err: 'some err' });
      }
    });

    it('should return "undefined" when there are no accounts which do not meet the min regs % requirement', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "6" },
        { customer_id: "33871", registrationdaysforperiod: "5" }
      ]));

      const accountsWithoutEnoughRegs = await improvements.getAccountsWithoutEnoughRegs(paramsObj);

      expect(logStub.calledOnce).to.equal(false);
      expect(accountsWithoutEnoughRegs).to.deep.equal(undefined);
    });

    it('return a list of accounts which do not meet the min regs % requirement', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "1" },
        { customer_id: "33871", registrationdaysforperiod: "2" }
      ]));

      const accountsWithoutEnoughRegs = await improvements.getAccountsWithoutEnoughRegs(paramsObj);

      expect(logStub.calledOnce).to.equal(true);
      expect(accountsWithoutEnoughRegs).to.deep.equal(['28143', '33871']);
    });

    it('return all accounts as not meeting requirement, when they have no regs at all (in DB)', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([])); // empty response from DB means no regs at all for account(s)

      const accountsWithoutEnoughRegs = await improvements.getAccountsWithoutEnoughRegs(paramsObj);

      expect(logStub.calledOnce).to.equal(true);
      expect(accountsWithoutEnoughRegs).to.deep.equal(['33871', '28143']);
    });

    it('return some accounts as not meeting requirement, when some accounts have no regs at all (in DB)', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "6" }
      ])); // we request 3 accounts, but get data only for 1. This means that the other 2 have no regs at all.

      paramsObj.accountIds.push('32067');

      const accountsWithoutEnoughRegs = await improvements.getAccountsWithoutEnoughRegs(paramsObj);

      expect(logStub.calledOnce).to.equal(true);
      expect(accountsWithoutEnoughRegs).to.deep.equal(['33871', '32067']);
    });

    it('return all accounts as not meeting requirement, when one account has not enough regs and the others have no regs at all (in DB)', async () => {
      const logStub = sandbox.stub(log, 'warn');
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "1" } // but has not enough regs for the period
      ])); // we request 3 accounts, but get data only for 1. This means that the other 2 have no regs at all.

      paramsObj.accountIds.push('32067');

      const accountsWithoutEnoughRegs = await improvements.getAccountsWithoutEnoughRegs(paramsObj);

      expect(logStub.calledOnce).to.equal(true);
      expect(accountsWithoutEnoughRegs).to.deep.equal(['28143', '33871', '32067']);
    });
  });

  /*
   * =======================================================
   * calcExpectedWasteWeightPerPeriod
   */
  describe('calcExpectedWasteWeightPerPeriod()', () => {
    it('should construct objects for total and daily waste when there is only 1 settings record', () => {
      const settings = { '0': 123000 };
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings, '2018-08-13', '2018-08-19');

      expect(totalExpectedWaste).to.equal(123000);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-13':
          {
            dailyWaste: 17571.428571428572,
            expectedDays: 7,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the requested period is after the last settings-change', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-28', '2018-09-04');

      expect(totalExpectedWaste).to.equal(366857.14285714284);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-28':
          {
            dailyWaste: 45857.142857142855,
            expectedDays: 8,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the Start date = settings-change date and the End date is ' +
      'bigger than that same settings-change date', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-10', '2018-08-19');

      expect(totalExpectedWaste).to.equal(651428.5714285715);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-10':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 10,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the input dates are both between 2 settings-change dates', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-11', '2018-08-19');

      expect(totalExpectedWaste).to.equal(586285.7142857143);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-11':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 9,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the Start and End dates are respectively smaller and bigger' +
      'than a settings-change date', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-05', '2018-08-19');

      expect(totalExpectedWaste).to.equal(739285.7142857143);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-05':
          {
            dailyWaste: 17571.428571428572,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-10':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 10,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the Start and End dates have several settings-changes in between them', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-05', '2018-09-03');

      expect(totalExpectedWaste).to.equal(1665000);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-05':
          {
            dailyWaste: 17571.428571428572,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-10':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 10,
            registeredDays: 0
          },
        '2018-08-20':
          {
            dailyWaste: 93428.57142857143,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-25':
          {
            dailyWaste: 45857.142857142855,
            expectedDays: 10,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the Start date is bigger than the first 2 settings-changes ' +
      'and the End date is bigger than anything', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-15', '2018-09-03');

      expect(totalExpectedWaste).to.equal(1251428.5714285714);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-15':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-20':
          {
            dailyWaste: 93428.57142857143,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-25':
          {
            dailyWaste: 45857.142857142855,
            expectedDays: 10,
            registeredDays: 0
          }
      });
    });

    it('should construct objects for total and daily waste when the Start date is bigger than the first 2 settings-changes ' +
      'and the End date is not bigger than the last settings-change date', () => {
      const { totalExpectedWaste, expectedDailyWaste } =
        Improvements.calcExpectedWasteWeightPerPeriod(settings[0].current.expectedWeeklyWaste, '2018-08-15', '2018-08-23');

      expect(totalExpectedWaste).to.equal(699428.5714285715);
      expect(expectedDailyWaste).to.deep.equal({
        '2018-08-15':
          {
            dailyWaste: 65142.857142857145,
            expectedDays: 5,
            registeredDays: 0
          },
        '2018-08-20':
          {
            dailyWaste: 93428.57142857143,
            expectedDays: 4,
            registeredDays: 0
          }
      });
    });
  });

  /*
   * =======================================================
   * getActualWasteCost
   */
  describe('getActualWasteCost()', () => {
    it('should throw an error when getting the registrations returns an error', async () => {
      sandbox.stub(sequelize.models.registration, 'findAll').returns(Promise.reject({ err: 'some err' }));
      try {
        await improvements.getActualWasteCost(paramsObj, {}, {});
      } catch (err) {
        expect(err.message).to.equal('Could not retrieve actual food waste cost per account');
        expect(err.data.errorCode).to.equal('E212');
      }
    });

    it('should return constructed and calculated actual cost of waste for two accounts', async () => {
      sandbox.stub(sequelize.models.registration, 'findAll').returns(Promise.resolve(registrations));
      const expectedDailyWaste = {
        "28143": {
          "2018-08-13": {
            "dailyWaste": 65142.857142857145,
            "expectedDays": 7,
            "registeredDays": 0
          }
        },
        "33871": {
          "2018-08-13": {
            "dailyWaste": 65142.857142857145,
            "expectedDays": 7,
            "registeredDays": 0
          }
        }
      };

      const actualWasteCost = await improvements.getActualWasteCost(paramsObj, expectedDailyWaste, averageCostPerAcc);
      expect(actualWasteCost).to.deep.equal({
        "28143": 2642076.5714285714,
        "33871": 493428.5714285714
      });
    });
  });

  /*
   * =======================================================
   * combineExpectedWasteWeightPerAccount
   */
  describe('combineExpectedWasteWeightPerAccount()', () => {
    it('should construct two objects: for the total and the daily expected waste per account', () => {
      const [total, daily] = Improvements.combineExpectedWasteWeightPerAccount(paramsObj, settingsPerAccount);

      expect(total).to.deep.equal({
        "28143": 313285.7142857143,
        "33871": 456000
      });
      expect(daily).to.deep.equal({
        "28143": {
          "2018-08-13": {
            "dailyWaste": 65142.857142857145,
            "expectedDays": 4,
            "registeredDays": 0
          },
          "2018-08-17": {
            "dailyWaste": 17571.428571428572,
            "expectedDays": 3,
            "registeredDays": 0
          }
        },
        "33871": {
          "2018-08-13": {
            "dailyWaste": 65142.857142857145,
            "expectedDays": 7,
            "registeredDays": 0
          }
        }
      });
    });
  });

  /*
   * =======================================================
   * getAverageCost
   */
  describe('getAverageCost()', () => {
    it('should return average cost of registration points for two accounts', async () => {
      sandbox.stub(sequelize.models.registration_point, 'findAll').resolves([
        { "customerId": "33871", "median": 3250 },
        { "customerId": "28143", "median": 7900 }
      ]);

      const result = await improvements.getAverageCost(paramsObj.accountIds);
      expect(result).to.deep.equal({ averageCostPerAcc, accToVerifyRegistrationPoints: undefined });
    });

    it('should throw an error when getting the average cost across registration points returns an error', async () => {
      sandbox.stub(sequelize.models.registration_point, 'findAll').rejects({ err: 'some err' });
      try {
        await improvements.getAverageCost(paramsObj.accountIds);
      } catch (err) {
        expect(err.message).to.equal('Could not get the average cost across registration points for a set of accounts');
        expect(err.data.errorCode).to.equal('E210');
      }
    });
  });

  /*
   * =======================================================
   * calcTotalImprovement
   */
  describe('calcTotalImprovement()', () => {
    it('should build a final data object for the response for a CLOSED period', () => {
      const expectedWeight = {
        "28143": 313285.7142857143,
        "33871": 456000
      };
      const actualCost = {
        "28143": 2266262.285714286,
        "33871": 493428.5714285714
      };
      const data = Improvements.calcTotalImprovement(paramsObj, expectedWeight, actualCost, accountNames, averageCostPerAcc);

      expect(data).to.deep.equal({
        "maxCost": 3956957,
        "improvementCost": 1197266,
        "expectedWeight": 769286,
        forecastedCost: undefined,  // it is present as "undefined" in the object, but in the actual response it's gone
        "expectedCost": 3956957,
        "actualCost": 2759691,
        "totalDays": 7,
        "daysUntilNow": 7,
        "accounts": [
          {
            "accountId": "28143",
            "name": "Company 2",
            "maxCost": 2474957,
            "improvementCost": 208695,
            "averageCost": 7.9,
            "expectedCost": 2474957,
            "expectedWeight": 313286,
            forecastedCost: undefined,
            "actualCost": 2266262,
            "trend": []
          },
          {
            "accountId": "33871",
            "name": "Customer 1",
            "maxCost": 1482000,
            "improvementCost": 988571,
            "averageCost": 3.25,
            "expectedCost": 1482000,
            "expectedWeight": 456000,
            forecastedCost: undefined,
            "actualCost": 493429,
            "trend": []
          }
        ]
      });
    });

    it('should build a final data object for the response for an OPEN period', () => {
      const expectedWeight = { "24759": 122000 };
      const actualCost = { "24759": 34417035.428571425 };
      accountNames = { "24759": "Customer 1" };
      averageCostPerAcc = { "24759": 2.3 };
      /*
       * to keep the test working consistently, we generate the dates. That's because the method below works on
       * today's day basis
       */
      const start = moment().subtract(4, 'days').format('YYYY-MM-DD');
      const end = moment().add(2, 'days').format('YYYY-MM-DD');

      const data = Improvements.calcTotalImprovement(
        { start, end }, expectedWeight, actualCost, accountNames, averageCostPerAcc
      );

      expect(data).to.deep.equal({
        "maxCost": 280600,
        "improvementCost": 0,
        "forecastedCost": 0,
        "expectedCost": 200429,
        "expectedWeight": 122000,
        "actualCost": 34417035,
        "totalDays": 7,
        "daysUntilNow": 5,
        "accounts": [
          {
            "accountId": "24759",
            "name": "Customer 1",
            "maxCost": 280600,
            "improvementCost": 0,
            "forecastedCost": 0,
            "averageCost": 2.3,
            "expectedCost": 200429,
            "expectedWeight": 122000,
            "actualCost": 34417035,
            "trend": []
          }
        ]
      });
    });
  });

  /*
   * =======================================================
   * calcTrendImprovement
   */
  describe('calcTrendImprovement()', () => {
    it('should build a trend object for an account with regs and one without enough regs', () => {
      const logStub = sandbox.stub(log, 'error');
      const expectedWeight = { "24759": 51500000 };
      const actualCost = { "24759": 23501760 };
      const averageCost = { "24759": 3 };
      const accNotEnoughRegs = ['33871'];

      const data = Improvements.calcTrendImprovement(
        { start: '2018-09-10', end: '2018-09-16' }, expectedWeight, actualCost, averageCost, accNotEnoughRegs
      );

      expect(data).to.deep.equal({
        '24759': {
          'maxCost': 154500000,
          'improvementCost': 130998240,
          'periodLabel': '37',
        },
        '33871': {
          'maxCost': -1,
          'improvementCost': -1,
          'periodLabel': '37',
        }
      });
      expect(logStub.notCalled).to.equal(true);
    });
  });

  /*
   * =======================================================
   * find() main function
   */
  describe('find() main function', () => {

    it('should return -1 values (no trends) when < 70% of requested accounts have no registration points and trend is not requested', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([settings[0], settings[1]]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "33871", registrationdaysforperiod: "5" }
      ]));
      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([
        { "customerId": "33871", "median": 3250 }
        // there's nothing returned for account 28143, therefore this account has no registration points
      ]));

      const res = await improvements.find({
        query: {
          customerId: '33871',
          start: '2018-08-13',
          end: '2018-08-19',
          accounts: '33871,28143'
        }
      });

      expect(res).to.deep.equal({
        maxCost: -1,
        improvementCost: -1,
        accounts: [
          {
            accountId: '33871',
            name: 'Customer 1',
            maxCost: -1,
            improvementCost: -1,
            forecastedCost: undefined,
            averageCost: -1,
            expectedWeight: -1,
            actualCost: -1,
            trend: []
          }],
        accountsWithoutSettings: undefined,
        accountsWithoutRegistrationPoints: [{ id: '28143', name: 'Company 2' }],
        accountsWithoutEnoughRegs: undefined
      });
    });

    it('should return -1 values (no trends) when no account at all has registration points', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([settings[0], settings[1]]));
      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([]));
      const regStub = sandbox.stub(sequelize, 'query');

      const res = await improvements.find({
        query: {
          customerId: '33871',
          start: '2018-08-13',
          end: '2018-08-19',
          accounts: '33871,28143'
        }
      });

      expect(regStub.notCalled).to.equal(true);
      expect(res).to.deep.equal({
        maxCost: -1,
        improvementCost: -1,
        accounts: [],
        accountsWithoutSettings: undefined,
        accountsWithoutRegistrationPoints: [{ id: '33871', name: 'Customer 1' }, { id: '28143', name: 'Company 2' }]
      });
    });

    it('should return -1 values (no trends) when < 70% of requested accounts have not enough regs and trend is not requested', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([settings[0], settings[1]]));
      sandbox.stub(sequelize, 'query').returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "1" },
        { customer_id: "33871", registrationdaysforperiod: "1" }
      ]));
      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([
        { "customerId": "33871", "median": 3250 },
        { "customerId": "28143", "median": 7900 }
      ]));

      const res = await improvements.find({
        query: {
          customerId: '33871', start: '2018-08-13', end: '2018-08-19', accounts: '33871,28143,36724,32039,4959'
        }
      });

      expect(res).to.deep.equal({
        maxCost: -1,
        improvementCost: -1,
        accounts: [
          {
            accountId: '33871',
            name: 'Customer 1',
            maxCost: -1,
            improvementCost: -1,
            forecastedCost: undefined,
            averageCost: -1,
            expectedWeight: -1,
            actualCost: -1,
            trend: []
          },
          {
            accountId: '28143',
            name: 'Company 2',
            maxCost: -1,
            improvementCost: -1,
            forecastedCost: undefined,
            averageCost: -1,
            expectedWeight: -1,
            actualCost: -1,
            trend: []
          }
        ],
        accountsWithoutSettings: undefined,
        accountsWithoutRegistrationPoints: undefined,
        accountsWithoutEnoughRegs:
          [{ id: '28143', name: 'Company 2' }, { id: '33871', name: 'Customer 1' }]
      });
    });

    it('should return -1 values for base and trend parts (except one) when accounts do not meet the regs requirement ' +
      'for current and past periods (except one)', async () => {
      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([settings[0], settings[1]]));
      const regsStub = sandbox.stub(sequelize, 'query');
      regsStub.onFirstCall().returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "1" }, // not enough number of regs
        { customer_id: "33871", registrationdaysforperiod: "1" }
      ]));
      regsStub.onSecondCall().returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "1" }, // not enough number of regs
        { customer_id: "33871", registrationdaysforperiod: "2" }
      ]));
      regsStub.onThirdCall().returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "7" }, // more than 70% number of regs => meets the requirement
        { customer_id: "33871", registrationdaysforperiod: "6" }
      ]));
      regsStub.returns(Promise.resolve([])); // all next calls return no record at all, which means no regs at all

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([
        { "customerId": "33871", "median": 3250 },
        { "customerId": "28143", "median": 7900 }
      ]));

      sandbox.stub(sequelize.models.registration, 'findAll').returns(Promise.resolve([
        { customerId: "28143", cost: "123000", date: "2018-07-30" },
        { customerId: "28143", cost: "123000", date: "2018-07-31" },
        { customerId: "28143", cost: "123000", date: "2018-08-01" },
        { customerId: "28143", cost: "123000", date: "2018-08-02" },
        { customerId: "28143", cost: "123000", date: "2018-08-03" },
        { customerId: "28143", cost: "123000", date: "2018-08-04" },
        { customerId: "28143", cost: "123000", date: "2018-08-05" },
        { customerId: "33871", cost: "123000", date: "2018-07-30" },
        { customerId: "33871", cost: "123000", date: "2018-07-31" },
        { customerId: "33871", cost: "123000", date: "2018-08-01" },
        { customerId: "33871", cost: "123000", date: "2018-08-02" },
        { customerId: "33871", cost: "123000", date: "2018-08-03" },
        { customerId: "33871", cost: "123000", date: "2018-08-04" }
      ]));

      const res = await improvements.find({
        query: {
          customerId: '33871',
          start: '2018-08-13',
          end: '2018-08-19',
          period: 'week',
          accounts: '33871,28143,36742,32039,4959'
        }
      });

      expect(res).to.deep.equal({
        maxCost: -1,
        improvementCost: -1,
        accounts: [
          {
            accountId: '33871',
            name: 'Customer 1',
            maxCost: -1,
            improvementCost: -1,
            forecastedCost: undefined,
            averageCost: -1,
            expectedWeight: -1,
            actualCost: -1,
            trend: [
              { maxCost: -1, improvementCost: -1, periodLabel: '32' },
              { maxCost: 399750, improvementCost: 0, periodLabel: '31' }, // one of the periods has registrations but too much waste, so no improvement
              { maxCost: -1, improvementCost: -1, periodLabel: '30' },
              { maxCost: -1, improvementCost: -1, periodLabel: '29' },
              { maxCost: -1, improvementCost: -1, periodLabel: '28' }
            ]
          },
          {
            accountId: '28143',
            name: 'Company 2',
            maxCost: -1,
            improvementCost: -1,
            forecastedCost: undefined,
            averageCost: -1,
            expectedWeight: -1,
            actualCost: -1,
            trend: [
              { maxCost: -1, improvementCost: -1, periodLabel: '32' },
              { maxCost: 3602400, improvementCost: 2741400, periodLabel: '31' }, // one of the periods has registrations
              { maxCost: -1, improvementCost: -1, periodLabel: '30' },
              { maxCost: -1, improvementCost: -1, periodLabel: '29' },
              { maxCost: -1, improvementCost: -1, periodLabel: '28' }
            ]
          }
        ],
        accountsWithoutSettings: undefined,
        accountsWithoutRegistrationPoints: undefined,
        accountsWithoutEnoughRegs:
          [{ id: '28143', name: 'Company 2' }, { id: '33871', name: 'Customer 1' }]
      });
    });


    it('should return proper values for base and trend parts (except the 2nd) when accounts do meet the regs ' +
      'requirement for current and past periods (except the 2nd)', async () => {

      sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settings));
      const numberOfRegsStub = sandbox.stub(sequelize, 'query');
      numberOfRegsStub.onFirstCall().returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "5" },
        { customer_id: "33871", registrationdaysforperiod: "5" }
      ]));
      numberOfRegsStub.onSecondCall().returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "5" },
        { customer_id: "33871", registrationdaysforperiod: "5" }
      ]));
      numberOfRegsStub.onThirdCall().returns(Promise.resolve([ // this is the call to get registrations for the 2nd trend period
        { customer_id: "28143", registrationdaysforperiod: "1" },
        { customer_id: "33871", registrationdaysforperiod: "2" } // not enough regs
      ]));
      numberOfRegsStub.returns(Promise.resolve([
        { customer_id: "28143", registrationdaysforperiod: "5" },
        { customer_id: "33871", registrationdaysforperiod: "5" }
      ]));

      sandbox.stub(sequelize.models.registration_point, 'findAll').returns(Promise.resolve([
        { "customerId": "33871", "median": 3250 },
        { "customerId": "28143", "median": 7900 }
      ]));

      const regsStub = sandbox.stub(sequelize.models.registration, 'findAll');

      regsStub.onCall(0)
        .returns(Promise.resolve([
          // requested period   2018-08-13 -> 2018-08-19
          { customerId: "28143", cost: "123000", date: "2018-08-13" },
          { customerId: "28143", cost: "123000", date: "2018-08-14" },
          { customerId: "28143", cost: "123000", date: "2018-08-15" },
          { customerId: "28143", cost: "123000", date: "2018-08-16" },
          { customerId: "28143", cost: "123000", date: "2018-08-17" },
          { customerId: "33871", cost: "23000", date: "2018-08-13" },
          { customerId: "33871", cost: "23000", date: "2018-08-14" },
          { customerId: "33871", cost: "23000", date: "2018-08-15" },
          { customerId: "33871", cost: "23000", date: "2018-08-16" },
          { customerId: "33871", cost: "23000", date: "2018-08-17" }
        ]));
      regsStub.onCall(1)
        .returns(Promise.resolve([
          // 1st trend period   2018-08-06 -> 2018-08-12
          { customerId: "28143", cost: "123000", date: "2018-08-06" },
          { customerId: "28143", cost: "123000", date: "2018-08-07" },
          { customerId: "28143", cost: "123000", date: "2018-08-08" },
          { customerId: "28143", cost: "123000", date: "2018-08-09" },
          { customerId: "28143", cost: "123000", date: "2018-08-10" },
          { customerId: "33871", cost: "23000", date: "2018-08-06" },
          { customerId: "33871", cost: "23000", date: "2018-08-07" },
          { customerId: "33871", cost: "23000", date: "2018-08-08" },
          { customerId: "33871", cost: "23000", date: "2018-08-09" },
          { customerId: "33871", cost: "23000", date: "2018-08-10" },
        ]));
      /*
       * no registrations are pulled for the 2nd period because the call is not even made because the previous call
       * that checks for number of regs (to be > 70%) identifies that the accounts don't meet the requirements
       *
       * 2018-07-30 -> 2018-08-05
       */
      regsStub.onCall(2)
        .returns(Promise.resolve([
          // 3rd trend period   2018-07-23 -> 2018-07-29
          { customerId: "28143", cost: "123000", date: "2018-07-23" },
          { customerId: "28143", cost: "123000", date: "2018-07-24" },
          { customerId: "28143", cost: "123000", date: "2018-07-25" },
          { customerId: "28143", cost: "123000", date: "2018-07-26" },
          { customerId: "28143", cost: "123000", date: "2018-07-27" },
          { customerId: "33871", cost: "23000", date: "2018-07-23" },
          { customerId: "33871", cost: "23000", date: "2018-07-24" },
          { customerId: "33871", cost: "23000", date: "2018-07-25" },
          { customerId: "33871", cost: "23000", date: "2018-07-26" },
          { customerId: "33871", cost: "23000", date: "2018-07-27" },
        ]));
      regsStub.onCall(3)
        .returns(Promise.resolve([
          // 4th trend period   2018-07-16 -> 2018-07-22
          { customerId: "28143", cost: "123000", date: "2018-07-16" },
          { customerId: "28143", cost: "123000", date: "2018-07-17" },
          { customerId: "28143", cost: "123000", date: "2018-07-18" },
          { customerId: "28143", cost: "123000", date: "2018-07-19" },
          { customerId: "28143", cost: "123000", date: "2018-07-20" },
          { customerId: "33871", cost: "23000", date: "2018-07-16" },
          { customerId: "33871", cost: "23000", date: "2018-07-17" },
          { customerId: "33871", cost: "23000", date: "2018-07-18" },
          { customerId: "33871", cost: "23000", date: "2018-07-19" },
          { customerId: "33871", cost: "23000", date: "2018-07-20" },
        ]));
      regsStub.onCall(4)
        .returns(Promise.resolve([
          // 5th trend period    2018-07-09 -> 2018-07-15
          { customerId: "28143", cost: "1123000", date: "2018-07-09" },
          { customerId: "28143", cost: "1123000", date: "2018-07-10" },
          { customerId: "28143", cost: "1123000", date: "2018-07-11" },
          { customerId: "28143", cost: "1123000", date: "2018-07-12" },
          { customerId: "28143", cost: "1123000", date: "2018-07-13" },
          { customerId: "33871", cost: "123000", date: "2018-07-09" },
          { customerId: "33871", cost: "123000", date: "2018-07-10" },
          { customerId: "33871", cost: "123000", date: "2018-07-11" },
          { customerId: "33871", cost: "123000", date: "2018-07-12" },
          { customerId: "33871", cost: "123000", date: "2018-07-13" }
        ]));

      const res = await improvements.find({
        query: {
          customerId: '33871',
          start: '2018-08-13',
          end: '2018-08-19',
          period: 'week',
          accounts: '33871,28143,36724,32039,4959'
        }
      });

      /*
       * In the actual API response, the "undefined" values are actually removed
       */
      expect(res).to.deep.equal({
        maxCost: 3956957,
        improvementCost: 2525900,
        forecastedCost: undefined,
        expectedCost: 3956957,
        expectedWeight: 769286,
        actualCost: 1431057,
        totalDays: 7,
        daysUntilNow: 7,
        accounts: [
          {
            accountId: '28143',
            name: 'Company 2',
            maxCost: 2474957,
            improvementCost: 1582328,
            forecastedCost: undefined,
            averageCost: 7.9,
            expectedCost: 2474957,
            expectedWeight: 313286,
            actualCost: 892629,
            trend: [
              { maxCost: 3602400, improvementCost: 1958143, periodLabel: '32' },
              { maxCost: -1, improvementCost: -1, periodLabel: '31' },           // 2nd period does not have enough regs
              { maxCost: 3602400, improvementCost: 1958143, periodLabel: '30' },
              { maxCost: 3602400, improvementCost: 1958143, periodLabel: '29' },
              { maxCost: 3602400, improvementCost: 0, periodLabel: '28' }
            ]
          },
          {
            accountId: '33871',
            name: 'Customer 1',
            maxCost: 1482000,
            improvementCost: 943571,
            forecastedCost: undefined,
            averageCost: 3.25,
            expectedCost: 1482000,
            expectedWeight: 456000,
            actualCost: 538429,
            trend: [
              { maxCost: 863571, improvementCost: 325142, periodLabel: '32' },
              { maxCost: -1, improvementCost: -1, periodLabel: '31' },
              { maxCost: 399750, improvementCost: 170536, periodLabel: '30' },
              { maxCost: 399750, improvementCost: 170536, periodLabel: '29' },
              { maxCost: 399750, improvementCost: 0, periodLabel: '28' }
            ]
          }
        ],
        accountsWithoutSettings: ['36742', '32039', '4959'],
        accountsWithoutRegistrationPoints: undefined,
        accountsWithoutEnoughRegs: undefined
      });
    });
  });


});
