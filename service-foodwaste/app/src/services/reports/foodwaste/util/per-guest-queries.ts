import {
  Dimension,
  Dimensions,
  subtreeAllNodesQuery,
  subtreeWithFilterQuery,
  targetLabelJoinQueryFn,
  subtreeRegistrationByPeriodFn,
  subtreeRegistrationInPeriodQueryFn,
  subtreeRegistrationQueryFn,
} from './common-queries';
import { QueryOptions } from './total-queries';

const guestsByPeriodQuery = (guestTypeId: number[] = []) =>
  'SELECT date_trunc(:period, period.start)::DATE as date, SUM(g.amount) as guest_amount FROM ' +
  '(SELECT period.date::DATE as start, (period.date + :periodInterval::INTERVAL - \'1 day\'::INTERVAL)::DATE as end from generate_series(:from::date, :to::date, :periodInterval) as period(date)) as period ' +
  'JOIN (select g.date as date, g.amount as amount from guest_registration g ' +
  'WHERE g.customer_id IN (:customerIds) ' +
  `${guestTypeId.length > 0 ? `AND g.guest_type_id IN (${guestTypeId.join(',')}) ` : ''}` +
  'AND g.deleted_at IS NULL ' +
  'AND g.date BETWEEN CAST(:from AS date) AND CAST(:to AS date) ' +
  'AND g.amount > 0 AND g.deleted_at IS NULL) as g ' +
  'ON g.date between period.start and period.end ' +
  'GROUP BY date_trunc(:period, period.start)';

const guestsInPeriodQuery = (guestTypeId: number[] = []) =>
  'SELECT SUM(g.amount) as guest_amount ' +
  'FROM guest_registration g ' +
  'WHERE g.customer_id IN (:customerIds) ' +
  `${guestTypeId.length > 0 ? `AND g.guest_type_id IN (${guestTypeId.join(',')}) ` : ''}` +
  'AND g.deleted_at IS NULL ' +
  'AND g.date BETWEEN CAST(:from AS date) AND CAST(:to AS date) ' +
  'AND g.amount > 0 AND g.deleted_at IS NULL';

const guestsByCustomerQuery = (guestTypeId: number[] = []) =>
  'SELECT customer_id, SUM(g.amount) as guest_amount ' +
  'FROM guest_registration g ' +
  'WHERE g.customer_id IN (:customerIds) ' +
  `${guestTypeId.length > 0 ? `AND g.guest_type_id IN (${guestTypeId.join(',')}) ` : ''}` +
  'AND g.deleted_at IS NULL ' +
  'AND g.date BETWEEN CAST(:from AS date) AND CAST(:to AS date) ' +
  'AND g.amount > 0 AND g.deleted_at IS NULL ' +
  'GROUP BY g.customer_id';

const byAreaQuery = (subQuery) =>
  'SELECT area.name AS name, date_trunc(:period, pr.date)::DATE AS date, SUM(pr.co2) as co2, SUM(pr.cost) AS cost, SUM(pr.amount) AS amount ' +
  'FROM (' + subQuery + ') AS pr ' +
  targetLabelJoinQueryFn('area') +
  'GROUP BY area.name, date_trunc(:period, pr.date)';

const byAreaAndCategoryQuery = (subQuery) =>
  'SELECT area.name AS area_name, category.name AS cat_name, SUM(pr.co2) as co2, SUM(pr.cost) AS cost, SUM(pr.amount) AS amount ' +
  'FROM (' + subQuery + ') AS pr ' +
  targetLabelJoinQueryFn('area') +
  targetLabelJoinQueryFn('category') +
  'GROUP BY area.name, category.name';

/*
 Fetch per-guest registration grouped by area and list of periods.
* */
const byAreaQueryFn = (subtreeRegistrationQuery: string, { dimension, order, guestTypeId }: QueryOptions) =>
  'SELECT COALESCE(t.name, \'-\') as name, ' +
  'COALESCE(SUM(t.amount/t.guest_amount), 0)::FLOAT AS total, ' +
  'COALESCE(AVG(t.amount/t.guest_amount), 0)::FLOAT AS avg, ' +
  'COALESCE(MAX(t.amount/t.guest_amount), 0)::FLOAT AS max, ' +
  'COALESCE(MIN(t.amount/t.guest_amount), 0)::FLOAT AS min, ' +
  '(array_agg(json_build_object(\'date\', t.date, \'amount\', COALESCE(t.amount/t.guest_amount, 0)::FLOAT) ORDER BY t.date DESC, COALESCE(t.amount/t.guest_amount, 0) ' + order + ')) AS registrations FROM (' +
  `SELECT area.name AS name, area.date, CASE WHEN g.guest_amount IS NULL THEN 0 ELSE area.${Dimensions[dimension].valueCol} END amount, g.guest_amount as guest_amount ` +
  'FROM (' + byAreaQuery(subtreeRegistrationQuery) + ') AS area ' +
  'LEFT JOIN (' + guestsByPeriodQuery(guestTypeId) + ') AS g on g.date = area.date AND area.amount > 0 ' +
  ') AS t ' +
  'GROUP BY t.name ORDER BY COALESCE(SUM(t.amount)/SUM(t.guest_amount), 0) ' + order;

/*
 Fetch per-guest registration grouped by area and top 3 categories. This query doesnt need to be aware
 of period, since the period equals the time range (from, to params). Note guest_amount is shared
 among all categories, hence top-level query is grouped by area name and guest amount so that we
 dont calculate same guest amounts multiple times
* */
const byAreaAndTopCategoriesQueryFn = (subtreeRegistrationQuery: string, {
  dimension,
  order,
  guestTypeId
}: QueryOptions) =>
  'SELECT COALESCE(t.area_name, \'-\') AS name, ' +
  'COALESCE(SUM(t.amount)/t.guest_amount, 0)::FLOAT AS total, ' +
  'COALESCE(AVG(t.amount)/t.guest_amount, 0)::FLOAT as avg, ' +
  'COALESCE(MIN(t.amount)/t.guest_amount, 0)::FLOAT as min, ' +
  'COALESCE(MAX(t.amount)/t.guest_amount, 0)::FLOAT as max, ' +
  '(array_agg(json_build_object(\'name\', COALESCE(t.cat_name, \'-\'), \'amount\', COALESCE(t.amount/t.guest_amount, 0)) ' +
  'ORDER BY COALESCE(t.amount/t.guest_amount, 0) ' + order + ', t.cat_name))[1:3] AS categories ' +
  'FROM (' +
  `SELECT area_cat.area_name, area_cat.cat_name, area_cat.${Dimensions[dimension].valueCol} AS amount, g.guest_amount ` +
  'FROM (' + byAreaAndCategoryQuery(subtreeRegistrationQuery) + ') AS area_cat ' +
  'LEFT JOIN (' + guestsInPeriodQuery(guestTypeId) + ') AS g on true ' +
  ') AS t ' +
  'WHERE t.amount > 0 ' +
  'GROUP BY t.area_name, t.guest_amount ORDER BY COALESCE(SUM(t.amount)/t.guest_amount, 0) ' + order + ', t.area_name';

const registrationsTotalQueryFn = (registrationQuery: string, { dimension, guestTypeId }: QueryOptions) =>
  `SELECT date_trunc(:period, period.start)::DATE AS date, COALESCE(SUM(r.${Dimensions[dimension].valueCol}) / SUM(g.guest_amount), 0)::FLOAT AS amount FROM ` +
  '(SELECT period.date::DATE as start, (period.date + :periodInterval::INTERVAL - \'1 day\'::INTERVAL)::DATE as end from generate_series(:from::date, :to::date, :periodInterval) as period(date)) as period ' +
  'LEFT JOIN (' + registrationQuery + ') AS r ON date_trunc(:period, r.date)::DATE = date_trunc(:period, period.start)::DATE ' +
  'LEFT JOIN (' + guestsByPeriodQuery(guestTypeId) + ') AS g ON date_trunc(:period, g.date)::DATE = date_trunc(:period, period.start)::DATE ' +
  `GROUP BY date_trunc(:period, period.start) ` +
  'ORDER BY date_trunc(:period, period.start) DESC';

const totalsPerAccountQueryFn = (registrationQuery: string, { dimension, order, guestTypeId }: QueryOptions) =>
  'SELECT customers.id AS "customerId", COALESCE(s.current->>\'name\', r.customer_id::TEXT) AS name, COALESCE(r.amount/g.guest_amount, 0)::FLOAT AS total FROM ' +
  '(SELECT UNNEST(ARRAY[:customerIds]::bigint[])::bigint as id) AS customers ' +
  'LEFT JOIN ' +
  `(SELECT r0.customer_id, SUM(r0.${Dimensions[dimension].valueCol}) AS amount FROM ` +
  '(' + registrationQuery + ') AS r0 ' +
  'GROUP BY r0.customer_id) AS r on r.customer_id = customers.id ' +
  'LEFT JOIN (' + guestsByCustomerQuery(guestTypeId) + ') as g on g.customer_id = customers.id ' +
  'LEFT JOIN settings s ON s.customer_id = customers.id ' +
  'ORDER BY COALESCE(r.amount/g.guest_amount, 0) ' + order + ', customers.id ASC';

function overviewQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const subtreeRegistrationQuery = subtreeRegistrationQueryFn(subtreeQuery);
  return byAreaAndTopCategoriesQueryFn(subtreeRegistrationQuery, options);
}

function statusQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationInPeriodQueryFn(subtreeQuery);
  return byAreaQueryFn(registrationQuery, options);
}

function topMetricQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationByPeriodFn(subtreeQuery);
  return registrationsTotalQueryFn(registrationQuery, options);
}

function perAccountQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationQueryFn(subtreeQuery);
  return totalsPerAccountQueryFn(registrationQuery, options);
}

export { overviewQuery, statusQuery, topMetricQuery, perAccountQuery };


