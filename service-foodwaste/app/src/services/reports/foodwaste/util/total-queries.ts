/*
  Probably could be optimized with recursive queries / db functions / views

  Registration point phases:
  1  Traverse Down phase:
    i. query subtrees of selected points
    ii. query registrations for the subtrees
  2. Traverse Up phase:
    i. query target labels (area, category)
    ii. group by target (take into account points without categories and/or areas)
 */

import {
  Dimension,
  Dimensions,
  subtreeAllNodesQuery,
  subtreeWithFilterQuery,
  targetLabelJoinQueryFn,
  subtreeRegistrationByDateQueryFn,
  subtreeRegistrationInPeriodQueryFn,
  subtreeRegistrationQueryFn
} from './common-queries';
import { SortOrder } from '../../../../util/constants';

export interface QueryOptions {
  dimension: Dimension;
  order?: string;
  guestTypeId?: number[];
}

const byAreaQueryFn = (subtreeRegistrationQuery: string, { dimension, order }: QueryOptions) =>
  'SELECT COALESCE(t.name, \'-\') AS name, COALESCE(SUM(t.amount),0)::BIGINT AS total, COALESCE(AVG(t.amount), 0)::FLOAT AS avg, COALESCE(MIN(t.amount), 0)::BIGINT AS min, COALESCE(MAX(t.amount), 0)::BIGINT AS max,' +
  '(array_agg(json_build_object(\'date\', t.date, \'amount\', COALESCE(t.amount,0)::BIGINT) ORDER BY t.date DESC, t.amount ' + order + ')) AS registrations FROM (' +
  `SELECT area.name AS name, date_trunc(:period, pr.date)::DATE AS date, COALESCE(SUM(pr.${Dimensions[dimension].valueCol}),0) AS amount, ` +
  '(array_agg(json_build_object(\'date\', pr.date, \'amount\', pr.amount) ORDER BY pr.date DESC)) AS registrations ' +
  'FROM (' + subtreeRegistrationQuery + ') AS pr ' +
  targetLabelJoinQueryFn('area') +
  `GROUP BY area.name, date_trunc(:period, pr.date) ` +
  ') AS t ' +
  'GROUP BY t.name ORDER BY sum(t.amount) ' + order;

/*
 Query for fetching registrations in the given time range, grouped by area.
 Each area will include json array of top 3 categories (if any)
 */
const byAreaAndTopCategoriesQueryFn = (subtreeRegistrationQuery: string, { dimension, order }: QueryOptions) =>
  'SELECT COALESCE(t.area_name, \'-\') AS name, SUM(t.amount)::BIGINT AS total, AVG(t.amount)::FLOAT AS avg, MIN(t.amount)::BIGINT AS min, MAX(t.amount)::BIGINT AS max, ' +
  '(array_agg(json_build_object(\'name\', COALESCE(t.cat_name, \'-\'), \'amount\', t.amount::BIGINT) ' +
  'ORDER BY t.amount ' + order + ', t.cat_name)) AS categories ' +
  'FROM (' +
  `SELECT area.name AS area_name, category.name as cat_name, SUM(pr.${Dimensions[dimension].valueCol}) AS amount ` +
  'FROM (' + subtreeRegistrationQuery + ') AS pr ' +
  targetLabelJoinQueryFn('area') +
  targetLabelJoinQueryFn('category') +
  'GROUP BY area.name, category.name ' +
  ') AS t ' +
  'WHERE t.amount > 0 ' +
  'GROUP BY t.area_name ORDER BY sum(t.amount) ' + order + ', t.area_name';

const registrationsTotalQueryFn = (registrationQuery, { dimension }: QueryOptions) =>
  `SELECT date_trunc(:period, period.start)::DATE AS date, COALESCE(SUM(r.${Dimensions[dimension].valueCol}), 0)::BIGINT AS amount FROM ` +
  '(SELECT period.date::DATE as start, (period.date + :periodInterval::INTERVAL - \'1 day\'::INTERVAL)::DATE as end from generate_series(:from::date, :to::date, :periodInterval) as period(date)) as period ' +
  'LEFT JOIN (' + registrationQuery + ') AS r ON r.date BETWEEN period.start and period.end ' +
  'GROUP BY date_trunc(:period, period.start) ' +
  'ORDER BY date_trunc(:period, period.start)::DATE DESC';

const totalsPerAccountQueryFn = (registrationQuery, { dimension, order }: QueryOptions) =>
  'SELECT customers.id AS "customerId", COALESCE(s.current->>\'name\', r.customer_id::TEXT) AS name, COALESCE(r.amount, 0)::BIGINT AS total FROM ' +
  '(SELECT UNNEST(ARRAY[:customerIds]::bigint[])::bigint as id) AS customers ' +
  'LEFT JOIN ' +
  `(SELECT r0.customer_id, COALESCE(SUM(r0.${Dimensions[dimension].valueCol}),0) AS amount FROM ` +
  '(' + registrationQuery + ') AS r0 ' +
  'GROUP BY r0.customer_id) AS r on r.customer_id = customers.id ' +
  'LEFT JOIN settings s ON s.customer_id = customers.id ' +
  'ORDER BY r.amount ' + order + (order === SortOrder.desc ? ' NULLS LAST' : ' NULLS FIRST') + ', customers.id ASC';

function overviewQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const subtreeRegistrationQuery = subtreeRegistrationQueryFn(subtreeQuery);
  return byAreaAndTopCategoriesQueryFn(subtreeRegistrationQuery, options);
}

// maybe better to return by account id? any value in that?
function statusQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationInPeriodQueryFn(subtreeQuery);
  return byAreaQueryFn(registrationQuery, options);
}

function topMetricQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationByDateQueryFn(subtreeQuery);
  return registrationsTotalQueryFn(registrationQuery, options);
}

function perAccountQuery(registrationPoints, options: QueryOptions): string {
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationQueryFn(subtreeQuery);
  return totalsPerAccountQueryFn(registrationQuery, options);
}

export { overviewQuery, statusQuery, topMetricQuery, perAccountQuery };


