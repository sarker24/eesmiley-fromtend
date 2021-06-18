const registrationByCustomerAndDate =
  'SELECT date, customer_id, SUM(amount) AS amount, SUM(cost) AS cost ' +
  'FROM registration ' +
  'WHERE deleted_at IS NULL AND customer_id IN (:customerId) AND date BETWEEN :from::DATE AND :to::DATE ' +
  'GROUP BY date, customer_id';

const guestsByCustomerAndDate =
  'SELECT date AS date, customer_id, SUM(amount) AS amount ' +
  'FROM guest_registration ' +
  'WHERE deleted_at IS NULL AND customer_id IN (:customerId) AND date BETWEEN :from::DATE AND :to::DATE ' +
  'GROUP BY date, customer_id';

const salesByCustomerAndDate =
  'SELECT date, customer_id, SUM(income) AS income, SUM(portions) as portions ' +
  'FROM sale ' +
  'WHERE deleted_at IS NULL AND customer_id IN (:customerId) AND date BETWEEN :from::DATE AND :to::DATE ' +
  'GROUP BY date, customer_id';

export const getSalesQuery = 'SELECT ' +
  'sale.date as date, ' +
  'sale.customer_id as "customerId", ' +
  'sale.income::INT as income, ' +
  'sale.portions::INT as portions, ' +
  'ROUND(COALESCE(sale.income/NULLIF(sale.portions, 0), 0), 2)::FLOAT as "incomePerPortion", ' +
  'COALESCE(r.cost, 0)::INT as "foodwasteCost", ' +
  'COALESCE(r.amount, 0)::INT as "foodwasteAmount", ' +
  'ROUND(COALESCE(r.cost/NULLIF(sale.portions, 0), 0), 2)::FLOAT as "foodwasteCostPerPortion", ' +
  'ROUND(COALESCE(r.amount/NULLIF(sale.portions, 0), 0), 2)::FLOAT as "foodwasteAmountPerPortion", ' +
  'COALESCE(g.amount, 0)::INT as guests, ' +
  'ROUND(COALESCE(r.cost/NULLIF(g.amount, 0), 0), 2)::FLOAT as "foodwasteCostPerGuest", ' +
  'ROUND(COALESCE(r.amount/NULLIF(g.amount, 0), 0), 2)::FLOAT as "foodwasteAmountPerGuest", ' +
  'ROUND(COALESCE(sale.income/NULLIF(g.amount, 0), 0), 2)::FLOAT as "incomePerGuest" ' +
  'FROM ' +
  `(${salesByCustomerAndDate}) AS sale ` +
  `LEFT JOIN (${registrationByCustomerAndDate}) AS r ON sale.date = r.date AND sale.customer_id = r.customer_id ` +
  `LEFT JOIN (${guestsByCustomerAndDate}) AS g ON sale.date = g.date AND sale.customer_id = g.customer_id ` +
  'ORDER BY date';
