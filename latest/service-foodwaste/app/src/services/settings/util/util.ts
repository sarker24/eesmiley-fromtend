import * as errors from '@feathersjs/errors';
import Account = SettingsNamespace.Account;

/**
 * Gets the settings of all subscribed accounts and checks if they have set their frequency and foodwaste settings
 * in place. If not - they are marked as "settingsAreSet = false".
 * This way the client knows that these accounts cannot be used in the reporting of foodwaste and frequency of regs.
 *
 * @param {Array<number>} accounts    Simply an array of the plain IDs of these subscribed accounts
 * @param {object}        sequelize   The Sequelize instance object
 * @param {object}        logParams   The 'params' property of a hook or request object
 * @return {Promise<Array<Account>>} accountsWithFlag  The original account objects but now with the 'settingsAreSet'
 *                                                     property set to true|false
 */
export async function checkAndSetAccountsHaveSettings(accounts: Account[], sequelize: any, logParams: any): Promise<Account[]> {
  const doAccountsHaveSettings: any = {};
  const accountsToQuery: number[] = accounts.map((acc: Account) => acc.id);

  for (const acc of accounts) {
    doAccountsHaveSettings[acc.id] = { settingsAreSet: false };
  }

  try {
    const settingsPerAccount: any[] = await sequelize.models.settings.findAll({
      where: { customerId: { $in: accountsToQuery } }
    });

    for (const setting of settingsPerAccount) {
      const accId: number = +setting.customerId;

      doAccountsHaveSettings[accId].settingsAreSet =
        setting.current &&
        setting.current.registrationsFrequency !== undefined && Object.keys(setting.current.registrationsFrequency).length > 0 &&
        setting.current.expectedWeeklyWaste !== undefined && Object.keys(setting.current.expectedWeeklyWaste).length > 0;
    }

    /*
     * Deep clone the 'accounts' object and then assign to it the corresponding 'settingsAreSet' property and value
     */
    const accountsWithFlag: Account[] = JSON.parse(JSON.stringify(accounts)).map(acc =>
      Object.assign(acc, doAccountsHaveSettings[acc.id.toString()])
    );

    return accountsWithFlag;

  } catch (err) {
    throw new errors.GeneralError('Could not retrieve Settings or set flag for the subscribed accounts of the ' +
      'customer',
      {
        errors: err,
        requestId: logParams.requestId,
        sessionId: logParams.sessionId,
        subModule: 'settings-util',
        accounts: accountsToQuery,
        customerId: logParams.query.customerId || logParams.data.customerId,
        errorCode: 'E216'
      });
  }
}
