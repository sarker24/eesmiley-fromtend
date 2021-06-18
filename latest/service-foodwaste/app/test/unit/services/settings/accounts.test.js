'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const Accounts = require('../../../../src/services/settings/accounts').default;
const util = require('../../../../src/services/settings/util/util');
const app = require('../../../../src/app').default;
const commons = require('feathers-commons-esmiley');

describe('Settings service - accounts endpoint', () => {
  const service = app.service('/settings/:customerId/accounts');
  const sandbox = sinon.createSandbox();
  const accountsService = new Accounts(app);

  let accountsFromSettings, legacyResponse, notSubscribedAccounts, subscribedAndCheckedAccounts;

  beforeEach(() => {
    accountsFromSettings = [
      { id: 10240, name: "(1339) KLP Ørestad 5H " },
      { id: 10244, name: "(1122) Dong Asnæsværket" },
      { id: 10479, name: "(1190) Novo Nordisk EG" },
      { id: 10507, name: "(1191) Novo Nordisk DF" },
      { id: 10525, name: "(1194) Novo Nordisk HC" },
      { id: 10544, name: "(1189) Novo Nordisk AE", nickname: "Novo Nordisk AE :)" }
    ];
    legacyResponse = {
      current: { dealId: '12345', company: 'Current account' },
      children: [
        { dealId: '10558', company: '(1139)  Novo Nordisk JC' },
        { dealId: '10712', company: '(1195) Novo Nordisk DD' },
        { dealId: '10795', company: '(1379) KLP 5G' },
        { dealId: '11163', company: '(1337) Havneholmen Atrium ' },
        { dealId: '11167', company: '(1381) Bonnier Publications' },
        { dealId: '11179', company: '(1155) Novo Nordisk  Fritidscenter' },
        { dealId: '10240', company: "(1339) KLP Ørestad 5H " },
        { dealId: '10244', company: "(1122) Dong Asnæsværket" },
        { dealId: '10479', company: "(1190) Novo Nordisk EG" },
        { dealId: '10507', company: "(1191) Novo Nordisk DF", nickname: undefined },
        { dealId: '10525', company: "(1194) Novo Nordisk HC", nickname: undefined },
        { dealId: '10544', company: "(1189) Novo Nordisk AE", nickname: "Novo Nordisk AE :)" }
      ]
    };
    notSubscribedAccounts = [
      { id: 10558, name: '(1139)  Novo Nordisk JC' },
      { id: 10712, name: '(1195) Novo Nordisk DD' },
      { id: 10795, name: '(1379) KLP 5G' },
      { id: 11163, name: '(1337) Havneholmen Atrium ' },
      { id: 11167, name: '(1381) Bonnier Publications' },
      { id: 11179, name: '(1155) Novo Nordisk  Fritidscenter' }
    ];
    subscribedAndCheckedAccounts = [
      { id: 10240, name: '(1339) KLP Ørestad 5H ', settingsAreSet: true },
      { id: 10244, name: '(1122) Dong Asnæsværket', settingsAreSet: true },
      { id: 10479, name: '(1190) Novo Nordisk EG', settingsAreSet: false },
      { id: 10507, name: '(1191) Novo Nordisk DF', settingsAreSet: false },
      { id: 10525, name: '(1194) Novo Nordisk HC', settingsAreSet: false },
      { id: 10544, name: '(1189) Novo Nordisk AE', settingsAreSet: false, nickname: 'Novo Nordisk AE :)' }
    ];
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('should check that the Settings accounts service has been registered', () => {
    expect(service).to.be.an('Object');
  });

  it('should match and divide the two lists of accounts into "subscribed" and "notSubscribed"', () => {
    const { accounts, legacyAccounts, doUpdate } = Accounts.divideAccounts(accountsFromSettings, legacyResponse, '12345');

    expect(accounts).to.deep.equal(accountsFromSettings);
    expect(legacyAccounts).to.deep.equal(notSubscribedAccounts);
    expect(doUpdate).to.equal(false);
  });

  it('should return changed names and doUpdate=TRUE when a name of subscribed account has changed in Legacy Response', () => {
    legacyResponse.children[6].company = 'Changed 1';
    legacyResponse.children[7].company = 'Changed 2';
    const { accounts, legacyAccounts, doUpdate } = Accounts.divideAccounts(accountsFromSettings, legacyResponse, '12345');

    accountsFromSettings[0].name = 'Changed 1';
    accountsFromSettings[1].name = 'Changed 2';

    expect(accounts).to.deep.equal(accountsFromSettings);
    expect(legacyAccounts).to.deep.equal(notSubscribedAccounts);
    expect(doUpdate).to.equal(true);
  });

  it('should return changed names and doUpdate=TRUE when a nickname of subscribed account has changed in Legacy Response', () => {
    legacyResponse.children[6].nickname = 'Changed 1'
    legacyResponse.children[7].nickname = 'Changed 2';
    const { accounts, legacyAccounts, doUpdate } = Accounts.divideAccounts(accountsFromSettings, legacyResponse, '12345');

    accountsFromSettings[0].nickname = 'Changed 1';
    accountsFromSettings[1].nickname = 'Changed 2';

    expect(accounts).to.deep.equal(accountsFromSettings);
    expect(legacyAccounts).to.deep.equal(notSubscribedAccounts);
    expect(doUpdate).to.equal(true);
  });

  it('should return changed names and doUpdate=TRUE when a nickname of subscribed account has changed to undefined in Legacy Response', () => {
    legacyResponse.children[11].nickname = undefined;
    const { accounts, legacyAccounts, doUpdate } = Accounts.divideAccounts(accountsFromSettings, legacyResponse, '12345');

    delete accountsFromSettings[5].nickname;

    expect(accounts).to.deep.equal(accountsFromSettings);
    expect(legacyAccounts).to.deep.equal(notSubscribedAccounts);
    expect(doUpdate).to.equal(true);
  });

  it('should return changed names and doUpdate=TRUE when a nickname of subscribed account has changed to a empty string in Legacy Response', () => {
    legacyResponse.children[11].nickname = '';
    const { accounts, legacyAccounts, doUpdate } = Accounts.divideAccounts(accountsFromSettings, legacyResponse, '12345');

    delete accountsFromSettings[5].nickname;

    expect(accounts).to.deep.equal(accountsFromSettings);
    expect(legacyAccounts).to.deep.equal(notSubscribedAccounts);
    expect(doUpdate).to.equal(true);
  });

  it('should parse the list of legacy accounts by renaming its params and parsing string IDs to integers', () => {
    const accounts = Accounts.parseLegacyAccounts(legacyResponse, '12345');

    // the two pre-defined test objects form together the list of legacy accounts, but parsed with correct params
    // NOTE: it should not include the '12345' ID from "legacyAccounts"
    expect(accounts).to.deep.equal(notSubscribedAccounts.concat(accountsFromSettings));
  });

  it('should throw an error when getting accounts from Settings returns an error', async () => {
    sandbox.stub(commons, 'makeHttpRequest').returns(Promise.resolve(legacyResponse));
    sandbox.stub(app.service('settings'), 'find').returns(Promise.reject({ err: 'some err' }));

    try {
      await accountsService.find({ query: { customerId: 123 }, headers: 'Bearer asdf' })
    } catch (err) {
      expect(err.message).to.equal('Could not retrieve settings for customer');
      expect(err.data.errorCode).to.equal('E187');
      expect(err.errors).to.deep.equal({ err: 'some err' });
    }
  });

  it('should throw an error when getting accounts from Legacy returns an error', async () => {
    sandbox.stub(commons, 'makeHttpRequest').returns(Promise.reject({ err: 'some err' }));
    sandbox.stub(app.service('settings'), 'find').returns(Promise.resolve({ accounts: accountsFromSettings }));

    try {
      await accountsService.find({ query: { customerId: '12345' }, headers: 'Bearer asdf' })
    } catch (err) {
      expect(err.message).to.equal('Could not retrieve settings for customer');
      expect(err.data.errorCode).to.equal('E187');
      expect(err.errors).to.deep.equal({ err: 'some err' });
    }
  });

  it('should return all the accounts from legacy as "notSubscribed" when the customer settings have no "accounts" ' +
    'parameter', async () => {
    sandbox.stub(commons, 'makeHttpRequest').returns(Promise.resolve(legacyResponse));
    sandbox.stub(app.service('settings'), 'find').returns(Promise.resolve({ something: 'asdf' }));

    const accounts = await accountsService.find({ query: { customerId: '12345' }, headers: 'Bearer asdf' });
    expect(accounts).to.have.property('subscribed');
    expect(accounts).to.have.property('notSubscribed');
    // the two pre-defined test objects form together the list of legacy accounts, but parsed with correct params
    expect(accounts.subscribed).to.deep.equal([]);
    expect(accounts.notSubscribed).to.deep.equal(notSubscribedAccounts.concat(accountsFromSettings));
  });

  it('should throw an error when checking for the settings of the subscribed accounts returns an error', async () => {
    sandbox.stub(commons, 'makeHttpRequest').returns(Promise.resolve(legacyResponse));
    sandbox.stub(app.service('settings'), 'find').returns(Promise.resolve({ accounts: accountsFromSettings }));
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.reject({
      message: 'Could not retrieve Settings or set flag for the subscribed accounts of the customer',
      data: { errorCode: 'E216' },
      errors: { err: 'some err' }
    }));

    try {
      await accountsService.find({ query: { customerId: '12345' }, headers: 'Bearer asdf' })
    } catch (err) {
      expect(err.message).to.equal('Could not retrieve Settings or set flag for the subscribed accounts of the customer');
      expect(err.data.errorCode).to.equal('E216');
      expect(err.errors).to.deep.equal({ err: 'some err' });
    }
  });

  it('should return an object of lists of "subscribed" and "notSubscribed" accounts', async () => {
    sandbox.stub(commons, 'makeHttpRequest').returns(Promise.resolve(legacyResponse));
    sandbox.stub(app.service('settings'), 'find').returns(Promise.resolve({ accounts: accountsFromSettings }));
    sandbox.stub(util, 'checkAndSetAccountsHaveSettings').returns(Promise.resolve(subscribedAndCheckedAccounts));

    const accounts = await accountsService.find({ query: { customerId: '12345' }, headers: 'Bearer asdf' });

    expect(accounts).to.have.property('subscribed');
    expect(accounts).to.have.property('notSubscribed');
    expect(accounts.subscribed).to.deep.equal(subscribedAndCheckedAccounts);
    expect(accounts.notSubscribed).to.deep.equal(notSubscribedAccounts);
  });

});
