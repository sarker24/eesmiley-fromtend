import * as errors from '@feathersjs/errors';
import { Hook, HookContext } from '@feathersjs/feathers';
import Settings = SettingsNamespace.CurrentSettings;
import AlarmRecipient = SettingsNamespace.AlarmRecipient;

const subModule = 'filter-settings-properties';
let requestId: string;
let sessionId: string;

/**
 * Before-hook for: CREATE
 *
 * @return {any}
 */
export default (): Hook => {
  return async (hook: HookContext): Promise<HookContext> => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    const input: Settings = hook.data.settings;

    if (!input || !input.alarms || !input.alarms.recipients || input.alarms.recipients.length === 0) {
      return hook;
    }

    input.alarms.recipients = filterNonNumericCharsFromPhoneNumber(input.alarms.recipients);

    return hook;
  };
};

/**
 * Remove the non-numeric characters from the phone number, which is the value of the recipient of the alarm
 *
 * @param {AlarmRecipient[]} recipients
 */
export function filterNonNumericCharsFromPhoneNumber(recipients: AlarmRecipient[]) {
  for (const recipient of recipients) {
    if (recipient.type === 'sms') {
      try {
        recipient.value = recipient.value.replace(/\D/g, '');
      } catch (err) {
        throw new errors.GeneralError('Could not filter alarm phone number for user', {
          subModule, requestId, sessionId, recipient, errorCode: 'E236'
        });
      }
    }
  }

  return recipients;
}
