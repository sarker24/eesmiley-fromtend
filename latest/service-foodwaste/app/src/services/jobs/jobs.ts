import * as errors from '@feathersjs/errors';
import * as moment from 'moment-timezone';
import { v4 as uuid } from 'uuid';
import * as queries from './util/sql-queries';
import * as commons from 'feathers-commons-esmiley';
import Redlock from 'redlock';

export interface Alarm {
  enabled: boolean;
  executionTime: string;
  zone: string;
  message: string;
  recipients: Recipient[];
}

export interface Recipient {
  type: AlarmType;
  value: string;
  name: string;
}

export interface AccountData {
  customer_id: string;
  testaccount: boolean;
  alarm: Alarm;
  regs_frequency: any;
  regs_count: number;
  lang: string | null;
}

export type AlarmType = 'sms' | 'email';

const KEY: string = 'foodwaste:lock';
const TTL: number = 60000;
const ALARM_TYPE_EMAIL: AlarmType = 'email';
const CPSMS_SEND_ENDPOINT: string = 'https://api.cpsms.dk/v2/send';
const MANDRILL_SEND_ENDPOINT: string = 'http://mandrillapp.com/api/1.0/messages/send-template.json';
const translations: any = {};
const subModule: string = 'jobs-alarms';
let requestId: string;

export default class Jobs {
  private readonly redis;
  private readonly sequelize;
  private readonly redlock;

  public constructor(private readonly app: any) {
    this.redis = this.app.get('redisClient');
    this.sequelize = this.app.get('sequelize');
    /*
     * retryCount: the max number of times Redlock will attempt to lock a resource before throwing an error
     * retryDelay: the time in ms between attempts
     * retryJitter: the max time in ms randomly added to retries
     *
     * The values are low, because if the actual job execution takes a very short time, the job will finish and the
     * instance that acquired the lock will release it before the other instances are done attempting to acquire it.
     * This way the other instances will follow up by re-executing the job.
     */
    this.redlock = new Redlock([this.redis], { retryCount: 2, retryDelay: 100, retryJitter: 50 });
  }

  /**
   * This actually does not create a Job entity record. It is just the POST endpoint for the Job service, following the
   * FeathersJS standards.
   *
   * 1. Retrieves a list of account settings which have alarm (that are "enabled = true"), along with their
   *    registrations for the day and the "registrationsFrequency" settings
   * 2. Acquires a lock in Redis, which is shared among all running instances of the FW service.
   * 3. Executes the alarm
   * 4. Stores a log entry for the executed alarm in the account's settings.job_log entity column
   * 5. Releases the lock
   *
   * @return {Promise<void>}
   */
  public async create() {
    requestId = uuid();
    const currentTime: string = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const randomWaitTimeMs: number = Jobs.randomIntInterval(10, 100);

    let lock: any;
    try {
      /*
       * Wait a random time (10-100 ms) before attempting to acquire the distributed lock.
       * This way we try to mitigate the chance of two instances acquiring it simultaneously.
       */
      await Jobs.sleep(randomWaitTimeMs);

      lock = await this.redlock.lock(KEY, TTL);

    } catch (err) {
      log.warn({
        currentTime, subModule, requestId, err
      }, 'Lock already acquired from another instance. Exiting...');

      return;
    }

    log.info({
      currentTime, subModule, requestId
    }, 'Running alarms job...');

    let accountsWithAlarmAndRegs: AccountData[];
    const dow: number = moment.utc().day();
    const dateToday: string = moment.utc().format('YYYY-MM-DD');

    try {
      accountsWithAlarmAndRegs = await this.sequelize.query(queries.getAlarmAndRegsFrequency, {
        replacements: { dateToday },
        type: this.sequelize.QueryTypes.SELECT
      });
    } catch (err) {
      throw new errors.GeneralError('Could not get alarm and registrations of accounts', {
        subModule, requestId, dateToday, errors: err, errorCode: 'E227'
      });
    }

    if (accountsWithAlarmAndRegs.length <= 0) {
      log.info({
        subModule, requestId
      }, 'No alarms to execute. Exiting...');
      return;
    }

    let alarmsCount: number = 0;
    let alarmsExecuted: number = 0;

    /*
     * We execute the alarm if:
     * 1. The registrations frequency settings specify that the account must register foodwaste on today's day of the week
     * 2. The account has NOT yet registered foodwaste today
     * 3. The alarm's execution time (hour) is actually the current hour
     */
    for (const accountData of accountsWithAlarmAndRegs) {
      if (process.env.ENVIRONMENT !== 'production' && !accountData.testaccount) {
        continue;
      }

      alarmsCount += accountData.alarm.recipients.length;

      const regsFrequency: any = accountData.regs_frequency;
      const regsFrequencyDates: any = Object.keys(regsFrequency);
      const lastRegsFrequencyDateSetting: string = regsFrequencyDates[regsFrequencyDates.length - 1];
      /*
       * If the timezone is invalid, then moment will use its default timezone (which is the timezone of the host).
       * The Docker container which hosts the app uses UTC by default.
       */
      const currentHour: number = moment.tz(accountData.alarm.zone).hour();

      /*
       * Omit alarming, if the account has regs frequency settings AND the current day doesn't fall within the set days
       */
      if (regsFrequency[lastRegsFrequencyDateSetting]
        && !regsFrequency[lastRegsFrequencyDateSetting].includes(dow)) {
        continue;
      }

      /*
       * Omit alarming, if the account has made registrations today OR the execution time of the alarm is different than
       * the current hour
       */
      if (+accountData.regs_count > 0 || +accountData.alarm.executionTime !== currentHour) {
        continue;
      }

      log.info({
        alarm: accountData.alarm, subModule, requestId
      }, 'Processing an alarm...');

      /*
       * If there's a language from the settings and its translations haven't been loaded yet - load them.
       * Otherwise set the language to default 'en' and load the 'en' translations (if not loaded already).
       */
      const loadEnTranslations = () => {
        accountData.lang = 'en';

        if (!translations['en']) {
          translations['en'] = require(`../../../translations/en.json`);
        }
      };

      if (accountData.lang) {
        if (!translations[accountData.lang.toLowerCase()]) {
          const language: string = accountData.lang.toLowerCase();
          try {
            translations[language] = require(`../../../translations/${language}.json`);
          } catch (err) {
            log.error({
              language, requestId, subModule, customerId: accountData.customer_id
            }, 'Language translations file does not exist. Default to "en"');

            loadEnTranslations();
          }
        }
      } else {
        loadEnTranslations();
      }

      for (const recipient of accountData.alarm.recipients) {
        let isJobSuccessful: boolean = false;

        try {
          const { uri, token, body } = Jobs.constructRequestParams(accountData, recipient);

          log.info({ subModule, recipient, requestId },
            `Sending an alarm: ${recipient.type}`);

          await commons.makeHttpRequest(
            uri,
            { ContentType: 'application/json', Authorization: token },
            body,
            'POST'
          );

          isJobSuccessful = true;
          alarmsExecuted++;

        } catch (err) {
          log.error({
            subModule,
            requestId,
            customerId: accountData.customer_id,
            recipient,
            errors: recipient.type === ALARM_TYPE_EMAIL ? err.errors.error : err.errors.error.error
          }, `Could not send out the alarm: ${recipient.type}`);
        }

        const logLine: any = {};
        try {
          /*
           * We store logs of each executed job, per account. It is stored in the Settings.job_log entity column
           * under the format: "<current date and time>": {<the alarm object>}
           */
          logLine[moment.utc().format('YYYY-MM-DD HH:mm:ss')] = {
            success: isJobSuccessful,
            executionTime: accountData.alarm.executionTime,
            message: accountData.alarm.message,
            timezone: accountData.alarm.zone,
            recipient
          };

          await this.sequelize.query(queries.updateJobLog, {
            replacements: { alarm: JSON.stringify(logLine), customerId: accountData.customer_id },
            type: this.sequelize.QueryTypes.UPDATE
          });
        } catch (err) {
          log.error({
            subModule, requestId, logLine, errors: err
          }, 'Could not store metadata log for an executed job');
        }
      }
    }

    try {
      /*
       * Wait a certain time (ms) to remove the chance of the job finishing and releasing the lock before the other
       * instances have finished trying to acquire the lock, in case the job takes too short time to execute.
       */
      await Jobs.sleep(200);

      await lock.unlock();

    } catch (err) {
      throw new errors.GeneralError('Could not release lock. Will be released at expiry time', {
        subModule, requestId, errors: err, errorCode: 'E229'
      });
    }

    log.info({
      time: moment.utc().format('YYYY-MM-DD HH:mm:ss'), alarmsCount, alarmsExecuted, subModule, requestId
    }, 'Finished alarms job');
  }

  /**
   * Constructs the parameters (headers, payload) for sending out to the Mail or SMS 3rd parties
   *
   * @param {AccountData} data    The whole data object of the account, retrieved from the database
   * @param {Recipient}   recipient   The specific recipient, to which to send out an alarm
   * @return {any}
   */
  public static constructRequestParams(data: AccountData, recipient: Recipient): any {
    let uri: string;
    let token: string;
    let body: any;
    const from: string = 'eSmiley';
    const defaultLangTexts = translations[data.lang] ? translations[data.lang] : {
      'dear': 'Dear',
      'alarm.email.subject': 'Remember to register food waste',
      'customer.title': 'Customer'
    };
    const defaultMessage: string = defaultLangTexts['alarm.email.subject'];
    const addEnvMsg: string = data.testaccount ? ` ENV: ${process.env.ENVIRONMENT}` : '';
    const message: string = data.alarm.message && data.alarm.message.length > 0 ?
      data.alarm.message + addEnvMsg : defaultMessage + addEnvMsg;


    if (recipient.type === ALARM_TYPE_EMAIL) {
      uri = MANDRILL_SEND_ENDPOINT;
      token = process.env.MANDRILL_AUTH_TOKEN;
      body = {
        key: process.env.MANDRILL_AUTH_TOKEN,
        template_name: 'Register_Foodwaste_Reminder',
        template_content: [{ name: 'I do not know', content: 'what this is about' }],
        message: {
          from_email: 'support@e-smiley.dk',
          from_name: from,
          to: [{ email: recipient.value }
          ],
          subject: defaultLangTexts['alarm.email.subject'],
          text: message,
          global_merge_vars: [
            { name: 'DEAR', content: defaultLangTexts['dear'] },
            { name: 'FIRSTNAME', content: defaultLangTexts['customer.title'] },
            { name: 'CONTENT', content: data.alarm.message }
          ],
          track_opens: true,
          track_clicks: true,
          auto_text: true,
          url_strip_qs: true
        }
      };
    } else {
      uri = CPSMS_SEND_ENDPOINT;

      const tokenString: string = `${process.env.CPSMS_AUTH_USERNAME}:${process.env.CPSMS_AUTH_TOKEN}`;
      token = `Basic ${Buffer.from(tokenString).toString('base64')}`;
      body = { to: recipient.value, message, from, format: 'UNICODE' };
    }

    return { uri, token, body };
  }

  /**
   * Generate a random int, ranging between the min and max values
   *
   * @param {number}  min
   * @param {number}  max
   */
  private static randomIntInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Sleep the process for the given amount of time
   *
   * @param {number}  ms
   */
  private static sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

}
