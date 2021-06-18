const registrationDaysPerWeekQuery =
  'SELECT AVG(t.reg_days_in_week)::FLOAT AS avg_reg_days FROM ' +
  '(SELECT DATE_TRUNC(\'week\', date) AS week, COUNT(DISTINCT date) AS reg_days_in_week FROM registration ' +
  'WHERE customer_id IN (:customerId) AND deleted_at IS NULL AND date BETWEEN :from::DATE AND :to::DATE GROUP BY DATE_TRUNC(\'week\', date)) AS t';

const registrationsPerDayQuery =
  'SELECT AVG(regs_per_day)::FLOAT AS avg_regs_per_day FROM ' +
  '(SELECT COUNT(*) AS regs_per_day FROM registration ' +
  'WHERE customer_id IN (:customerId) AND deleted_at IS NULL AND date BETWEEN :from::DATE AND :to::DATE group by date) AS t';

/*
 Return frequency top metrics, if no records exist, returns
 0 values
 */
const topMetricQuery =
  'SELECT COALESCE(days_per_week.avg_reg_days, 0) as "avgRegistrationDaysPerWeek", COALESCE(regs_per_day.avg_regs_per_day, 0) AS "avgRegistrationsPerDay" FROM ' +
  `(${registrationDaysPerWeekQuery}) as days_per_week ` +
  'LEFT JOIN ' +
  `(${registrationsPerDayQuery}) as regs_per_day ON true`;

export { topMetricQuery };
