import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';

export const before = {
  all: [authVerifyToken()],
  find: [],
  get: [],
  create: [populateUserAndCostumer()],
  remove: []
};

export const after = {
  all: [],
  find: [],
  get: [],
  create: [],
  remove: []
};

export const error = {
  all: [],
  find: [],
  get: [],
  create: [],
  remove: []
};
