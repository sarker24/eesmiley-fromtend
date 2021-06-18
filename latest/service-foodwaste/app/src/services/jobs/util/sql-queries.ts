/**
 * Get the Settings records where there's an `alarm` property in the `current` object.
 * Then JOIN these Settings records with Registration records, on the `customer_id` and get the number of registrations
 * made for the given date. If there are no regs made, then return 0.
 *
 * Return the `alarm` object, the regs count and some other data.
 *
 * @type {string}
 */
export const getAlarmAndRegsFrequency: string =
  'SELECT ' +
  ' s.customer_id,  ' +
  ' s.current::jsonb->\'isTestAccount\' AS testaccount, ' +
  ' s.current::jsonb->\'alarms\' AS alarm, ' +
  ' s.current::jsonb->\'registrationsFrequency\' AS regs_frequency, ' +
  ' s.current::jsonb->\'languageBootstrapData\' AS lang, ' +
  ' COALESCE(r.reg_ct, 0) AS regs_count ' +
  'FROM settings s ' +
  'LEFT JOIN LATERAL ( ' +
  '   SELECT count(*) AS reg_ct ' +
  '   FROM registration ' +
  '   WHERE customer_id = s.customer_id ' +
  '   AND date = :dateToday ' +
  '   AND deleted_at IS NULL' +
  '   ) r ON true ' +
  'WHERE ' +
  '   s.current::jsonb->\'alarms\' IS NOT NULL AND ' +
  '   s.current::jsonb#>\'{alarms,enabled}\' = \'true\';';

/**
 * Update the JSONB column `job_log` in the Settings entity by concatenating it with an additional piece of JSON object.
 *
 * @type {string}
 */
export const updateJobLog: string = 'UPDATE settings ' +
  'SET job_log = ' +
  ' (SELECT job_log::jsonb || :alarm::jsonb FROM settings WHERE customer_id = :customerId) ' +
  'WHERE customer_id = :customerId;';
