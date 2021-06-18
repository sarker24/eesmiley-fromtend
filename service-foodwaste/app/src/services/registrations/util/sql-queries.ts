/* istanbul ignore file */

export const accountsSettings = (accountsIds: string[]) => ({
  attributes: ['customerId', 'current'],
  where: {
    customerId: {
      $in: accountsIds
    }
  },
  raw: true,
  timestamps: false
});

export const getRegsCostByDistinctDate = (start: string, end: string, accountIds: string[], sequelize) => ({
  attributes: [
    ['customer_id', 'customerId'],
    [sequelize.fn('SUM', sequelize.col('cost')), 'cost'],
    'date'
  ],
  where: {
    date: {
      $gte: start,
      $lte: end
    },
    customerId: {
      $in: accountIds
    }
  },
  group: ['customer_id', 'date'],
  order: [[sequelize.literal('customer_id'), 'ASC']],
  raw: true,
  timestamps: false
});


export const registrationsDaysPerAccount =
  'SELECT customer_id, COUNT("interval") as registrationDaysForPeriod ' +
  'FROM   (SELECT customer_id, ' +
  '               date_trunc(\'day\', date) as interval ' +
  '       FROM  registration  ' +
  '       WHERE date >= :start ' +
  '             AND date <= :end ' +
  '             AND customer_id IN ( :customerIds ) ' +
  '             AND deleted_at IS NULL' +
  '       GROUP BY interval, customer_id) as customerRegDays ' +
  'GROUP BY customer_id ';


export const medianAcrossAllRegistrationPointCost = (accountIds: string[], sequelize) => ({
  attributes: [
    ['customer_id', 'customerId'],
    [sequelize.fn('median', sequelize.col('cost_per_kg')), 'median']
  ],
  where: {
    customerId: {
      $in: accountIds
    }
  },
  group: ['customerId'],
  raw: true,
  timestamps: false
});
