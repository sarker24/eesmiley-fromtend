'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const app = require('../../../../src/app').default;

describe('AccountStatus service', () => {
  const service = app.service('/account-status');
  const Frequency = app.service('/registrations/frequency');
  const sandbox = sinon.createSandbox();
  const sequelize = app.get('sequelize');

  let settingsPerAccount, accounts, accountsToQuery, regsToHavePerDOW, totalsPerAcc, accountsWithoutSettings,
    registrations, accountNames, registrationDaysPerAcc;

  beforeEach(() => {

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
      "33871": { "expectedDays": 18, "registeredDays": 5 },
      "4959": { "expectedDays": 15, "registeredDays": 7 }
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


  it('should check that the AccountStatus service has been registered', () => {
    expect(service).to.be.an('Object');
  });

  it('should retrieve and organize registration days per account', async () => {

    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    sandbox.stub(Frequency, 'getDaysWithRegistrations').returns(registrations);

    const registrationDaysPerAccount = await service.getRegistrationDaysPerAccount({
      accessTokenPayload: {
        isAdmin: true
      },
      query: {
        start: '2018-08-10',
        end: '2018-08-15',
        accounts: '33871,28143,4959'
      }
    });

    expect(registrationDaysPerAccount).to.deep.equal(
      {
        '28143': { name: 'Company 5', expectedDays: 5, registeredDays: 14 },
        '33871': { name: 'Customer 1', expectedDays: 4, registeredDays: 13 }
      }
    );
  });

  it('should retrieve and organize registration days per account where no accounts are returned', async () => {

    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve([]));

    sandbox.stub(Frequency, 'getDaysWithRegistrations').returns(registrations);

    const registrationDaysPerAccount = await service.getRegistrationDaysPerAccount({
      query: {
        start: '2018-08-10',
        end: '2018-08-15',
        accounts: '33871,28143,4959'
      }
    });

    expect(registrationDaysPerAccount).to.deep.equal([]);
  });

  it('should retrieve and organize registration days per account with no registrations', async () => {

    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    sandbox.stub(Frequency, 'getDaysWithRegistrations').returns([]);

    const registrationDaysPerAccount = await service.getRegistrationDaysPerAccount({
      accessTokenPayload: {
        isAdmin: true
      },
      query: {
        start: '2018-08-10',
        end: '2018-08-15',
        accounts: '33871,28143,4959'
      }
    });

    expect(registrationDaysPerAccount).to.deep.equal(
      {
        '28143': { name: 'Company 5', expectedDays: 5, registeredDays: 0 },
        '33871': { name: 'Customer 1', expectedDays: 4, registeredDays: 0 }
      }
    );
  });

  it('should retrieve and organize registration days per account with subscription accounts', async () => {

    sandbox.stub(sequelize.models.settings, 'findAll').returns(Promise.resolve(settingsPerAccount));

    sandbox.stub(Frequency, 'getDaysWithRegistrations').returns(registrations);

    const registrationDaysPerAccount = await service.getRegistrationDaysPerAccount({
      accessTokenPayload: {
        isAdmin: true
      },
      query: {
        start: '2018-08-10',
        end: '2018-08-15',
        includeSubscribedAccounts: 1,
        accounts: '33871,28143,4959'
      }
    });

    expect(registrationDaysPerAccount).to.deep.equal(
      {
        '28143': { name: 'Company 5', expectedDays: 5, registeredDays: 14, subscribedAccounts: {} },
        '33871': {
          name: 'Customer 1', expectedDays: 4, registeredDays: 13, subscribedAccounts: {
            '28143': {
              expectedDays: 5,
              name: 'Company 5',
              registeredDays: 14
            }
          }
        }
      }
    );
  });
});
