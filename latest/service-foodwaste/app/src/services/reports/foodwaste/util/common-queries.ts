const Dimensions = Object.freeze({
  weight: {
    valueCol: 'amount'
  },
  cost: {
    valueCol: 'cost'
  },
  co2: {
    valueCol: 'co2'
  }
});

interface DimensionField {
  valueCol: string;
}

type Dimension = keyof typeof Dimensions;
type TargetLabel = 'area' | 'category';

enum LimitType {
  bottom = 'bottom',
  top = 'top'
}

type Limit = {
  limitType: LimitType;
  count: number;
};

const subtreeAllNodesQuery =
  'SELECT customer_id, name, id, path FROM registration_point ' +
  'WHERE customer_id in (:customerIds)';

// Query for fetching all points and their children points
const subtreeWithFilterQuery =
  'SELECT customer_id, name, id, path FROM registration_point ' +
  'WHERE customer_id IN (:customerIds) AND (' +
  'id IN (:registrationPointIds) OR ' +
  'path <@ (SELECT array_agg(COALESCE((path || id::TEXT::LTREE), id::TEXT::LTREE)) FROM registration_point WHERE id IN (:registrationPointIds))' +
  ')';

const subtreeRegistrationByPeriodFn = (subtreeQuery) =>
  `SELECT date_trunc(:period, period.start)::DATE as date, sum(r.amount)::BIGINT AS amount, sum(r.cost)::BIGINT AS cost, sum(r.co2)::BIGINT AS co2 FROM (` + subtreeQuery + ') AS p ' +
  'JOIN (SELECT period.date::DATE as start, (period.date + :periodInterval::INTERVAL - \'1 day\'::INTERVAL)::DATE as end from generate_series(:from::date, :to::date, :periodInterval) as period(date)) as period on TRUE ' +
  'JOIN registration r ON r.registration_point_id = p.id AND r.date BETWEEN period.start AND period.end ' +
  'WHERE r.deleted_at IS NULL AND r.date BETWEEN CAST(:from AS date) AND CAST(:to AS date) ' +
  `GROUP BY date_trunc(:period, period.start)`;

const subtreeRegistrationByDateQueryFn = (subtreeQuery) =>
  `SELECT p.id, p.path, r.date, sum(r.amount)::BIGINT AS amount, sum(r.cost)::BIGINT AS cost, sum(r.co2)::BIGINT AS co2 FROM (` + subtreeQuery + ') AS p ' +
  'JOIN registration r ON r.registration_point_id = p.id ' +
  'WHERE r.deleted_at IS NULL AND r.date BETWEEN CAST(:from AS date) AND CAST(:to AS date) ' +
  `GROUP BY p.id, p.path, r.date`;

const subtreeRegistrationInPeriodQueryFn = (subtreeQuery) =>
  `SELECT p.id, p.path, date_trunc(:period, period.start)::DATE as date, sum(r.amount)::BIGINT AS amount, sum(r.cost)::BIGINT AS cost, sum(r.co2)::BIGINT AS co2 FROM (` + subtreeQuery + ') AS p ' +
  'JOIN ' +
  '(SELECT period.date::DATE as start, (period.date + :periodInterval::INTERVAL - \'1 day\'::INTERVAL)::DATE as end from generate_series(:from::date, :to::date, :periodInterval) as period(date)) as period on TRUE ' +
  'LEFT JOIN (SELECT * from registration r ' +
  'WHERE r.deleted_at IS NULL AND r.date BETWEEN CAST(:from AS date) AND CAST(:to AS date)' +
  ') AS r ON r.registration_point_id = p.id AND r.date between period.start AND period.end ' +
  `GROUP BY p.id, p.path, date_trunc(:period, period.start)`;

const subtreeRegistrationQueryFn = subtreeQuery =>
  'SELECT p.customer_id, p.id, p.path, sum(r.amount)::BIGINT AS amount, sum(r.cost)::BIGINT AS cost, sum(r.co2)::BIGINT AS co2 FROM (' + subtreeQuery + ') AS p ' +
  'LEFT JOIN (SELECT * from registration r ' +
  'WHERE r.deleted_at IS NULL AND r.date BETWEEN CAST(:from AS date) AND CAST(:to AS date)' +
  ') AS r ON r.registration_point_id = p.id ' +
  'GROUP BY p.customer_id, p.id, p.path';

// picks topmost label (limit 1 & order path length) to avoid nested labels
const targetLabelJoinQueryFn = (label: TargetLabel) =>
  'LEFT JOIN LATERAL ' +
  `(SELECT * FROM registration_point ${label} ` +
  `WHERE ${label}.label = '${label}' AND (${label}.id = pr.id OR (pr.path IS NOT NULL AND ${label}.id = ANY(string_to_array(pr.path::TEXT, \'.\')::BIGINT[]))) ` +
  `ORDER BY nlevel(${label}.path) DESC NULLS LAST ` +
  'LIMIT 1 ' +
  `) AS ${label} ON TRUE `;

const accountIdsInLimitQueryFn = (registrationPoints: number[], dimension: Dimension, limit: Limit): string => {
  const valueCol = Dimensions[dimension].valueCol;
  const sort = limit.limitType === LimitType.bottom ? 'ASC NULLS FIRST' : 'DESC NULLS LAST';
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;
  const registrationQuery = subtreeRegistrationQueryFn(subtreeQuery);

  return 'SELECT pr.customer_id as id FROM ' +
    '(' + registrationQuery + ') AS pr ' +
    'GROUP BY pr.customer_id ' +
    `ORDER BY SUM(pr.${valueCol}) ${sort} ` +
    'LIMIT ' + limit.count;
};

const totalAmountQuery = (registrationPoints: number[], dimension: Dimension): string => {
  const valueCol = Dimensions[dimension].valueCol;
  const subtreeQuery = registrationPoints.length === 0 ? subtreeAllNodesQuery : subtreeWithFilterQuery;

  return `SELECT SUM(r.${valueCol})::BIGINT AS amount FROM (` + subtreeQuery + ') AS p ' +
    'LEFT JOIN (SELECT * from registration r ' +
    'WHERE r.deleted_at IS NULL AND r.date BETWEEN CAST(:from AS date) AND CAST(:to AS date)' +
    ') AS r ON r.registration_point_id = p.id';
};

export {
  Dimensions,
  Dimension,
  DimensionField,
  TargetLabel,
  Limit,
  subtreeAllNodesQuery,
  subtreeWithFilterQuery,
  subtreeRegistrationByDateQueryFn,
  subtreeRegistrationInPeriodQueryFn,
  subtreeRegistrationQueryFn,
  targetLabelJoinQueryFn,
  accountIdsInLimitQueryFn,
  totalAmountQuery,
  subtreeRegistrationByPeriodFn
};
