import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';

/**
 * @url /projects/:projectId/timeline
 */
export const before = {
  all: [authVerifyToken(), populateUserAndCostumer()],
/**
 * A timeline for a give projectId
 * @name Find timeline for projects
 * @returns
 * [ { period: 2,
 *   type: 'registration',
 *   createdAt: '2018-09-10 18:47:00',
 *   data:
 *    { date: '2018-09-10',
 *      createdAt: '2018-09-10 18:47:00',
 *      updatedAt: '2018-09-04 12:32:57',
 *      id: '10057',
 *      customerId: '1',
 *      userId: '1',
 *      amount: 2100,
 *      unit: 'kg',
 *      currency: 'DKK',
 *      kgPerLiter: null,
 *      cost: '1234',
 *      comment: null,
 *      manual: true,
 *      scale: null,
 *      deletedAt: null,
 *      areaId: '10001',
 *      productId: '10001',
 *      project_registration: [Object],
 *      product: [Object],
 *      area: [Object] } },
 * { period: 2,
 *  type: 'period',
 *  createdAt: '2018-09-06 18:47:00',
 *  data:
 *   { createdAt: '2018-09-06 18:47:00',
 *     updatedAt: '2018-09-04 12:32:57',
 *     deletedAt: null,
 *     id: '10034',
 *     parentProjectId: '10033',
 *     name: 'Project Name',
 *     duration: [Object],
 *     status: 'RUNNING',
 *     areas: [Array],
 *     period: 2,
 *     products: [Array],
 *     actions: [Array],
 *     userId: '1',
 *     customerId: '1',
 *     active: true } },
 * { period: 2,
 *  type: 'action',
 *  createdAt: '2018-09-06 18:40:00',
 *  data:
 *   { createdAt: '2018-09-06 18:40:00',
 *     updatedAt: '2018-09-04 12:32:57',
 *     deletedAt: null,
 *     id: '10005',
 *     name: 'Stop cooking bad food',
 *     description: 'Taking the trash and put it in the trashcan',
 *     userId: '1',
 *     customerId: '1' } },
 * { period: 1,
 *  type: 'registration',
 *  createdAt: '2018-09-05 18:47:00',
 *  data:
 *   { date: '2018-09-05',
 *     createdAt: '2018-09-05 18:47:00',
 *     updatedAt: '2018-09-04 12:32:57',
 *     id: '10056',
 *    customerId: '1',
 *      userId: '1',
 *      amount: 2100,
 *     unit: 'kg',
 *     currency: 'DKK',
 *     kgPerLiter: null,
 *     cost: '1234',
 *     comment: null,
 *     manual: true,
 *     scale: null,
 *     deletedAt: null,
 *     areaId: '10001',
 *     productId: '10001',
 *     project_registration: [Object],
 *     product: [Object],
 *     area: [Object] } },
 * { period: 1,
 *  type: 'registration',
 *  createdAt: '2018-09-03 18:47:00',
 *  data:
 *   { date: '2018-09-03',
 *     createdAt: '2018-09-03 18:47:00',
 *     updatedAt: '2018-09-04 12:32:57',
 *     id: '10055',
 *     customerId: '1',
 *     userId: '1',
 *     amount: 2100,
 *     unit: 'kg',
 *     currency: 'DKK',
 *     kgPerLiter: null,
 *     cost: '1234',
 *     comment: null,
 *     manual: true,
 *     scale: null,
 *     deletedAt: null,
 *     areaId: '10001',
 *     productId: '10001',
 *     project_registration: [Object],
 *     product: [Object],
 *     area: [Object] } },
 * { period: 1,
 *  type: 'project',
 *  createdAt: '2018-09-03 18:46:00',
 *  data:
 *   { createdAt: '2018-09-03 18:46:00',
 *     updatedAt: '2018-09-04 12:32:57',
 *     deletedAt: null,
 *     id: '10033',
 *     parentProjectId: null,
 *     name: 'Project Name',
 *     duration: [Object],
 *     status: 'RUNNING_FOLLOWUP',
 *     areas: [Array],
 *     period: 1,
 *     products: [Array],
 *     actions: [Array],
 *     userId: '1',
 *     customerId: '1',
 *     active: true } } ]
 *
 *
 */
  find: []
};

export const after = {
  all: [],
  find: []
};

export const error = {
  all: [],
  find: []
};

