'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Waste = require('../../../../src/services/registrations/waste').default;
const app = require('../../../../src/app').default;
const moment = require('moment').utc;

describe('Registrations waste endpoint', () => {
  const RegistrationWaste = new Waste(app);
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('Should validate Access and get details of the associated accounts', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 2,
        userId: 232,
        current: {
          name: 'Current',
          accounts: [
            { id: 1, name: "eSmiley" },
            { id: 2, name: "Fields" },
            { id: 3, name: "Kebabistan" }
          ],
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }]);

    const result = await RegistrationWaste.validateAccountsAccessAndGetDetails(2, [1, 2, 3]);

    expect(result.length).to.equal(3);
    expect(result).to.deep.equal([{ id: 1, name: 'eSmiley' },
      { id: 2, name: 'Fields' },
      { id: 3, name: 'Kebabistan' }]);
  });

  it('Should allow to get details of itself', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 2,
        userId: 232,
        current: {
          name: 'Current',
          accounts: [
            { id: 1, name: "eSmiley" },
            { id: 3, name: "Kebabistan" }
          ],
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }]);

    const result = await RegistrationWaste.validateAccountsAccessAndGetDetails(2, [1, 2, 3]);

    expect(result.length).to.equal(3);
    expect(result).to.deep.equal([{ id: 1, name: 'eSmiley' },
      { id: 3, name: 'Kebabistan' },
      { id: 2, name: 'Current' }]);
  });

  it('Should allow only to query itself', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 2,
        userId: 232,
        current: {
          name: 'Current',
          accounts: [],
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }]);

    const result = await RegistrationWaste.validateAccountsAccessAndGetDetails(2, [2]);

    expect(result.length).to.equal(1);
    expect(result).to.deep.equal([
      { id: 2, name: 'Current' }]);
  });

  it('Should return E205 when there is an eror fetching settings from DB', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    try {
      await RegistrationWaste.validateAccountsAccessAndGetDetails(2, [1, 2, 3]);
      expect(false).to.equal(true);
    } catch (err) {

      expect(err.data.errorCode).to.equal('E205');
    }
  });

  it('Should return E206 when the user tries to query an account which is not subscribed', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 2,
        userId: 232,
        current: {
          accounts: [
            { id: 1, name: "eSmiley" },
            { id: 2, name: "Fields" },
            { id: 3, name: "Kebabistan" }
          ],
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }]);

    try {
      await RegistrationWaste.validateAccountsAccessAndGetDetails(2, [1, 2, 3, 4]);
      expect(false).to.equal(true);
    } catch (err) {

      expect(err.data.errorCode).to.equal('E206');
    }
  });

  it('Should calculate expected amounts for a set of account 1', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 1,
        userId: 1,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }, {
        customerId: 2,
        userId: 232,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }
      ]);

    return RegistrationWaste.getExpectedAmounts([1, 2, 3], '2018-07-01', '2018-08-30')
      .then(result => {
        expect(parseInt(result.totalExpectedAmount)).to.equal(2628572);
        expect(result.expectedAmountsPerAccount.length).to.equal(2);
        result.expectedAmountsPerAccount.forEach((expectedAmountsPerAccount) => {
          if (expectedAmountsPerAccount.accountId === 1) {
            expect(parseInt(expectedAmountsPerAccount.expectedAmount)).to.equal(1314286);
          } else if (expectedAmountsPerAccount.accountId === 2) {
            expect(parseInt(expectedAmountsPerAccount.expectedAmount)).to.equal(1314286);
          }
        });
        expect(result.accountsWithoutSettings).to.deep.equal([3]);
        expect(result.accountsWithSettings).to.deep.equal([1, 2]);
      });
  });

  it('Should calculate expected amounts for a set of account 2', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 1,
        userId: 1,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }, {
        customerId: 2,
        userId: 232,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }
      ]);

    const result = await RegistrationWaste.getExpectedAmounts([1, 2, 3], '2018-07-01', '2018-07-30');
    expect(parseInt(result.totalExpectedAmount)).to.equal(857142);
    expect(result.expectedAmountsPerAccount.length).to.equal(2);
    result.expectedAmountsPerAccount.forEach((expectedAmountsPerAccount) => {
      if (expectedAmountsPerAccount.accountId === 1) {
        expect(parseInt(expectedAmountsPerAccount.expectedAmount)).to.equal(428571);
      }
    });
    expect(result).to.deep.equal({
      totalExpectedAmount: '857142',
      expectedAmountsPerAccount:
        [
          { accountId: 1, expectedAmount: '428571' },
          { accountId: 2, expectedAmount: '428571' }
        ],
      accountsWithoutSettings: [3],
      accountsWithSettings: [1, 2]
    });
  });

  it('Should calculate expected amounts for a set of account 3', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns([{
        customerId: 1,
        userId: 1,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }, {
        customerId: 2,
        userId: 232,
        current: {
          expectedWeeklyWaste: {
            '0': 100000,
            '2018-08-01': 200000
          }
        },
        history: {}
      }
      ]);

    const result = await RegistrationWaste.getExpectedAmounts([1, 2, 3], '2018-07-15', '2018-08-15');

    expect(result).to.deep.equal({
      totalExpectedAmount: '1371428',
      expectedAmountsPerAccount:
        [
          { accountId: 1, expectedAmount: '685714' },
          { accountId: 2, expectedAmount: '685714' }],
      accountsWithoutSettings: [3],
      accountsWithSettings: [1, 2]
    });
  });

  it('Return E204 if there is an error fetching the settings', async () => {
    sandbox.stub(app.get('sequelize').models.settings, 'findAll')
      .returns(Promise.reject({
        bad: 'stuff'
      }));
    try {
      await RegistrationWaste.getExpectedAmounts([1, 2, 3], '2018-07-15', '2018-08-15');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E204');
    }
  });

  it('Should get the total amount per registration point', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.resolve([{ cost: '20000', amount: '200000', name: 'beef' },
        { cost: '40000', amount: '400000', name: 'chicken' },
        { cost: '20000', amount: '200000', name: 'salmon' },
        { cost: '40000', amount: '400000', name: 'test' }]));

    const result = await RegistrationWaste.getTotalAmountPerRegistrationPoint([1, 2, 3], '2018-07-15', '2018-08-15');

    expect(result).deep.equal([{ cost: '20000', amount: '200000', name: 'Beef' },
      { cost: '40000', amount: '400000', name: 'Chicken' },
      { cost: '20000', amount: '200000', name: 'Salmon' },
      { cost: '40000', amount: '400000', name: 'Test' }]);

  });

  it('Should return error E203 if it can fetch totals per registration point', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    try {
      await RegistrationWaste.getTotalAmountPerRegistrationPoint([1, 2, 3], '2018-07-15', '2018-08-15');
      expect(true).to.equals(false);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E203');
    }
  });

  it('Should get the total amount', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.resolve([{ actualCost: '120000', actualAmount: '1200000' }]));

    const result = await RegistrationWaste.getTotalActualAmount([1, 2, 3], '2018-07-15', '2018-08-15');

    expect(result).deep.equal({ actualCost: '120000', actualAmount: '1200000' });

  });

  it('Should return error E202 if it can fetch totals', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    try {
      await RegistrationWaste.getTotalActualAmount([1, 2, 3], '2018-07-15', '2018-08-15');
      expect(true).to.equals(false);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E202');
    }
  });

  it('Should get the total amount per account per registration point', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.resolve([{
        cost: '20000',
        amount: '200000',
        name: 'Chicken',
        accountId: '1',
        registrationPointId: '10001'
      },
        {
          cost: '20000',
          amount: '200000',
          name: 'Test',
          accountId: '1',
          registrationPointId: '10002'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Beef',
          accountId: '1',
          registrationPointId: '10003'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Salmon',
          accountId: '2',
          registrationPointId: '10012'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Chicken',
          accountId: '2',
          registrationPointId: '10013'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Test',
          accountId: '2',
          registrationPointId: '10014'
        }]));

    const result = await RegistrationWaste.getAmountPerAccountPerRegistrationPoint([1, 2, 3], '2018-07-15', '2018-08-15');

    expect(result).deep.equal([{
      cost: '20000',
      amount: '200000',
      name: 'Chicken',
      accountId: '1',
      registrationPointId: '10001'
    },
      {
        cost: '20000',
        amount: '200000',
        name: 'Test',
        accountId: '1',
        registrationPointId: '10002'
      },
      {
        cost: '20000',
        amount: '200000',
        name: 'Beef',
        accountId: '1',
        registrationPointId: '10003'
      },
      {
        cost: '20000',
        amount: '200000',
        name: 'Salmon',
        accountId: '2',
        registrationPointId: '10012'
      },
      {
        cost: '20000',
        amount: '200000',
        name: 'Chicken',
        accountId: '2',
        registrationPointId: '10013'
      },
      {
        cost: '20000',
        amount: '200000',
        name: 'Test',
        accountId: '2',
        registrationPointId: '10014'
      }]);

  });

  it('Should get the total amount per account', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.resolve([{ actualCost: '60000', actualAmount: '600000', accountId: '1' },
        { actualCost: '60000', actualAmount: '600000', accountId: '2' }]));

    const accountDetails = [{ id: 10240, name: '(1339) KLP Ørestad 5H ' },
      { id: 10244, name: '(1122) Dong Asnæsværket' },
      { id: 10479, name: '(1190) Novo Nordisk EG' },
      { id: 10507, name: '(1191) Novo Nordisk DF' },
      { id: 10525, name: '(1194) Novo Nordisk HC' },
      { id: 10544, name: '(1189) Novo Nordisk AE' },
      { id: 1, name: 'eSmiley' },
      { id: 2, name: 'Fields' },
      { id: 3, name: 'Kebabistan' }];

    const result = await RegistrationWaste.getActualAmountPerAccount(['1', '2', '3'], accountDetails, '2018-07-15', '2018-08-15');

    expect(result).deep.equal([{
      actualCost: '60000',
      actualAmount: '600000',
      accountId: '1'
    },
      {
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '2'
      },
      {
        actualCost: '0',
        actualAmount: '0',
        accountId: '3'
      }
    ]);

  });

  it('Should return error E200 if it can fetch totals per account', async () => {
    sandbox.stub(app.get('sequelize').models.registration, 'findAll')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    const accountDetails = [{ id: 10240, name: '(1339) KLP Ørestad 5H ' },
      { id: 10244, name: '(1122) Dong Asnæsværket' },
      { id: 10479, name: '(1190) Novo Nordisk EG' },
      { id: 10507, name: '(1191) Novo Nordisk DF' },
      { id: 10525, name: '(1194) Novo Nordisk HC' },
      { id: 10544, name: '(1189) Novo Nordisk AE' },
      { id: 1, name: 'eSmiley' },
      { id: 2, name: 'Fields' },
      { id: 3, name: 'Kebabistan' }];

    try {
      await RegistrationWaste.getActualAmountPerAccount([1, 2, 3], accountDetails, '2018-07-15', '2018-08-15');
      expect(true).to.equals(false);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E200');
    }
  });

  it('Should build a trend with period week', async () => {
    Waste.periodFormatter = (start) => {
      return `${moment(start).format('WW')}`;
    };

    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.resolve([{
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '1',
        name: 'eSmiley'
      },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields'
        }]));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.resolve({
        totalExpectedAmount: 1314286,
        expectedAmountsPerAccount:
          [{ accountId: 2, expectedAmount: 657143 },
            { accountId: 1, expectedAmount: 657143 }],
        accountsWithoutSettings: [3],
        accountsWithSettings: [2, 1]
      }));

    const result = await RegistrationWaste.buildTrends(['1', '2', '3'], '2018-07-02', '2018-07-08', 'week');

    expect(result).to.deep.equal({
      '1':
        [{
          periodLabel: '26',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '25',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '24',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '23',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '22',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '2':
        [{
          periodLabel: '26',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '25',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '24',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '23',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '22',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '3':
        [{
          periodLabel: '26',
          actualCost: '0',
          actualAmount: '0',
          expectedAmount: '0'
        },
          {
            periodLabel: '25',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '24',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '23',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '22',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          }]
    });
  });

  it('Should build a trend with period month', async () => {
    Waste.periodFormatter = (start) => {
      return `${moment(start).format('YYYY-MM')}`;
    };

    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.resolve([{
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '1',
        name: 'eSmiley'
      },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields'
        }]));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.resolve({
        totalExpectedAmount: 1314286,
        expectedAmountsPerAccount:
          [{ accountId: 2, expectedAmount: 657143 },
            { accountId: 1, expectedAmount: 657143 }],
        accountsWithoutSettings: [3],
        accountsWithSettings: [2, 1]
      }));

    const result = await RegistrationWaste.buildTrends(['1', '2', '3'], '2018-07-01', '2018-07-30', 'month');

    expect(result).to.deep.equal({
      '1':
        [{
          periodLabel: '2018-06',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '2018-05',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-04',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-03',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-02',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '2':
        [{
          periodLabel: '2018-06',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '2018-05',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-04',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-03',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2018-02',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '3':
        [{
          periodLabel: '2018-06',
          actualCost: '0',
          actualAmount: '0',
          expectedAmount: '0'
        },
          {
            periodLabel: '2018-05',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2018-04',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2018-03',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2018-02',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          }]
    });
  });

  it('Should build a trend with period year', async () => {
    Waste.periodFormatter = (start) => {
      return `${moment(start).format('YYYY')}`;
    };

    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.resolve([{
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '1',
        name: 'eSmiley'
      },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields'
        }]));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.resolve({
        totalExpectedAmount: 1314286,
        expectedAmountsPerAccount:
          [{ accountId: 2, expectedAmount: 657143 },
            { accountId: 1, expectedAmount: 657143 }],
        accountsWithoutSettings: [3],
        accountsWithSettings: [2, 1]
      }));

    const result = await RegistrationWaste.buildTrends(['1', '2', '3'], '2017-01-01', '2017-12-31', 'year');

    expect(result).to.deep.equal({
      '1':
        [{
          periodLabel: '2016',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '2015',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2014',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2013',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2012',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '2':
        [{
          periodLabel: '2016',
          actualCost: '60000',
          actualAmount: '600000',
          expectedAmount: 657143
        },
          {
            periodLabel: '2015',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2014',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2013',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          },
          {
            periodLabel: '2012',
            actualCost: '60000',
            actualAmount: '600000',
            expectedAmount: 657143
          }],
      '3':
        [{
          periodLabel: '2016',
          actualCost: '0',
          actualAmount: '0',
          expectedAmount: '0'
        },
          {
            periodLabel: '2015',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2014',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2013',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          },
          {
            periodLabel: '2012',
            actualCost: '0',
            actualAmount: '0',
            expectedAmount: '0'
          }]
    });
  });

  it('Should throw E215 if there is an error getting waste per account building trend', async () => {
    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.resolve({
        totalExpectedAmount: 1314286,
        expectedAmountsPerAccount:
          [{ accountId: 2, expectedAmount: 657143 },
            { accountId: 1, expectedAmount: 657143 }],
        accountsWithoutSettings: [3],
        accountsWithSettings: [2, 1]
      }));

    try {
      await RegistrationWaste.buildTrends(['1', '2', '3'], '2017-01-01', '2017-12-31', 'year');
      expect(true).to.equals(false);
    } catch (err) {

      expect(err.data.errorCode).to.equal('E215');
    }
  });

  it('Should throw E215 if there is an error getting expected amounts building trend', async () => {
    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.resolve([{
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '1',
        name: 'eSmiley'
      },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields'
        }]));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.reject({
        bad: 'stuff'
      }));

    try {
      await RegistrationWaste.buildTrends(['1', '2', '3'], '2017-01-01', '2017-12-31', 'year');
      expect(true).to.equals(false);
    } catch (err) {

      expect(err.data.errorCode).to.equal('E215');
    }
  });

  it('Should calculate the forecasted amount', () => {
    let amountsPerAccount = [{
      actualCost: '60000',
      actualAmount: '600000',
      accountId: '1',
      name: 'eSmiley'
    },
      {
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '2',
        name: 'Fields'
      }];
    let expectedAmountsPerAccount = Object.assign([], amountsPerAccount);

    let totalAmount = { actualCost: '120000', actualAmount: '1200000' };
    let expectedTotalAmount = Object.assign({}, totalAmount);

    Waste.calculateForecastedAmount(amountsPerAccount, totalAmount,
      moment().subtract(14, 'days').format('YYYY-MM-DD'), moment().add(15, 'days').format('YYYY-MM-DD'));


    expectedAmountsPerAccount[0].forecastedAmount = '1200000';
    expectedAmountsPerAccount[1].forecastedAmount = '1200000';
    expectedTotalAmount.forecastedAmount = '2400000';

    expect(amountsPerAccount).to.deep.equal(expectedAmountsPerAccount);
    expect(totalAmount).to.deep.equal(expectedTotalAmount);
  });

  it('Should not calculate forecasted for closed periods', () => {
    let amountsPerAccount = [{
      actualCost: '60000',
      actualAmount: '600000',
      accountId: '1',
      name: 'eSmiley'
    },
      {
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '2',
        name: 'Fields'
      }];
    let expectedAmountsPerAccount = Object.assign([], amountsPerAccount);

    let totalAmount = { actualCost: '120000', actualAmount: '1200000' };
    let expectedTotalAmount = Object.assign({}, totalAmount);

    Waste.calculateForecastedAmount(amountsPerAccount, totalAmount,
      moment().subtract(30, 'days').format('YYYY-MM-DD'), moment().subtract(15, 'days').format('YYYY-MM-DD'));

    expect(amountsPerAccount).to.deep.equal(expectedAmountsPerAccount);
    expect(totalAmount).to.deep.equal(expectedTotalAmount);
  });


  it('Should build the response', async () => {
    sandbox.stub(RegistrationWaste, 'getActualAmountPerAccount')
      .returns(Promise.resolve([{
        actualCost: '60000',
        actualAmount: '600000',
        accountId: '1',
        name: 'eSmiley'
      },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields'
        }]));

    sandbox.stub(RegistrationWaste, 'getAmountPerAccountPerRegistrationPoint')
      .returns(Promise.resolve([{
        cost: '20000',
        amount: '200000',
        name: 'Chicken',
        accountId: '1',
        registrationPointId: '10001'
      },
        {
          cost: '20000',
          amount: '200000',
          name: 'Test',
          accountId: '1',
          registrationPointId: '10002'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Beef',
          accountId: '1',
          registrationPointId: '10003'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Salmon',
          accountId: '2',
          registrationPointId: '10012'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Chicken',
          accountId: '2',
          registrationPointId: '10013'
        },
        {
          cost: '20000',
          amount: '200000',
          name: 'Test',
          accountId: '2',
          registrationPointId: '10014'
        }]));


    sandbox.stub(RegistrationWaste, 'getTotalActualAmount')
      .returns(Promise.resolve({ actualCost: '120000', actualAmount: '1200000' }));

    sandbox.stub(RegistrationWaste, 'getTotalAmountPerRegistrationPoint')
      .returns(Promise.resolve([{ cost: '20000', amount: '200000', name: 'Beef' },
        { cost: '40000', amount: '400000', name: 'Chicken' },
        { cost: '20000', amount: '200000', name: 'Salmon' },
        { cost: '40000', amount: '400000', name: 'Test' }]));

    sandbox.stub(RegistrationWaste, 'getExpectedAmounts')
      .returns(Promise.resolve({
        totalExpectedAmount: 1314286,
        expectedAmountsPerAccount:
          [{ accountId: 2, expectedAmount: 657143 },
            { accountId: 1, expectedAmount: 657143 }],
        accountsWithoutSettings: [3],
        accountsWithSettings: [2, 1]
      }));

    sandbox.stub(RegistrationWaste, 'validateAccountsAccessAndGetDetails')
      .returns(Promise.resolve([{ id: 1, name: 'eSmiley' },
        { id: 2, name: 'Fields' },
        { id: 3, name: 'Kebabistan' }]));

    const result = await RegistrationWaste.buildResponse(1, [1, 2, 3], '2018-07-15', '2018-08-15');

    expect(result).to.deep.equal({
      actualCost: '120000',
      actualAmount: '1200000',
      accountsWithoutSettings: [3],
      expectedAmount: 1314286,
      registrationPoints:
        [{ cost: '20000', amount: '200000', name: 'Beef' },
          { cost: '40000', amount: '400000', name: 'Chicken' },
          { cost: '20000', amount: '200000', name: 'Salmon' },
          { cost: '40000', amount: '400000', name: 'Test' }],
      accounts: [
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '1',
          name: 'eSmiley',
          expectedAmount: 657143,
          registrationPoints: [
            {
              cost: '20000',
              amount: '200000',
              name: 'Chicken',
              accountId: '1',
              registrationPointId: '10001'
            },
            {
              cost: '20000',
              amount: '200000',
              name: 'Test',
              accountId: '1',
              registrationPointId: '10002'
            },
            {
              cost: '20000',
              amount: '200000',
              name: 'Beef',
              accountId: '1',
              registrationPointId: '10003'
            }
          ],
        },
        {
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '2',
          name: 'Fields',
          expectedAmount: 657143,
          registrationPoints: [
            {
              cost: '20000',
              amount: '200000',
              name: 'Salmon',
              accountId: '2',
              registrationPointId: '10012'
            },
            {
              cost: '20000',
              amount: '200000',
              name: 'Chicken',
              accountId: '2',
              registrationPointId: '10013'
            },
            {
              cost: '20000',
              amount: '200000',
              name: 'Test',
              accountId: '2',
              registrationPointId: '10014'
            }
          ],
        }
      ]
    });

  });

  it('Should return the result of build response', async () => {
    const params = {
      query: {
        accounts: '1,2,3',
        start: '2018-07-01',
        end: '2018-08-30',
        customerId: 1
      },
      requestId: '123456',
      sessionId: 'Your momma'
    };

    sandbox.stub(RegistrationWaste, 'buildResponse')
      .returns(Promise.resolve({
        actualCost: '120000',
        actualAmount: '1200000',
        accountsWithoutSettings: [3],
        expectedAmount: 1314286,
        registrationPoints:
          [{ cost: '20000', amount: '200000', name: 'Beef' },
            { cost: '40000', amount: '400000', name: 'Chicken' },
            { cost: '20000', amount: '200000', name: 'Salmon' },
            { cost: '40000', amount: '400000', name: 'Test' }],
        accounts:
          [{
            actualCost: '60000',
            actualAmount: '600000',
            accountId: '1',
            name: 'eSmiley',
            expectedAmount: 657143,
            registrationPoints: [Array]
          },
            {
              actualCost: '60000',
              actualAmount: '600000',
              accountId: '2',
              name: 'Fields',
              expectedAmount: 657143,
              registrationPoints: [Array]
            }]
      }));

    const result = await RegistrationWaste.find(params);

    expect(result).to.deep.equal({
      actualCost: '120000',
      actualAmount: '1200000',
      accountsWithoutSettings: [3],
      expectedAmount: 1314286,
      registrationPoints:
        [{ cost: '20000', amount: '200000', name: 'Beef' },
          { cost: '40000', amount: '400000', name: 'Chicken' },
          { cost: '20000', amount: '200000', name: 'Salmon' },
          { cost: '40000', amount: '400000', name: 'Test' }],
      accounts:
        [{
          actualCost: '60000',
          actualAmount: '600000',
          accountId: '1',
          name: 'eSmiley',
          expectedAmount: 657143,
          registrationPoints: [Array]
        },
          {
            actualCost: '60000',
            actualAmount: '600000',
            accountId: '2',
            name: 'Fields',
            expectedAmount: 657143,
            registrationPoints: [Array]
          }]
    });

  });
});
